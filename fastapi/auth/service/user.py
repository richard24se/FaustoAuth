import logging
from typing import Any

from auth.model.models import User
from auth.model.pydantic import UserCreate, UserUpdate
from config.security import pwd_context
from fausto import ControllerError
from fausto.sqlalch import remove_fields_sqlalch, to_dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .base import CRUDBase

SUPER_USER_USERNAME = "admin"


class UserService(CRUDBase[User, UserCreate, UserUpdate]):
    """User Service"""

    def __init__(self, session: AsyncSession):
        super().__init__(User, session, exclude_fields=["password"])

    async def create(self, *, obj_in: UserCreate) -> dict:
        """Creates a new user."""
        try:
            result = await self.session.execute(select(User).filter(User.username == obj_in.username))
            if result.scalars().first():
                raise ControllerError(f"The username '{obj_in.username}' already exists.", status_code=400)

            user_data = obj_in.model_dump()
            password_bytes = user_data["password"].encode("utf-8")
            truncated_password_bytes = password_bytes[:72]
            truncated_password = truncated_password_bytes.decode("utf-8", errors="ignore")
            user_data["password"] = pwd_context.hash(truncated_password)
            new_user = User(**user_data)

            self.session.add(new_user)
            await self.session.commit()
            await self.session.refresh(new_user)
            logging.info("Successfully created user '%s'.", new_user.username)
            return {"msg": "Saved successful!", "data": self._process_data(new_user)}
        except ControllerError:
            await self.session.rollback()
            raise
        except Exception as e:
            await self.session.rollback()
            raise ControllerError(str(e))

    async def update(self, *, id: int, obj_in: UserUpdate) -> dict:
        """Updates an existing user."""
        try:
            result = await self.session.execute(select(User).filter_by(id=id))
            user = result.scalars().one_or_none()
            if not user:
                raise ControllerError("User not found.", status_code=404)
            if user.username == SUPER_USER_USERNAME:
                raise ControllerError("Cannot update the super-user.", status_code=400)

            if obj_in.username and obj_in.username != user.username:
                result = await self.session.execute(
                    select(User).filter(User.username == obj_in.username)
                )
                if result.scalars().first():
                    raise ControllerError(f"The username '{obj_in.username}' already exists.", status_code=400)

            update_data = obj_in.model_dump(exclude_unset=True)
            if "password" in update_data and update_data["password"]:
                password_bytes = update_data["password"].encode("utf-8")
                truncated_password_bytes = password_bytes[:72]
                truncated_password = truncated_password_bytes.decode("utf-8", errors="ignore")
                update_data["password"] = pwd_context.hash(truncated_password)

            for key, value in update_data.items():
                setattr(user, key, value)

            self.session.add(user)
            await self.session.commit()
            await self.session.refresh(user)
            logging.info("Successfully updated user ID %d.", id)
            return {"msg": "Update successful!", "data": self._process_data(user)}
        except ControllerError:
            await self.session.rollback()
            raise
        except Exception as e:
            await self.session.rollback()
            raise ControllerError(str(e))

    async def remove(self, *, id: int) -> dict:
        """Deletes a user."""
        try:
            result = await self.session.execute(select(User).filter_by(id=id))
            user = result.scalars().first()
            if user and user.username == SUPER_USER_USERNAME:
                raise ControllerError("Cannot delete the super-user.", status_code=400)
            
            if not user:
                raise ControllerError("User not found, it may have already been deleted.", status_code=404)
            
            await self.session.delete(user)
            await self.session.commit()
            logging.info("Successfully deleted user with ID %d.", id)
            return {"msg": "Deleted successful!", "data": self._process_data(user)}
        except ControllerError:
            await self.session.rollback()
            raise
        except Exception as e:
            await self.session.rollback()
            raise ControllerError(str(e))

    async def get_user_name(self, *, username: str) -> dict[str, Any]:
        """Retrieves a user by username with role and permissions."""
        try:
            result = await self.session.execute(
                select(User)
                .options(selectinload(User.role))  # Eager load role
                .filter(User.username == username)
            )
            user_with_role = result.scalars().first()

            if not user_with_role:
                raise ControllerError("User not found.", status_code=404)

            user_dict = to_dict(user_with_role)
            user_dict["role"] = (
                to_dict(user_with_role.role) if user_with_role.role else None
            )
            
            # Remove password from response
            user_dict = remove_fields_sqlalch(user_dict, ["password"])

            return {"msg": "Found", "data": user_dict}
        except ControllerError:
            raise
        except Exception as e:
            raise ControllerError(str(e))