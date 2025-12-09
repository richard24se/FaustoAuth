from auth.handlers import JWTBearer
from auth.model.pydantic import LoginCredentials
from auth.service.auth import AuthService
from config.databases import get_async_db
from fausto.fapi import Response, fapi_get_bearer_token
from fastapi import APIRouter, Depends, Request, status  # Import Request
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
    request: Request,
    credential: LoginCredentials,
    s: AsyncSession = Depends(get_async_db),
    refresh: bool = False,
):
    """Authenticates a user and returns an access token.

    Verifies the username and password provided in the body. If successful,
    returns a JWT access token. If `refresh` is True, also returns a 
    long-lived refresh token.

    Args:
        request (Request): The request object (for IP and User-Agent).
        credential (LoginCredentials): User's login credentials (username and password).
        s (AsyncSession): The database session.
        refresh (bool): If True, a refresh token is also returned. Defaults to False.

    Returns:
        Response: A response object containing the access token and optionally a refresh token.
    """
    token_data = await AuthService.validate_user(
        s=s,
        username=credential.username,
        password=credential.password,
        refresh_token=refresh,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    return Response(message="Login successful", data=token_data)


@router.post(
    "/logout",
    response_model=Response,
    dependencies=[Depends(JWTBearer())],
    summary="Log out and revoke token",
)
async def logout(token: str = Depends(fapi_get_bearer_token)):
    """Logs out the current user by revoking their access token.

    The current access token is added to a blacklist (Redis) and can no 
    longer be used for authentication. This effectively logs the user out
    server-side.

    Args:
        token (str): The access token to revoke, extracted from the Authorization header.

    Returns:
        Response: A response object indicating successful logout.
    """
    await AuthService.revoke_user(token=token)
    return Response(message="User logout successful, token revoked.")


@router.get(
    "/token/validate",
    response_model=Response,
    dependencies=[Depends(JWTBearer())],
    summary="Validate an access token",
)
async def validate_token(token: str = Depends(fapi_get_bearer_token)):
    """Checks if the provided access token is valid and not revoked.

    The `JWTBearer` dependency first validates the token's cryptographic signature 
    and expiration. This endpoint then performs an additional check against the 
    token blacklist (Redis) to ensure the token hasn't been explicitly revoked.

    Args:
        token (str): The access token to validate.

    Returns:
        Response: A response object with `message="Token is valid"` if successful. 
                  Raises 403 if revoked.
    """
    await AuthService.check_blacklist_user(token=token)
    return Response(message="Token is valid.")


@router.post(
    "/token/refresh",
    response_model=Response,
    dependencies=[Depends(JWTBearer())],
    summary="Refresh an access token",
)
async def refresh_token(token: str = Depends(fapi_get_bearer_token)):
    """Generates a new access token using a valid refresh token.

    The client must provide a valid *refresh* token in the Authorization header.
    This endpoint verifies the refresh token and, if valid, returns a new 
    short-lived access token. The refresh token allows obtaining new access 
    tokens without the user having to re-enter their password.

    Args:
        token (str): The refresh token.

    Returns:
        Response: A response object containing the new access token.
    """
    new_token = await AuthService.refresh_user(token=token)
    return Response(message="Token refreshed successfully", data=new_token)


router_auth = router
