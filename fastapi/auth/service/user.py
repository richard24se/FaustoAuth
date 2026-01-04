import logging
from typing import Any

from auth.model.models import User
from auth.model.pydantic import UserCreate, UserUpdate
from config.security import pwd_context
from fausto import ControllerError
from fausto.sqlalch import (
    get_filter_fields_multi_sqlalch,
    get_order_fields_multi_sqlalch,
    remove_fields_sqlalch,
    to_dict,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .base import CRUDBase

SUPER_USER_USERNAME = "admin"


class UserService(CRUDBase[User, UserCreate, UserUpdate]):
    """Service for managing User entities.

    This service handles the creation, update, retrieval, and deletion of users.
    It includes specific logic for password hashing during creation and updates,
    as well as protection for the super-user account.
    """

    def __init__(self, session: AsyncSession):
        super().__init__(User, session, exclude_fields=["password"])

    async def _hash_password(self, password: str) -> str:
        """Helper to securely hash a password."""
        password_bytes = password.encode("utf-8")
        # Truncate for safety with some hashers (e.g. Bcrypt 72 byte limit)
        truncated_password = password_bytes.decode("utf-8", errors="ignore")
        return pwd_context.hash(truncated_password)

    async def create(self, *, obj_in: UserCreate | dict[str, Any]) -> dict[str, Any]:
        """Creates a new user.

        Hashes the provided password before storing it in the database.
        Checks for username uniqueness.

        Args:
            obj_in (UserCreate | dict[str, Any]): The data to create the user with.

        Returns:
            dict[str, Any]: A dictionary representation of the created user (excluding valid password).

        Raises:
            ControllerError: If the username already exists or other errors occur.
        """
        try:
            if isinstance(obj_in, dict):
                user_data = obj_in
                username = user_data.get("username")
            else:
                user_data = obj_in.model_dump()
                username = obj_in.username

            # STRICT TENANT ISOLATION: Override tenant_id if context is present
            tid = self.current_tenant
            if tid and hasattr(self.model, "tenant_id"):
                user_data["tenant_id"] = tid

            query = select(User).filter(User.username == username)
            query = self._apply_tenant_filter(query)
            result = await self.session.execute(query)
            if result.scalars().first():
                raise ControllerError(f"The username '{username}' already exists.", status_code=400)

            # Hash the password
            # Hash the password
            user_data["password"] = await self._hash_password(user_data["password"])

            new_user = User(**user_data)

            self.session.add(new_user)
            await self.session.commit()
            await self.session.refresh(new_user)
            logging.info("Successfully created user '%s'.", new_user.username)
            return self._process_data(new_user)
        except ControllerError:
            await self.session.rollback()
            raise
        except Exception as e:
            await self.session.rollback()
            raise ControllerError(str(e))

    async def update(self, *, id: int, obj_in: UserUpdate | dict[str, Any]) -> dict[str, Any]:
        """Updates an existing user.

        Handles password re-hashing if a new password is provided.
        Prevents updates to the 'admin' super-user username.

        Args:
            id (int): The ID of the user to update.
            obj_in (UserUpdate | dict[str, Any]): The update data.

        Returns:
            dict[str, Any]: A dictionary representation of the updated user.

        Raises:
            ControllerError: If user is not found, username exists, or super-user protection is triggered.
        """
        try:
            query = select(User).filter_by(id=id)
            query = self._apply_tenant_filter(query)
            result = await self.session.execute(query)
            user = result.scalars().one_or_none()
            if not user:
                raise ControllerError("User not found.", status_code=404)
            if user.username == SUPER_USER_USERNAME:
                raise ControllerError("Cannot update the super-user.", status_code=400)

            if isinstance(obj_in, dict):
                update_data = obj_in
                new_username = update_data.get("username")
            else:
                update_data = obj_in.model_dump(exclude_unset=True)
                new_username = obj_in.username

            if new_username and new_username != user.username:
                query = select(User).filter(User.username == new_username)
                query = self._apply_tenant_filter(query)
                result = await self.session.execute(query)
                if result.scalars().first():
                    raise ControllerError(f"The username '{new_username}' already exists.", status_code=400)

            if "password" in update_data and update_data["password"]:
                update_data["password"] = await self._hash_password(update_data["password"])

            for key, value in update_data.items():
                setattr(user, key, value)

            self.session.add(user)
            await self.session.commit()
            await self.session.refresh(user)
            logging.info("Successfully updated user ID %d.", id)
            return self._process_data(user)
        except ControllerError:
            await self.session.rollback()
            raise
        except Exception as e:
            await self.session.rollback()
            raise ControllerError(str(e))

    async def get_multi(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        filters: dict[str, Any] | None = None,
        order_by: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        """Retrieve multiple users with role eager loaded."""
        try:

            # query = select(self.model)
            # query = self._apply_tenant_filter(query)

            query = select(self.model).options(selectinload(User.role))
            # Restrict to tenant
            query = self._apply_tenant_filter(query)

            if filters:
                query = query.filter(*get_filter_fields_multi_sqlalch(filters, self.model))

            if order_by:
                query = query.order_by(*get_order_fields_multi_sqlalch(order_by, self.model))

            query = query.offset(skip).limit(limit)
            result = await self.session.execute(query)
            objects = result.scalars().all()

            results = []
            for obj in objects:
                user_dict = self._process_data(obj)
                # Manually handle the eagerly loaded 'role' relationship
                if obj.role:
                    user_dict["role"] = to_dict(obj.role)
                else:
                    user_dict["role"] = None
                results.append(user_dict)

            return results
        except Exception as e:
            logging.error(f"Error fetching multiple users: {e}")
            raise ControllerError(str(e))

    async def remove(self, *, id: int) -> dict[str, Any]:
        """Deletes a user."""
        try:
            query = select(User).filter_by(id=id)
            query = self._apply_tenant_filter(query)
            result = await self.session.execute(query)
            user = result.scalars().first()
            if user and user.username == SUPER_USER_USERNAME:
                raise ControllerError("Cannot delete the super-user.", status_code=400)

            if not user:
                raise ControllerError("User not found, it may have already been deleted.", status_code=404)

            data = self._process_data(user)
            await self.session.delete(user)
            await self.session.commit()
            logging.info("Successfully deleted user with ID %d.", id)
            return data
        except ControllerError:
            await self.session.rollback()
            raise
        except Exception as e:
            await self.session.rollback()
            raise ControllerError(str(e))

    async def get_user_name(self, *, username: str) -> dict[str, Any]:
        """Retrieves a user by username with role and permissions."""
        try:
            query = select(User).options(selectinload(User.role)).filter(User.username == username)
            query = self._apply_tenant_filter(query)
            result = await self.session.execute(query)
            user_with_role = result.scalars().first()

            if not user_with_role:
                raise ControllerError("User not found.", status_code=404)

            user_dict = to_dict(user_with_role)
            user_dict["role"] = to_dict(user_with_role.role) if user_with_role.role else None

            # Remove password from response
            user_dict = remove_fields_sqlalch(user_dict, ["password"])

            return user_dict
        except ControllerError:
            raise
        except Exception as e:
            raise ControllerError(str(e))
