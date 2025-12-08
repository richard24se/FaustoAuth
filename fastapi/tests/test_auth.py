# fastapi/tests/test_auth.py
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock

from auth.model.models import User
from config.settings import settings
from fausto.jwt import encode_auth_token, encode_refresh_auth_token


@pytest.mark.asyncio
async def test_login_success(test_client: AsyncClient, test_user: int, mock_redis: AsyncMock):
    """
    Test successful user login.
    """
    login_data = {"username": "testuser", "password": "testpassword"}
    response = await test_client.post("/auth/login", json=login_data)

    assert response.status_code == 200
    assert response.json()["error"] is False
    assert "access_token" in response.json()["data"]
    assert response.json()["data"]["username"] == "testuser"

    # Verify Redis interaction
    mock_redis.set.assert_called_once()
    args, kwargs = mock_redis.set.call_args
    assert args[1] == "false"  # Token is not revoked
    assert "ex" in kwargs  # Expiration is set


@pytest.mark.asyncio
async def test_login_incorrect_password(test_client: AsyncClient, test_user: int):
    """
    Test login with incorrect password.
    """
    login_data = {"username": "testuser", "password": "wrongpassword"}
    response = await test_client.post("/auth/login", json=login_data)

    assert response.status_code == 401
    assert response.json()["error"] is True
    assert response.json()["msg"] == "Invalid username or password."


@pytest.mark.asyncio
async def test_login_non_existent_user(test_client: AsyncClient):
    """
    Test login with a non-existent user.
    """
    login_data = {"username": "nonexistent", "password": "anypassword"}
    response = await test_client.post("/auth/login", json=login_data)

    assert response.status_code == 401
    assert response.json()["error"] is True
    assert response.json()["msg"] == "Invalid username or password."


@pytest.mark.asyncio
async def test_logout_success(
    test_client: AsyncClient, test_user: int, mock_redis: AsyncMock
):
    """
    Test successful user logout (token revocation).
    """
    # First, log in to get a token
    login_data = {"username": "testuser", "password": "testpassword"}
    login_response = await test_client.post("/auth/login", json=login_data)
    access_token = login_response.json()["data"]["access_token"]

    # Reset mock_redis for logout call
    mock_redis.reset_mock()

    response = await test_client.post(
        "/auth/logout", headers={"Authorization": f"Bearer {access_token}"}
    )

    assert response.status_code == 200
    assert response.json()["error"] is False
    assert response.json()["msg"] == "User logout successful, token revoked."

    # Verify Redis interaction for revocation
    mock_redis.set.assert_called_once_with(
        access_token, "true", ex=settings.ACCESS_EXPIRES * 1.2
    )


@pytest.mark.asyncio
async def test_validate_token_valid(
    test_client: AsyncClient, test_user: int, mock_redis: AsyncMock
):
    """
    Test validation of a valid, non-revoked token.
    """
    # We need to fetch the user object from the database using the ID
    from auth.model.models import User as UserModel
    from config.databases import get_async_db as get_app_async_db
    async for session in get_app_async_db():
        user_obj = await session.get(UserModel, test_user)
        username = user_obj.username
        break

    access_token = encode_auth_token(username)
    # Store the token in mock_redis to simulate a valid, non-revoked token
    await mock_redis.set(access_token, "false", ex=settings.ACCESS_EXPIRES)
    # Mock Redis to return None, indicating token is not revoked
    mock_redis.get.return_value = "false" # Should return "false" if not revoked

    response = await test_client.get(
        "/auth/token/validate", headers={"Authorization": f"Bearer {access_token}"}
    )

    assert response.status_code == 200
    assert response.json()["error"] is False
    assert response.json()["msg"] == "Token is valid."
    mock_redis.get.assert_called_once_with(access_token)


@pytest.mark.asyncio
async def test_validate_token_revoked(
    test_client: AsyncClient, test_user: int, mock_redis: AsyncMock
):
    """
    Test validation of a revoked token.
    """
    # We need to fetch the user object from the database using the ID
    from auth.model.models import User as UserModel
    from config.databases import get_async_db as get_app_async_db
    async for session in get_app_async_db():
        user_obj = await session.get(UserModel, test_user)
        username = user_obj.username
        break

    access_token = encode_auth_token(username)
    # Mock Redis to return "true", indicating token is revoked
    mock_redis.get.return_value = "true"

    response = await test_client.get(
        "/auth/token/validate", headers={"Authorization": f"Bearer {access_token}"}
    )

    assert response.status_code == 403
    assert response.json()["error"] is True
    assert response.json()["msg"] == "Token has been revoked."
    mock_redis.get.assert_called_once_with(access_token)


@pytest.mark.asyncio
async def test_refresh_token_success(
    test_client: AsyncClient, test_user: int, mock_redis: AsyncMock
):
    """
    Test successful token refresh.
    """
    # We need to fetch the user object from the database using the ID
    from auth.model.models import User as UserModel
    from config.databases import get_async_db as get_app_async_db
    async for session in get_app_async_db():
        user_obj = await session.get(UserModel, test_user)
        username = user_obj.username
        break

    refresh_token = encode_refresh_auth_token(username)
    # Mock Redis to return None for the refresh token (not revoked)
    mock_redis.get.return_value = None
    # Mock Redis set for the new access token
    mock_redis.set.return_value = None  # redis_create_key returns "Saved successful!"

    response = await test_client.post(
        "/auth/token/refresh", headers={"Authorization": f"Bearer {refresh_token}"}
    )

    assert response.status_code == 200
    assert response.json()["error"] is False
    assert "access_token" in response.json()["data"]
    assert response.json()["data"]["refresh_token"] == refresh_token
    mock_redis.get.assert_called_once_with(refresh_token)
    mock_redis.set.assert_called_once()  # Called for the new access token


@pytest.mark.asyncio
async def test_refresh_token_with_access_token(
    test_client: AsyncClient, test_user: int
):
    """
    Test attempting to refresh with an access token instead of a refresh token.
    """
    # We need to fetch the user object from the database using the ID
    from auth.model.models import User as UserModel
    from config.databases import get_async_db as get_app_async_db
    async for session in get_app_async_db():
        user_obj = await session.get(UserModel, test_user)
        username = user_obj.username
        break

    access_token = encode_auth_token(username)

    response = await test_client.post(
        "/auth/token/refresh", headers={"Authorization": f"Bearer {access_token}"}
    )

    assert response.status_code == 403
    assert response.json()["error"] is True
    assert response.json()["msg"] == "An access token cannot be used for refresh."


@pytest.mark.asyncio
async def test_refresh_token_revoked(
    test_client: AsyncClient, test_user: int, mock_redis: AsyncMock
):
    """
    Test refreshing with a revoked refresh token.
    """
    # We need to fetch the user object from the database using the ID
    from auth.model.models import User as UserModel
    from config.databases import get_async_db as get_app_async_db
    async for session in get_app_async_db():
        user_obj = await session.get(UserModel, test_user)
        username = user_obj.username
        break

    refresh_token = encode_refresh_auth_token(username)
    # Mock Redis to return "true" for the refresh token (revoked)
    mock_redis.get.return_value = "true"

    response = await test_client.post(
        "/auth/token/refresh", headers={"Authorization": f"Bearer {refresh_token}"}
    )

    assert response.status_code == 403
    assert response.json()["error"] is True
    assert response.json()["msg"] == "This refresh token has been revoked."
    mock_redis.get.assert_called_once_with(refresh_token)