import logging
from datetime import datetime, timezone
from typing import Any, List

from auth.model.models import Object, Permission, RolePermission
from auth.model.pydantic import ObjectCreate, ObjectUpdate
from config.databases import SQLALCH_AUTH
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
from fausto.sqlalch import async_sqlalch_wrapper, to_dict # Use async_sqlalch_wrapper
from fastapi import Depends # Import Depends
from sqlalchemy import desc, select, update, delete # Import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession


@fapi_wrapper
@async_sqlalch_wrapper
async def create_object(s: AsyncSession = Depends(SQLALCH_AUTH), *, data: ObjectCreate) -> str:
    """Creates a new object.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        data (ObjectCreate): The Pydantic model containing the object data.

    Returns:
        str: A success message.

    Raises:
        ControllerError: If an object with the same name already exists.
    """
    result = await s.execute(select(Object).filter_by(name=data.name))
    existing_object = result.scalars().first()
    if existing_object:
        raise ControllerError(f"The object name '{data.name}' already exists.")

    new_obj = Object(**data.model_dump())
    s.add(new_obj)
    # Commit is handled by the async_sqlalch_wrapper
    logging.info("Successfully created object '%s'.", data.name)
    return "Saved successful!"


@fapi_wrapper
@async_sqlalch_wrapper
async def update_object(s: AsyncSession = Depends(SQLALCH_AUTH), *, object_id: int, data: ObjectUpdate) -> str:
    """Updates an existing object.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        object_id (int): The ID of the object to update.
        data (ObjectUpdate): A Pydantic model containing the fields to update.

    Returns:
        str: A success message.

    Raises:
        ControllerError: If the object ID is missing, the new name already
                         exists, or the object is not found.
    """
    if not object_id:
        raise ControllerError("Object ID must be provided.")

    result = await s.execute(select(Object).filter_by(id=object_id))
    obj = result.scalars().first()
    if not obj:
        raise ControllerError("Object not found.")

    if data.name and data.name != obj.name:
        result = await s.execute(
            select(Object)
            .filter(Object.name == data.name, Object.id != object_id)
        )
        existing_name = result.scalars().first()
        if existing_name:
            raise ControllerError(f"The object name '{data.name}' already exists.")

    update_data = data.model_dump(exclude_unset=True)
    update_data["modificated_date"] = datetime.now(timezone.utc)
    
    result = await s.execute(
        update(Object)
        .where(Object.id == object_id)
        .values(**update_data)
    )
    # Commit is handled by the async_sqlalch_wrapper

    if result.rowcount == 0: # Check rowcount for update
        raise ControllerError("Object not found or data is the same.")

    logging.info("Successfully updated object with ID %d.", object_id)
    return "Updated successful!"


@fapi_wrapper
@async_sqlalch_wrapper
async def delete_object(s: AsyncSession = Depends(SQLALCH_AUTH), *, object_id: int) -> str:
    """Deletes an object.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        object_id (int): The ID of the object to delete.

    Returns:
        str: A success message.
    """
    result = await s.execute(select(Object).filter_by(id=object_id))
    obj = result.scalars().first()
    if not obj:
        raise ControllerError("Object not found, it may have already been deleted.")

    await s.delete(obj)
    # Commit is handled by the async_sqlalch_wrapper
    logging.info("Successfully deleted object with ID %d.", object_id)
    return "Deleted successful!"


@fapi_wrapper
@async_sqlalch_wrapper
async def get_object(s: AsyncSession = Depends(SQLALCH_AUTH), *, object_id: int) -> tuple[str, dict[str, Any]]:
    """Retrieves a single object by its ID.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        object_id (int): The ID of the object to retrieve.

    Returns:
        tuple[str, dict[str, Any]]: A tuple containing a success message and the object data.
    """
    result = await s.execute(select(Object).filter_by(id=object_id))
    obj = result.scalars().first()
    if not obj:
        raise ControllerError("Object not found.")

    return "Object was found!", to_dict(obj)


@fapi_wrapper
@async_sqlalch_wrapper
async def get_object_role(s: AsyncSession = Depends(SQLALCH_AUTH), *, role_id: int) -> tuple[str, List[dict[str, Any]]]:
    """Retrieves all objects associated with a specific role.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        role_id (int): The ID of the role.

    Returns:
        tuple[str, List[dict[str, Any]]]: A tuple containing a success message and a list of objects.
    """
    result = await s.execute(
        select(Object)
        .join(Permission, Permission.id_object == Object.id)
        .join(RolePermission, RolePermission.id_permission == Permission.id)
        .filter(RolePermission.id_role == role_id)
        .distinct()
    )
    objects = result.scalars().all()

    if not objects:
        raise ControllerError("No objects found for this role.", [])

    return "Objects were found!", to_dict(objects)


@fapi_wrapper
@async_sqlalch_wrapper
async def get_objects(s: AsyncSession = Depends(SQLALCH_AUTH)) -> tuple[str, List[dict[str, Any]]]:
    """Retrieves all objects, ordered by ID descending.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.

    Returns:
        tuple[str, List[dict[str, Any]]]: A tuple containing a success message and a list of all objects.
    """
    result = await s.execute(select(Object).order_by(desc(Object.id)))
    objects = result.scalars().all()
    if not objects:
        raise ControllerError("No objects found.", [])

    return "Objects were found!", to_dict(objects)
