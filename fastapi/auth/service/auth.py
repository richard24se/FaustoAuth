import logging
from typing import Any

from auth.model.models import User
from auth.model.pydantic import TokenResponse
from config.databases import SQLALCH_AUTH, async_token_store  # Use async_token_store
from config.security import pwd_context  # Import from central security config
from config.settings import settings
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
from fausto.jwt import decode_auth_token, encode_auth_token, encode_refresh_auth_token
from fausto.redis import redis_create_key  # Import async redis_create_key
from fausto.sqlalch import async_sqlalch_wrapper, to_dict  # Use async_sqlalch_wrapper
from fastapi import Depends  # Import Depends
from sqlalchemy import select  # Import select
from sqlalchemy.ext.asyncio import AsyncSession  # Import AsyncSession


class AuthService:
    """Service for handling authentication-related logic.

    This service provides methods for user validation (login), token management
    (revocation, blocklisting), and token refreshing. It handles the core
    authentication flow including password verification and token generation.
    """

    @staticmethod
    async def validate_user(
        s: AsyncSession, *, username: str, password: str, refresh_token: bool = False
    ) -> dict[str, Any]:
        """Validates user credentials and returns access and refresh tokens.

        This method performs the following steps:
        1. Retrieves the user from the database by username.
        2. Verifies the provided password against the stored hash using `pwd_context`.
        3. Failsafe: If hashing verification fails (e.g., legacy plain text), it checks for plain text match
           and re-hashes the password securely if matched.
        4. Generates a new JWT access token.
        5. Stores the token status (valid/revoked) in Redis.
        6. Optionally generates a refresh token.

        Args:
            s (AsyncSession): The database session.
            username (str): The username provided by the user.
            password (str): The password provided by the user.
            refresh_token (bool, optional): Whether to generate a refresh token. Defaults to False.

        Returns:
            dict[str, Any]: A dictionary containing the access token, user details, and optionally a refresh token.

        Raises:
            ControllerError: If authentication fails (invalid credentials) or other errors occur.
        """
        try:
            # Step 1: User Lookup
            result = await s.execute(select(User).filter(User.username == username))
            user = result.scalars().first()

            if not user:
                raise ControllerError("Invalid username or password.", status_code=401)

            # Step 2: Password Verification
            password_verified = False
            try:
                # Attempt to verify the password using the configured hashing algorithm (e.g., Argon2, Bcrypt)
                password_verified = pwd_context.verify(password, user.password)
            except Exception as e:
                logging.error("Error during password verification for user '%s': %s", username, e)
                password_verified = False

            # Step 3: Legacy/Failsafe Handling
            if not password_verified:
                logging.warning(
                    "Password verification failed for user '%s'. Attempting plain-text comparison.",
                    username,
                )
                # Check if the stored password matches the input exactly (legacy plain-text)
                if isinstance(user.password, str) and user.password == password:
                    password_verified = True
                    logging.info(
                        "Plain-text password matched for user '%s'. Re-hashing and updating password.",
                        username,
                    )
                    # Automatically upgrade the password to a secure hash
                    password_bytes = password.encode("utf-8")
                    truncated_password_bytes = password_bytes[:72]  # Truncate for safety with some hashers
                    truncated_password = truncated_password_bytes.decode("utf-8", errors="ignore")
                    user.password = pwd_context.hash(truncated_password)
                    s.add(user)
                    await s.commit()  # Explicitly commit the new hash
                else:
                    logging.warning("Plain-text password comparison failed for user '%s'.", username)

            if not password_verified:
                raise ControllerError("Invalid username or password.", status_code=401)

            # Step 4 & 5: Token Generation and Storage
            access_token = encode_auth_token(user.username)
            # Mark the token as valid (value="false" means NOT revoked) in Redis
            await redis_create_key(key=access_token, value="false")

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

            token_response = TokenResponse(**response_data)
            return token_response.model_dump()
        except ControllerError:
            # Rollback any pending changes (e.g., failed password upgrade)
            await s.rollback()
            raise
        except Exception as e:
            await s.rollback()
            raise ControllerError(str(e))

    @staticmethod
    async def revoke_user(*, token: str) -> None:
        """Revokes a user's token (logout).

        This marks the token as revoked in the Redis store, preventing further use.

        Args:
             token (str): The access token to revoke.

        Raises:
            ControllerError: If an error occurs during the revocation process.
        """
        try:
            # Set the token value to "true" (revoked) in Redis
            await async_token_store.set(token, "true", ex=settings.ACCESS_EXPIRES * 1.2)
            logging.info("Revoked token.")
        except Exception as e:
            raise ControllerError(str(e))

    @staticmethod
    async def check_blacklist_user(*, token: str) -> None:
        """Checks if a token has been blacklisted (revoked).

        Args:
            token (str): The token to check.

        Raises:
            ControllerError: If the token is revoked (403) or not found/expired (403).
        """
        try:
            is_revoked = await async_token_store.get(token)

            if is_revoked == "true":
                logging.warning("Attempted to use a revoked token.")
                raise ControllerError("Token has been revoked.", status_code=403)

            if is_revoked is None:
                logging.warning("Token not found in store. It may be invalid or expired.")
                raise ControllerError("Token not recognized or has expired.", status_code=403)
        except ControllerError:
            raise
        except Exception as e:
            raise ControllerError(str(e))

    @staticmethod
    async def refresh_user(*, token: str) -> dict[str, Any]:
        """Generates a new access token from a valid refresh token.

        Use this method to obtain a fresh access token without re-entering credentials.
        The refresh token itself must be valid and not revoked.

        Args:
            token (str): The valid refresh token.

        Returns:
            dict[str, Any]: A dictionary containing the new access token and the original refresh token.

        Raises:
            ControllerError: If the token is invalid, expired, or of the wrong type.
        """
        try:
            payload = decode_auth_token(token)

            if isinstance(payload, str):
                raise ControllerError(payload, status_code=403)

            if payload.get("type") != "refresh":
                raise ControllerError("An access token cannot be used for refresh.", status_code=403)

            if await async_token_store.get(token) == "true":
                raise ControllerError("This refresh token has been revoked.", status_code=403)

            new_access_token = encode_auth_token(payload.get("identity"))
            # Register the new access token in Redis
            await redis_create_key(key=new_access_token, value="false")

            return {"access_token": new_access_token, "refresh_token": token}
        except ControllerError:
            raise
        except Exception as e:
            raise ControllerError(str(e))
