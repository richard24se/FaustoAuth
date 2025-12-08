import logging
from datetime import datetime, timezone
from typing import Any, List, Optional

from auth.model.models import Object, Permission, Role, RolePermission, User
from auth.model.pydantic import PermissionCreate, PermissionUpdate
from config.databases import SQLALCH_AUTH
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
from fausto.sqlalch import async_sqlalch_wrapper, to_dict # Use async_sqlalch_wrapper
from fastapi import Depends # Import Depends
from sqlalchemy import desc, select, update, delete # Import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession
from sqlalchemy.orm import joinedload


@fapi_wrapper
@async_sqlalch_wrapper
async def create_permission(s: AsyncSession = Depends(SQLALCH_AUTH), *, data: PermissionCreate) -> str:
    """Creates a new permission.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        data (PermissionCreate): The Pydantic model containing the permission data.

    Returns:
        str: A success message.

    Raises:
        ControllerError: If a permission with the same name already exists.
    """
    result = await s.execute(select(Permission).filter(Permission.name == data.name))
    existing = result.scalars().first()
    if existing:
        raise ControllerError(f"The permission '{data.name}' already exists.")

    new_permission = Permission(**data.model_dump())
    s.add(new_permission)
    # Commit is handled by the async_sqlalch_wrapper
    logging.info("Successfully created permission '%s'.", new_permission.name)
    return "Saved successful!"


@fapi_wrapper
@async_sqlalch_wrapper
async def update_permission(s: AsyncSession = Depends(SQLALCH_AUTH), *, permission_id: int, data: PermissionUpdate) -> str:
    """Updates an existing permission.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        permission_id (int): The ID of the permission to update.
        data (PermissionUpdate): A Pydantic model containing the fields to update.

    Returns:
        str: A success message.
    """
    if not permission_id:
        raise ControllerError("Permission ID must be provided.")

    result = await s.execute(select(Permission).filter_by(id=permission_id))
    permission = result.scalars().first()
    if not permission:
        raise ControllerError("Permission not found.")

    if data.name and data.name != permission.name:
        result = await s.execute(
            select(Permission).filter(
                Permission.name == data.name, Permission.id != permission_id
            )
        )
        existing = result.scalars().first()
        if existing:
            raise ControllerError(f"The permission '{data.name}' already exists.")

    update_data = data.model_dump(exclude_unset=True)
    update_data["modificated_date"] = datetime.now(timezone.utc)
    
    result = await s.execute(
        update(Permission)
        .where(Permission.id == permission_id)
        .values(**update_data)
    )
    # Commit is handled by the async_sqlalch_wrapper

    if result.rowcount == 0: # Check rowcount for update
        raise ControllerError("Permission not found or data is the same.")

    logging.info("Successfully updated permission with ID %d.", permission_id)
    return "Update successful!"


@fapi_wrapper
@async_sqlalch_wrapper
async def delete_permission(s: AsyncSession = Depends(SQLALCH_AUTH), *, permission_id: int) -> str:
    """Deletes a permission.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        permission_id (int): The ID of the permission to delete.

    Returns:
        str: A success message.
    """
    result = await s.execute(select(Permission).filter_by(id=permission_id))
    permission = result.scalars().first()
    if not permission:
        raise ControllerError(
            "Permission not found, it may have already been deleted."
        )

    await s.delete(permission)
    # Commit is handled by the async_sqlalch_wrapper
    logging.info("Successfully deleted permission with ID %d.", permission_id)
    return "Deleted successful!"


@fapi_wrapper
@async_sqlalch_wrapper
async def get_permission(s: AsyncSession = Depends(SQLALCH_AUTH), *, permission_id: int) -> tuple[str, dict[str, Any]]:
    """Retrieves a single permission by its ID.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        permission_id (int): The ID of the permission to retrieve.

    Returns:
        tuple[str, dict[str, Any]]: A tuple containing a success message and the permission data.
    """
    result = await s.execute(select(Permission).filter_by(id=permission_id))
    permission = result.scalars().first()
    if not permission:
        raise ControllerError("Permission not found.")

    return "Permission was found!", to_dict(permission)


@fapi_wrapper
@async_sqlalch_wrapper
async def get_permissions(
    s: AsyncSession = Depends(SQLALCH_AUTH),
    *,
    obj_name: Optional[str] = None,
    username: Optional[str] = None,
    role_id: Optional[int] = None,
) -> tuple[str, Any]:
    """Retrieves a list of permissions based on optional filters.

    - If `username` and `obj_name` are provided, it returns permissions for that
      user on that object.
    - If `role_id` is provided, it returns all permissions for that role.
    - If no filters are provided, it returns all permissions.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        obj_name (Optional[str]): The name of the object to filter by. Defaults to None.
        username (Optional[str]): The username to filter by. Defaults to None.
        role_id (Optional[int]): The role ID to filter by. Defaults to None.

    Returns:
        tuple[str, Any]: A tuple with a success message and the requested data.
    """
    query = select(Permission)

    if username and obj_name:
        # Query for a specific user's permissions on a specific object
        query = (
            query.join(RolePermission)
            .join(Object, Object.id == Permission.id_object)
            .join(Role, Role.id == RolePermission.id_role)
            .join(User, User.id_role == Role.id)
            .filter(Object.name == obj_name, User.username == username)
        )
        result = await s.execute(query)
        permissions = result.scalars().all()
        if not permissions:
            raise ControllerError("No permissions found for the given user and object.", {"enabled": False})

        result = await s.execute(select(User.id, User.username).filter_by(username=username))
        user_info = result.first() # Use first() for tuple result
        response_data = {
            "id": user_info.id,
            "username": user_info.username,
            "permissions": to_dict(permissions),
            "enabled": True,
        }
        return "Permission enabled!", response_data

    elif role_id:
        query = (
            query.join(RolePermission)
            .filter(RolePermission.id_role == role_id)
            .order_by(Permission.id.desc())
        )
        result = await s.execute(query)
        permissions = result.scalars().all()
    else:
        # No filters, get all permissions
        query = query.order_by(Permission.id)
        result = await s.execute(query)
        permissions = result.scalars().all()

    if not permissions:
        raise ControllerError("No permissions found.", [])

    return "Permissions were found!", to_dict(permissions)
