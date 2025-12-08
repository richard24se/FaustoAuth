# DB LAYER
import logging
from datetime import datetime, timezone
from typing import Any, List

from auth.model.models import (
    Object,
    ObjectType,
    Permission,
    PermissionType,
    Role,
    RolePermission,
    User,
)
from auth.model.pydantic import UserCreate, UserUpdate
from config.databases import get_async_db
from config.security import pwd_context
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
from fausto.sqlalch import (
    async_sqlalch_wrapper,
    remove_fields_sqlalch,
    to_dict,
)
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

SUPER_USER_USERNAME = "admin@faustoauth.app"


@fapi_wrapper
@async_sqlalch_wrapper
async def create_user(s: AsyncSession, *, data: UserCreate) -> str:
    """Creates a new user.

    Args:
        s (AsyncSession): The SQLAlchemy async session.
        data (UserCreate): The Pydantic model containing the user data.

    Returns:
        str: A success message.
    """
    result = await s.execute(select(User).filter(User.username == data.username))
    if result.scalars().first():
        raise ControllerError(f"The username '{data.username}' already exists.")

    user_data = data.model_dump()
    password_bytes = user_data["password"].encode('utf-8')
    truncated_password_bytes = password_bytes[:72]
    truncated_password = truncated_password_bytes.decode('utf-8', errors='ignore')
    user_data["password"] = pwd_context.hash(truncated_password)
    new_user = User(**user_data)

    s.add(new_user)
    await s.commit()
    logging.info("Successfully created user '%s'.", new_user.username)
    return "Saved successful!"


@fapi_wrapper
@async_sqlalch_wrapper
async def update_user(s: AsyncSession, *, user_id: int, data: UserUpdate) -> tuple[str, dict]:
    """Updates an existing user.

    Args:
        s (AsyncSession): The SQLAlchemy async session.
        user_id (int): The ID of the user to update.
        data (UserUpdate): A Pydantic model containing the fields to update.

    Returns:
        tuple[str, dict]: A tuple with a success message and the updated user data.
    """
    if not user_id:
        raise ControllerError("User ID must be provided.")

    result = await s.execute(select(User).filter_by(id=user_id))
    user = result.scalars().one_or_none()
    if not user:
        raise ControllerError("User not found.")
    if user.username == SUPER_USER_USERNAME:
        raise ControllerError("Cannot update the super-user.")

    if data.username and data.username != user.username:
        result = await s.execute(
            select(User).filter(
                User.username == data.username, User.id != user_id
            )
        )
        if result.scalars().first():
            raise ControllerError(f"The username '{data.username}' already exists.")

    update_data = data.model_dump(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        password_bytes = update_data["password"].encode('utf-8')
        truncated_password_bytes = password_bytes[:72]
        truncated_password = truncated_password_bytes.decode('utf-8', errors='ignore')
        update_data["password"] = pwd_context.hash(truncated_password)

    for key, value in update_data.items():
        setattr(user, key, value)

    user.modificated_date = datetime.now(timezone.utc)
    s.add(user)
    await s.commit()

    user_dict = remove_fields_sqlalch(to_dict(user), ["password"])
    logging.info("Successfully updated user with ID %d.", user_id)
    return "Update successful!", user_dict


@fapi_wrapper
@async_sqlalch_wrapper
async def delete_user(s: AsyncSession, *, user_id: int) -> str:
    """Deletes a user.

    The super-user cannot be deleted.

    Args:
        s (AsyncSession): The SQLAlchemy async session.
        user_id (int): The ID of the user to delete.

    Returns:
        str: A success message.
    """
    result = await s.execute(select(User).filter_by(id=user_id))
    user = result.scalars().first()
    if user and user.username == SUPER_USER_USERNAME:
        raise ControllerError("Cannot delete the super-user.")
    if not user:
        raise ControllerError("User not found, it may have already been deleted.")

    await s.delete(user)
    await s.commit()
    logging.info("Successfully deleted user with ID %d.", user_id)
    return "Deleted successful!"


@fapi_wrapper
@async_sqlalch_wrapper
async def get_user(s: AsyncSession, *, user_id: int) -> tuple[str, dict[str, Any]]:
    """Retrieves a single user by ID, excluding the password.

    Args:
        s (AsyncSession): The SQLAlchemy async session.
        user_id (int): The ID of the user to retrieve.

    Returns:
        tuple[str, dict[str, Any]]: A tuple with a success message and the user data.
    """
    result = await s.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise ControllerError("User not found.")

    user_dict = remove_fields_sqlalch(to_dict(user), ["password"])
    return "User was found!", user_dict


@fapi_wrapper
@async_sqlalch_wrapper
async def get_users(s: AsyncSession) -> tuple[str, List[dict[str, Any]]]:
    """Retrieves all users.

    Users are ordered by ID descending. Passwords are excluded.

    Args:
        s (AsyncSession): The SQLAlchemy async session.

    Returns:
        tuple[str, List[dict[str, Any]]]: A tuple with a success message and a list of users.
    """
    result = await s.execute(select(User).order_by(desc(User.id)))
    users = result.scalars().all()
    if not users:
        raise ControllerError("No users found.", [])

    users_dict = [remove_fields_sqlalch(to_dict(u), ["password"]) for u in users]
    return "Users were found!", users_dict


@fapi_wrapper
@async_sqlalch_wrapper
async def get_user_name(s: AsyncSession, *, username: str) -> tuple[str, dict[str, Any]]:
    """Retrieves a user's profile including their role and detailed permissions.

    Args:
        s (AsyncSession): The SQLAlchemy async session.
        username (str): The username to look up.

    Returns:
        tuple[str, dict[str, Any]]: A tuple with a success message and the user's profile.
    """
    result = await s.execute(
        select(User).options(joinedload(User.role)).filter(User.username == username)
    )
    user_with_role = result.scalars().first()

    if not user_with_role:
        raise ControllerError("User not found.")

    user_dict = to_dict(user_with_role)
    user_dict["role"] = to_dict(user_with_role.role) if user_with_role.role else None
    del user_dict["password"]

    permissions_query = (
        select(Permission)
        .join(RolePermission, RolePermission.id_permission == Permission.id)
        .join(Object, Object.id == Permission.id_object)
        .join(PermissionType, PermissionType.id == Permission.id_permission_type)
        .join(ObjectType, ObjectType.id == Object.id_object_type)
        .filter(RolePermission.id_role == user_with_role.id_role)
        .options(
            joinedload(Permission.object).joinedload(Object.object_type),
            joinedload(Permission.permission_type),
        )
    )
    result = await s.execute(permissions_query)
    permissions = result.scalars().all()

    user_dict["permission"] = to_dict(permissions) if permissions else []

    return "User was found!", user_dict