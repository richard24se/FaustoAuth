import logging
from typing import Any, List

from auth.model.models import PermissionType
from auth.model.pydantic import PermissionTypeCreate, PermissionTypeUpdate
from config.databases import SQLALCH_AUTH
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
from fausto.sqlalch import async_sqlalch_wrapper, to_dict # Use async_sqlalch_wrapper
from fastapi import Depends # Import Depends
from sqlalchemy import desc, select, update, delete # Import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession


@fapi_wrapper
@async_sqlalch_wrapper
async def create_permission_type(s: AsyncSession = Depends(SQLALCH_AUTH), *, data: PermissionTypeCreate) -> str:
    """Creates a new permission type.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        data (PermissionTypeCreate): The Pydantic model containing the permission type data.

    Returns:
        str: A success message.

    Raises:
        ControllerError: If a permission type with the same name already exists.
    """
    result = await s.execute(select(PermissionType).filter(PermissionType.name == data.name))
    existing = result.scalars().first()
    if existing:
        raise ControllerError(f"The permission type '{data.name}' already exists.")

    new_perm_type = PermissionType(**data.model_dump())
    s.add(new_perm_type)
    # Commit is handled by the async_sqlalch_wrapper
    logging.info("Successfully created permission type '%s'.", new_perm_type.name)
    return "Saved successful!"


@fapi_wrapper
@async_sqlalch_wrapper
async def update_permission_type(
    s: AsyncSession = Depends(SQLALCH_AUTH), *, permission_type_id: int, data: PermissionTypeUpdate
) -> str:
    """Updates an existing permission type.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        permission_type_id (int): The ID of the permission type to update.
        data (PermissionTypeUpdate): A Pydantic model containing the fields to update.

    Returns:
        str: A success message.
    """
    if not permission_type_id:
        raise ControllerError("Permission type ID must be provided.")

    result = await s.execute(select(PermissionType).filter(PermissionType.id == permission_type_id))
    perm_type = result.scalars().first()
    if not perm_type:
        raise ControllerError("Permission type not found.")

    if data.name and data.name != perm_type.name:
        result = await s.execute(
            select(PermissionType).filter(
                PermissionType.name == data.name, PermissionType.id != permission_type_id
            )
        )
        existing = result.scalars().first()
        if existing:
            raise ControllerError(f"The permission type '{data.name}' already exists.")

    # Use update statement for async
    result = await s.execute(
        update(PermissionType)
        .where(PermissionType.id == permission_type_id)
        .values(**data.model_dump(exclude_unset=True))
    )
    # Commit is handled by the async_sqlalch_wrapper

    if result.rowcount == 0: # Check rowcount for update
        raise ControllerError("Permission type not found or data is the same.")

    logging.info("Successfully updated permission type with ID %d.", permission_type_id)
    return "Update successful!"


@fapi_wrapper
@async_sqlalch_wrapper
async def delete_permission_type(s: AsyncSession = Depends(SQLALCH_AUTH), *, permission_type_id: int) -> str:
    """Deletes a permission type.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        permission_type_id (int): The ID of the permission type to delete.

    Returns:
        str: A success message.
    """
    result = await s.execute(select(PermissionType).filter(PermissionType.id == permission_type_id))
    perm_type = result.scalars().first()
    if not perm_type:
        raise ControllerError(
            "Permission type not found, it may have already been deleted."
        )

    await s.delete(perm_type)
    # Commit is handled by the async_sqlalch_wrapper
    logging.info("Successfully deleted permission type with ID %d.", permission_type_id)
    return "Deleted successful!"


@fapi_wrapper
@async_sqlalch_wrapper
async def get_permission_type(
    s: AsyncSession = Depends(SQLALCH_AUTH), *, permission_type_id: int
) -> tuple[str, dict[str, Any]]:
    """Retrieves a single permission type by its ID.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        permission_type_id (int): The ID of the permission type to retrieve.

    Returns:
        tuple[str, dict[str, Any]]: A tuple containing a success message and the permission type data.
    """
    result = await s.execute(select(PermissionType).filter(PermissionType.id == permission_type_id))
    perm_type = result.scalars().first()
    if not perm_type:
        raise ControllerError("Permission type not found.")

    logging.debug("Found permission type with ID %d.", permission_type_id)
    return "Permission type was found!", to_dict(perm_type)


@fapi_wrapper
@async_sqlalch_wrapper
async def get_permission_types(s: AsyncSession = Depends(SQLALCH_AUTH)) -> tuple[str, List[dict[str, Any]]]:
    """Retrieves all permission types.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.

    Returns:
        tuple[str, List[dict[str, Any]]]: A tuple containing a success message and a list of permission types.
    """
    result = await s.execute(select(PermissionType).order_by(desc(PermissionType.id)))
    perm_types = result.scalars().all()
    if not perm_types:
        raise ControllerError("No permission types found.", [])

    logging.debug("Retrieved %d permission types.", len(perm_types))
    return "Permission types were found!", to_dict(perm_types)
