import logging
from typing import Any

from auth.model.models import User, Role, RolePermission, Permission
from auth.model.pydantic import TokenResponse, AuditCreate
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
from auth.service.audit import AuditService, AuditDTO


class AuthService:
    """Service for handling authentication-related logic.

    This service provides methods for user validation (login), token management
    (revocation, blocklisting), and token refreshing. It handles the core
    authentication flow including password verification and token generation.
    """

    @staticmethod
    async def validate_user(
        s: AsyncSession,
        *,
        username: str,
        password: str,
        refresh_token: bool = False,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> dict[str, Any]:
        """Validates user credentials and returns access and refresh tokens.

        This method performs the following steps:
        1. Retrieves the user from the database by username.
        2. Verifies the provided password against the stored hash using `pwd_context`.
        3. Failsafe: If hashing verification fails (e.g., legacy plain text), it checks for plain text match
            and re-hashes the password securely if matched.
        4. Audit Logging: Logs 'SUCCESS' or 'FAILURE' (for valid users) to the audit table.
        5. Generates a new JWT access token.
        6. Stores the token status (valid/revoked) in Redis.
        7. Optionally generates a refresh token.

        Args:
            s (AsyncSession): The database session.
            username (str): The username provided by the user.
            password (str): The password provided by the user.
            refresh_token (bool, optional): Whether to generate a refresh token. Defaults to False.
            ip_address (str | None): Source IP address for audit.
            user_agent (str | None): User Agent string for audit.

        Returns:
            dict[str, Any]: A dictionary containing the access token, user details, and optionally a refresh token.

        Raises:
            ControllerError: If authentication fails (invalid credentials) or other errors occur.
        """
        # Import here to avoid circular dependencies if any (though AuditService is likely safe)
        from auth.service.audit import AuditService

        try:
            # Step 1: User Lookup with Eager Loading of Permissions
            # We need to traverse: User -> Role -> RolePermission -> Permission
            from sqlalchemy.orm import selectinload

            result = await s.execute(
                select(User)
                .options(
                    selectinload(User.role).selectinload(Role.role_permissions).selectinload(RolePermission.permission)
                )
                .filter(User.username == username)
            )
            user = result.scalars().first()

            if not user:
                # User not found: Cannot audit (no id_user).
                # Security Best Practice: Don't reveal user existence.
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
                    # truncated_password_bytes = password_bytes[:72]  # Truncate for safety with some hashers
                    truncated_password_bytes = password_bytes  # Truncate for safety with some hashers
                    truncated_password = truncated_password_bytes.decode("utf-8", errors="ignore")
                    user.password = pwd_context.hash(truncated_password)
                    s.add(user)
                    await s.commit()  # Explicitly commit the new hash
                else:
                    logging.warning("Plain-text password comparison failed for user '%s'.", username)

            if not password_verified:
                # Audit FAILURE
                auth_create_fail = AuditDTO(
                    id_audit_type=1,  # Assume 1 = LOGIN
                    id_user=user.id,
                    tenant_id=user.tenant_id,
                    data="Login failed: Invalid password.",
                    status="FAILURE",
                    ip_address=ip_address,
                    user_agent=user_agent,
                )

                await AuditService.create_audit(s=s, data=auth_create_fail)
                raise ControllerError("Invalid username or password.", status_code=401)

            # Extract user data BEFORE calling AuditService (which acts on the session and may commit/expire objects)
            # This prevents specific MissingGreenlet errors caused by accessing expired attributes on the user object after a commit.
            user_id = user.id
            user_username = user.username
            user_names = user.names
            user_surnames = user.surnames
            user_id_role = user.id_role
            user_tenant_id = user.tenant_id
            user_role_name = user.role.name if user.role else None,

            # Helper to extract scopes from permissions
            scopes = []
            if user.role and user.role.role_permissions:
                for rp in user.role.role_permissions:
                    if rp.permission:
                        scopes.append(rp.permission.name)

            # Audit SUCCESS
            auth_create = AuditDTO(
                id_audit_type=1,  # Assume 1 = LOGIN
                id_user=user_id,
                tenant_id=user_tenant_id,
                data="User logged in successfully.",
                status="SUCCESS",
                ip_address=ip_address,
                user_agent=user_agent,
            )

            await AuditService.create_audit(s=s, data=auth_create)

            # Step 4 & 5: Token Generation and Storage
            # Pass extracted scopes and performance claims to the token generator
            access_token = encode_auth_token(
                user_username,
                scopes=scopes,
                user_id=user_id,
                tenant_id=user_tenant_id,
                role=user_role_name,
                name=user_names,
            )
            # Mark the token as valid (value="false" means NOT revoked) in Redis
            await redis_create_key(key=access_token, value="false")

            response_data = {
                "access_token": access_token,
                "id": user_id,
                "username": user_username,
                "names": user_names,
                "surnames": user_surnames,
                "id_role": user_id_role,
                "tenant_id": user_tenant_id,
            }

            if refresh_token:
                response_data["refresh_token"] = encode_refresh_auth_token(user_username)

            token_response = TokenResponse(**response_data)
            return token_response.model_dump()
        except ControllerError:
            # Rollback any pending changes (e.g., failed password upgrade)
            await s.rollback()
            raise
        except Exception as e:
            await s.rollback()
            logging.error(f"Unexpected error during user validation: {e}")
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
