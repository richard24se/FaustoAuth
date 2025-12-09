import logging
from typing import Any

from auth.model.models import User
from auth.model.pydantic import TokenResponse
from config.databases import SQLALCH_AUTH, async_token_store  # Use async_token_store
from config.security import pwd_context  # Import from central security config
from config.settings import settings
from fausto.fapi import fapi_wrapper
from fausto.jwt import decode_auth_token, encode_auth_token, encode_refresh_auth_token
from fausto.redis import redis_create_key  # Import async redis_create_key
from fausto.sqlalch import async_sqlalch_wrapper, to_dict  # Use async_sqlalch_wrapper
from fastapi import Depends  # Import Depends
from sqlalchemy import select  # Import select
from sqlalchemy.ext.asyncio import AsyncSession  # Import AsyncSession


class AuthService:
    @staticmethod
    @fapi_wrapper(status_code=401)
    @async_sqlalch_wrapper
    async def validate_user(  # Make validate_user async
        s: AsyncSession, *, username: str, password: str, refresh_token: bool = False
    ) -> dict[str, Any]:
        """Validates user credentials and returns access and refresh tokens.
        Args:
            s (AsyncSession): The SQLAlchemy asynchronous session.
            username (str): The user's username.
            password (str): The user's password.
            refresh_token (bool): Whether to generate a refresh token. Defaults to False.
        Returns:
            dict[str, Any]: A dictionary containing the token response.
        """
        result = await s.execute(select(User).filter(User.username == username))
        user = result.scalars().first()

        if not user:
            return {"msg": "Invalid username or password.", "error": True}

        password_verified = False
        # Argon2 does not raise UnknownHashError for non-hashes, it just fails verification.
        # The plain-text fallback is still needed for migration.
        try:
            password_verified = pwd_context.verify(password, user.password)
        except Exception as e:
            # Catch any unexpected errors during verification, e.g., malformed hash that Argon2 can't process
            logging.error(
                "Error during password verification for user '%s': %s", username, e
            )
            password_verified = False

        if not password_verified:
            # If passlib verification failed, attempt plain-text comparison for migration
            logging.warning(
                "Password verification failed for user '%s'. Attempting plain-text comparison.",
                username,
            )
            if isinstance(user.password, str) and user.password == password:
                password_verified = True
                # Immediately re-hash and update the password for security
                logging.info(
                    "Plain-text password matched for user '%s'. Re-hashing and updating password.",
                    username,
                )
                # Truncate password to 72 bytes as required by bcrypt (if still using bcrypt)
                # For Argon2, truncation is not strictly necessary but can be done for consistency
                password_bytes = password.encode("utf-8")
                truncated_password_bytes = password_bytes[
                    :72
                ]  # Keep truncation for safety/consistency
                truncated_password = truncated_password_bytes.decode(
                    "utf-8", errors="ignore"
                )
                user.password = pwd_context.hash(truncated_password)
                s.add(user)
                # Commit is handled by the async_sqlalch_wrapper
            else:
                logging.warning(
                    "Plain-text password comparison failed for user '%s'.", username
                )

        if not password_verified:
            return {"msg": "Invalid username or password.", "error": True}

        access_token = encode_auth_token(user.username)
        # Create access token and register it in Redis
        await redis_create_key(key=access_token, value="false")  # Await redis_create_key

        response_data = {
            "access_token": access_token,
            "id": user.id,
            "username": user.username,
            "names": user.names,
            "surnames": user.surnames,
            "id_role": user.id_role,
        }

        if refresh_token:
            response_data["refresh_token"] = encode_refresh_auth_token(user.username)

        # Use Pydantic model for clear, validated response structure
        token_response = TokenResponse(**response_data)

        return {"msg": "Login successful", "data": token_response.model_dump()}

    @staticmethod
    @fapi_wrapper
    async def revoke_user(*, token: str) -> dict[str, Any]:
        """Revokes a user's token by adding it to the Redis blacklist.
        Args:
            token (str): The token to revoke.
        Returns:
            dict[str, Any]: A success message dictionary.
        """
        # The expiration is set to 120% of the token's original lifespan
        # to ensure it outlives the token.
        await async_token_store.set(token, "true", ex=settings.ACCESS_EXPIRES * 1.2)
        logging.info("Revoked token.")
        return {
            "msg": "User logout successful, token revoked.",
            "error": False,
        }

    @staticmethod
    @fapi_wrapper(status_code=403)
    async def check_blacklist_user(*, token: str) -> dict[str, Any]:
        """Checks if a token has been blacklisted in Redis.
        Args:
            token (str): The token to check.
        Returns:
            dict[str, Any]: A dictionary indicating the token's validity.
        """
        is_revoked = await async_token_store.get(token)

        if is_revoked == "true":
            logging.warning("Attempted to use a revoked token.")
            return {"msg": "Token has been revoked.", "error": True}

        if is_revoked is None:
            # This can happen if the token is valid but was never registered,
            # or if it expired and was removed from Redis.
            logging.warning("Token not found in store. It may be invalid or expired.")
            return {"msg": "Token not recognized or has expired.", "error": True}

        return {"msg": "Token is valid.", "error": False}

    @staticmethod
    @fapi_wrapper(status_code=403)
    async def refresh_user(*, token: str) -> dict[str, Any]:
        """Generates a new access token from a valid refresh token.
        Args:
            token (str): The refresh token.
        Returns:
            dict[str, Any]: A dictionary with the new access token and the original refresh token.
        """
        payload = decode_auth_token(token)

        if isinstance(payload, str):
            return {"msg": payload, "error": True}

        if payload.get("type") != "refresh":
            return {"msg": "An access token cannot be used for refresh.", "error": True}

        # Check if the refresh token itself has been revoked
        if await async_token_store.get(token) == "true":
            return {"msg": "This refresh token has been revoked.", "error": True}

        # All good, generate a new access token
        new_access_token = encode_auth_token(payload.get("identity"))
        # redis_create_key is now an async function
        await redis_create_key(key=new_access_token, value="false")

        return {
            "msg": "Access token generated successfully.",
            "error": False,
            "data": {"access_token": new_access_token, "refresh_token": token},
        }