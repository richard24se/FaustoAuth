# fastapi/tests/test_user.py
import pytest_asyncio
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from auth.model.models import Role, User
from config.security import pwd_context
from config.databases import get_async_db as get_app_async_db


def create_test_user_data(test_role_id: int):
    """
    Helper function to provide valid user data for creation.
    """
    return {
        "username": "newuser",
        "password": "newpassword",
        "names": "New",
        "surnames": "User",
        "id_role": test_role_id,
    }


@pytest_asyncio.fixture
async def authenticated_client(test_client: AsyncClient, test_user: int, db_session: AsyncSession):
    """
    Fixture to provide an authenticated client.
    """
    # We need to fetch the user object from the database using the ID
    # This is a workaround because test_user fixture now returns an ID
    # and the login endpoint expects a username.
    # In a real scenario, the test_user fixture would return the full object.
    user_obj = await db_session.get(User, test_user)
    username = user_obj.username
    
    login_data = {"username": username, "password": "testpassword"}
    response = await test_client.post("/auth/login", json=login_data)
    access_token = response.json()["data"]["access_token"]
    test_client.headers["Authorization"] = f"Bearer {access_token}"
    return test_client


@pytest.mark.asyncio
async def test_create_user_success(authenticated_client: AsyncClient, test_role: int):
    """
    Test successful user creation.
    """
    user_data = create_test_user_data(test_role)
    response = await authenticated_client.post("/user/", json=user_data)

    assert response.status_code == 201
    assert response.json()["error"] is False
    assert response.json()["msg"] == "Saved successful!"


@pytest.mark.asyncio
async def test_create_user_duplicate_username(
    authenticated_client: AsyncClient, test_user: int, test_role: int
):
    """
    Test creating a user with an existing username.
    """
    # We need to fetch the user object from the database using the ID
    async for session in get_app_async_db():
        user_obj = await session.get(User, test_user)
        username = user_obj.username
        break

    user_data = create_test_user_data(test_role)
    user_data["username"] = username  # Use existing username
    response = await authenticated_client.post("/user/", json=user_data)

    assert response.status_code == 400
    assert response.json()["error"] is True
    assert "already exists" in response.json()["msg"]


@pytest.mark.asyncio
async def test_get_all_users(authenticated_client: AsyncClient, test_user: int):
    """
    Test retrieving all users.
    """
    # We need to fetch the user object from the database using the ID
    async for session in get_app_async_db():
        user_obj = await session.get(User, test_user)
        username = user_obj.username
        break

    response = await authenticated_client.get("/user/")

    assert response.status_code == 200
    assert response.json()["error"] is False
    assert isinstance(response.json()["data"], list)
    assert len(response.json()["data"]) > 0
    assert any(u["username"] == username for u in response.json()["data"])


@pytest.mark.asyncio
async def test_get_user_by_id(authenticated_client: AsyncClient, test_user: int):
    """
    Test retrieving a single user by ID.
    """
    response = await authenticated_client.get(f"/user/{test_user}")

    assert response.status_code == 200
    assert response.json()["error"] is False
    # We need to fetch the user object from the database using the ID
    async for session in get_app_async_db():
        user_obj = await session.get(User, test_user)
        username = user_obj.username
        break
    assert response.json()["data"]["username"] == username


@pytest.mark.asyncio
async def test_get_non_existent_user(authenticated_client: AsyncClient):
    """
    Test retrieving a non-existent user.
    """
    response = await authenticated_client.get("/user/99999")  # Assuming 99999 does not exist

    assert response.status_code == 404
    assert response.json()["error"] is True
    assert response.json()["msg"] == "User not found."


@pytest.mark.asyncio
async def test_update_user_success(
    authenticated_client: AsyncClient, db_session: AsyncSession, test_user: int
):
    """
    Test successful user update.
    """
    update_data = {"names": "UpdatedName"} # Removed email as it's commented out in model
    response = await authenticated_client.put(f"/user/{test_user}", json=update_data)

    assert response.status_code == 200
    assert response.json()["error"] is False
    assert response.json()["msg"] == "Update successful!"

    # Verify update in database
    result = await db_session.execute(select(User).filter_by(id=test_user))
    updated_user = result.scalars().first()
    assert updated_user.names == "UpdatedName"


@pytest.mark.asyncio
async def test_update_non_existent_user(authenticated_client: AsyncClient):
    """
    Test updating a non-existent user.
    """
    update_data = {"names": "NonExistent"}
    response = await authenticated_client.put("/user/99999", json=update_data)

    assert response.status_code == 404
    assert response.json()["error"] is True
    assert response.json()["msg"] == "User not found."


@pytest.mark.asyncio
async def test_update_user_duplicate_username(
    authenticated_client: AsyncClient,
    db_session: AsyncSession,
    test_user: int,
    test_role: int,
):
    """
    Test updating a user's username to an already existing one.
    """
    # Create another user
    another_user = User(
        id=None, # Pass id=None for auto-increment
        username="anotheruser",
        password=pwd_context.hash("anotherpassword"),
        names="Another",
        surnames="User",
        id_role=test_role,
    )
    db_session.add(another_user)
    await db_session.commit()
    await db_session.refresh(another_user)

    update_data = {
        "username": another_user.username
    }  # Try to change test_user's username to another_user's
    response = await authenticated_client.put(f"/user/{test_user}", json=update_data)

    assert response.status_code == 400
    assert response.json()["error"] is True
    assert "already exists" in response.json()["msg"]


@pytest.mark.asyncio
async def test_delete_user_success(
    authenticated_client: AsyncClient, db_session: AsyncSession, test_user: int
):
    """
    Test successful user deletion.
    """
    # Create a user to delete
    user_to_delete = User(
        id=None, # Pass id=None for auto-increment
        username="todelete",
        password=pwd_context.hash("deletepass"),
        names="To",
        surnames="Delete",
        id_role=test_user, # Use test_user_id directly
    )
    db_session.add(user_to_delete)
    await db_session.commit()
    await db_session.refresh(user_to_delete)

    response = await authenticated_client.delete(f"/user/{user_to_delete.id}")

    assert response.status_code == 200
    assert response.json()["error"] is False
    assert response.json()["msg"] == "Deleted successful!"

    # Verify deletion in database
    result = await db_session.execute(select(User).filter_by(id=user_to_delete.id))
    deleted_user = result.scalars().first()
    assert deleted_user is None


@pytest.mark.asyncio
async def test_delete_non_existent_user(authenticated_client: AsyncClient):
    """
    Test deleting a non-existent user.
    """
    response = await authenticated_client.delete("/user/99999")  # Assuming 99999 does not exist

    assert response.status_code == 404
    assert response.json()["error"] is True
    assert response.json()["msg"] == "User not found, it may have already been deleted."