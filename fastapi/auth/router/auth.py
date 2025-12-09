from auth.handlers import JWTBearer
from auth.model.pydantic import LoginCredentials
from auth.service.auth import AuthService
from config.databases import get_async_db
from fausto.fapi import Response, fapi_get_bearer_token
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={404: {"description": "Not found"}},
)


@router.post(
    "/login",
    response_model=Response,
    summary="Log in to get access token",
)
async def login(
    credential: LoginCredentials,
    s: AsyncSession = Depends(get_async_db),
    refresh: bool = False,
):
    """Authenticates a user and returns an access token.

    Args:
        credential (LoginCredentials): User's login credentials (username and password).
        refresh (bool): If True, a refresh token is also returned. Defaults to False.

    Returns:
        Response: A response object containing the access token and optionally a refresh token.
    """
    return await AuthService.validate_user(
        s=s,
        username=credential.username,
        password=credential.password,
        refresh_token=refresh,
    )


@router.post(
    "/logout",
    response_model=Response,
    dependencies=[Depends(JWTBearer())],
    summary="Log out and revoke token",
)
async def logout(token: str = Depends(fapi_get_bearer_token)):
    """Logs out the current user by revoking their access token.

    The token is added to a blacklist and can no longer be used.

    Args:
        token (str): The access token to revoke.

    Returns:
        Response: A response object indicating successful logout.
    """
    return await AuthService.revoke_user(token=token)


@router.get(
    "/token/validate",
    response_model=Response,
    dependencies=[Depends(JWTBearer())],
    summary="Validate an access token",
)
async def validate_token(token: str = Depends(fapi_get_bearer_token)):
    """Checks if the provided access token is valid and not revoked.

    The JWTBearer dependency already validates the token's signature and expiration.
    This endpoint adds a check to see if the token has been explicitly revoked (blacklisted).

    Args:
        token (str): The access token to validate.

    Returns:
        Response: A response object indicating the token's validity.
    """
    return await AuthService.check_blacklist_user(token=token)


@router.post(
    "/token/refresh",
    response_model=Response,
    dependencies=[Depends(JWTBearer())],
    summary="Refresh an access token",
)
async def refresh_token(token: str = Depends(fapi_get_bearer_token)):
    """Generates a new access token using a valid refresh token.

    Args:
        token (str): The refresh token.

    Returns:
        Response: A response object containing the new access token.
    """
    return await AuthService.refresh_user(token=token)


router_auth = router