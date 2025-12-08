import logging
from datetime import datetime, timezone
from typing import Any, List

from auth.model.models import Role, RolePermission
from auth.model.pydantic import RoleCreate, RoleUpdate
from config.databases import SQLALCH_AUTH
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
from fausto.sqlalch import async_sqlalch_wrapper, to_dict # Use async_sqlalch_wrapper
from fastapi import Depends # Import Depends
from sqlalchemy import desc, select, update, delete # Import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession


@fapi_wrapper
@async_sqlalch_wrapper
async def create_role(s: AsyncSession = Depends(SQLALCH_AUTH), *, data: RoleCreate) -> str:
    """Creates a new role and associates it with a list of permissions.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        data (RoleCreate): The Pydantic model containing the role name and a list of permission IDs.

    Returns:
        str: A success message.
    """
    result = await s.execute(select(Role).filter_by(name=data.name))
    existing_role = result.scalars().first()
    if existing_role:
        raise ControllerError(f"The role '{data.name}' already exists.")

    # Create the role
    new_role = Role(name=data.name, display_name=data.display_name)
    s.add(new_role)
    await s.flush()  # Use await s.flush() to get the new_role.id before committing

    # Associate permissions
    if data.permissions:
        for perm_id in data.permissions:
            s.add(RolePermission(id_role=new_role.id, id_permission=perm_id))

    # Commit is handled by the async_sqlalch_wrapper
    logging.info(
        "Successfully created role '%s' with %d permissions.",
        new_role.name,
        len(data.permissions),
    )
    return "Saved successful!"


@fapi_wrapper
@async_sqlalch_wrapper
async def update_role(s: AsyncSession = Depends(SQLALCH_AUTH), *, role_id: int, data: RoleUpdate) -> str:
    """Updates an existing role's details and its associated permissions.

    This function replaces all existing permissions for the role with the new list provided.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        role_id (int): The ID of the role to update.
        data (RoleUpdate): The Pydantic model with the updated role data and new permission IDs.

    Returns:
        str: A success message.
    """
    result = await s.execute(select(Role).filter_by(id=role_id))
    role = result.scalars().first()
    if not role:
        raise ControllerError("Role not found.")

    # Check for name duplication
    if data.name and data.name != role.name:
        result = await s.execute(select(Role).filter(Role.name == data.name))
        existing_name = result.scalars().first()
        if existing_name:
            raise ControllerError(f"The role name '{data.name}' already exists.")

    # Update role details
    update_data = data.model_dump(exclude_unset=True, exclude={"permissions"})
    for key, value in update_data.items():
        setattr(role, key, value)

    role.modificated_date = datetime.now(timezone.utc)
    s.add(role) # Add the role to the session to track changes

    # Update permissions if provided
    if data.permissions is not None:
        # Delete existing permissions for the role
        await s.execute(delete(RolePermission).where(RolePermission.id_role == role_id))

        # Add the new set of permissions
        for perm_id in data.permissions:
            s.add(RolePermission(id_role=role_id, id_permission=perm_id))

    # Commit is handled by the async_sqlalch_wrapper
    logging.info("Successfully updated role ID %d.", role_id)
    return "Update successful!"


@fapi_wrapper
@async_sqlalch_wrapper
async def delete_role(s: AsyncSession = Depends(SQLALCH_AUTH), *, role_id: int) -> str:
    """Deletes a role and its associated permissions from the association table.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        role_id (int): The ID of the role to delete.

    Returns:
        str: A success message.
    """
    result = await s.execute(select(Role).filter_by(id=role_id))
    role = result.scalars().first()
    if not role:
        raise ControllerError("Role not found, it may have already been deleted.")

    # SQLModel handles cascading deletes if configured in the relationship,
    # but explicitly deleting link models is also fine.
    await s.execute(delete(RolePermission).where(RolePermission.id_role == role_id))
    await s.delete(role)
    # Commit is handled by the async_sqlalch_wrapper
    logging.info("Successfully deleted role with ID %d.", role_id)
    return "Deleted successful!"


@fapi_wrapper
@async_sqlalch_wrapper
async def get_role(s: AsyncSession = Depends(SQLALCH_AUTH), *, role_id: int) -> tuple[str, dict[str, Any]]:
    """Retrieves a single role by its ID.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        role_id (int): The ID of the role to retrieve.

    Returns:
        tuple[str, dict[str, Any]]: A tuple containing a success message and the role data.
    """
    result = await s.execute(select(Role).filter_by(id=role_id))
    role = result.scalars().first()
    if not role:
        raise ControllerError("Role not found.")

    return "Role was found!", to_dict(role)


@fapi_wrapper
@async_sqlalch_wrapper
async def get_roles(s: AsyncSession = Depends(SQLALCH_AUTH)) -> tuple[str, List[dict[str, Any]]]:
    """Retrieves all roles.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.

    Returns:
        tuple[str, List[dict[str, Any]]]: A tuple containing a success message and a list of all roles.
    """
    result = await s.execute(select(Role).order_by(desc(Role.id)))
    roles = result.scalars().all()
    if not roles:
        raise ControllerError("No roles found.", [])

    return "Roles were found!", to_dict(roles)
