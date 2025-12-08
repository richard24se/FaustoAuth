import logging
from typing import Any, List

from auth.model.models import ObjectType
from auth.model.pydantic import ObjectTypeCreate, ObjectTypeUpdate
from config.databases import SQLALCH_AUTH
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
from fausto.sqlalch import async_sqlalch_wrapper, to_dict # Use async_sqlalch_wrapper
from fastapi import Depends # Import Depends
from sqlalchemy import desc, select, update, delete # Import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession


@fapi_wrapper
@async_sqlalch_wrapper
async def create_object_type(s: AsyncSession = Depends(SQLALCH_AUTH), *, data: ObjectTypeCreate) -> str:
    """Creates a new object type.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        data (ObjectTypeCreate): The Pydantic model containing the object type data.

    Returns:
        str: A success message.

    Raises:
        ControllerError: If an object type with the same name already exists.
    """
    result = await s.execute(select(ObjectType).filter(ObjectType.name == data.name))
    existing = result.scalars().first()
    if existing:
        raise ControllerError(f"The object type '{data.name}' already exists.")

    new_obj_type = ObjectType(**data.model_dump())
    s.add(new_obj_type)
    # Commit is handled by the async_sqlalch_wrapper
    logging.info("Successfully created object type '%s'.", new_obj_type.name)
    return "Saved successful!"


@fapi_wrapper
@async_sqlalch_wrapper
async def update_object_type(
    s: AsyncSession = Depends(SQLALCH_AUTH), *, object_type_id: int, data: ObjectTypeUpdate
) -> str:
    """Updates an existing object type.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        object_type_id (int): The ID of the object type to update.
        data (ObjectTypeUpdate): A Pydantic model containing the fields to update.

    Returns:
        str: A success message.
    """
    if not object_type_id:
        raise ControllerError("Object type ID must be provided.")

    result = await s.execute(select(ObjectType).filter(ObjectType.id == object_type_id))
    obj_type = result.scalars().first()
    if not obj_type:
        raise ControllerError("Object type not found.")

    if data.name and data.name != obj_type.name:
        result = await s.execute(
            select(ObjectType).filter(
                ObjectType.name == data.name, ObjectType.id != object_type_id
            )
        )
        existing = result.scalars().first()
        if existing:
            raise ControllerError(f"The object type '{data.name}' already exists.")

    # Use update statement for async
    result = await s.execute(
        update(ObjectType)
        .where(ObjectType.id == object_type_id)
        .values(**data.model_dump(exclude_unset=True))
    )
    # Commit is handled by the async_sqlalch_wrapper

    if result.rowcount == 0: # Check rowcount for update
        raise ControllerError("Object type not found or data is the same.")

    logging.info("Successfully updated object type with ID %d.", object_type_id)
    return "Update successful!"


@fapi_wrapper
@async_sqlalch_wrapper
async def delete_object_type(s: AsyncSession = Depends(SQLALCH_AUTH), *, object_type_id: int) -> str:
    """Deletes an object type.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        object_type_id (int): The ID of the object type to delete.

    Returns:
        str: A success message.
    """
    result = await s.execute(select(ObjectType).filter(ObjectType.id == object_type_id))
    obj_type = result.scalars().first()
    if not obj_type:
        raise ControllerError(
            "Object type not found, it may have already been deleted."
        )

    await s.delete(obj_type)
    # Commit is handled by the async_sqlalch_wrapper
    logging.info("Successfully deleted object type with ID %d.", object_type_id)
    return "Deleted successful!"


@fapi_wrapper
@async_sqlalch_wrapper
async def get_object_type(
    s: AsyncSession = Depends(SQLALCH_AUTH), *, object_type_id: int
) -> tuple[str, dict[str, Any]]:
    """Retrieves a single object type by its ID.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        object_type_id (int): The ID of the object type to retrieve.

    Returns:
        tuple[str, dict[str, Any]]: A tuple containing a success message and the object type data.
    """
    result = await s.execute(select(ObjectType).filter(ObjectType.id == object_type_id))
    obj_type = result.scalars().first()
    if not obj_type:
        raise ControllerError("Object type not found.")

    logging.debug("Found object type with ID %d.", object_type_id)
    return "Object type was found!", to_dict(obj_type)


@fapi_wrapper
@async_sqlalch_wrapper
async def get_object_types(s: AsyncSession = Depends(SQLALCH_AUTH)) -> tuple[str, List[dict[str, Any]]]:
    """Retrieves all object types.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.

    Returns:
        tuple[str, List[dict[str, Any]]]: A tuple containing a success message and a list of object types.
    """
    result = await s.execute(select(ObjectType).order_by(desc(ObjectType.id)))
    obj_types = result.scalars().all()
    if not obj_types:
        raise ControllerError("No object types found.", [])

    logging.debug("Retrieved %d object types.", len(obj_types))
    return "Object types were found!", to_dict(obj_types)
