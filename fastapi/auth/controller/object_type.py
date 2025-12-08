from typing import Any

from auth.handlers import JWTBearer
from auth.model.pydantic import ObjectTypeCreate, ObjectTypeUpdate
from auth.service.object_type import (
    create_object_type,
    delete_object_type,
    get_object_type,
    get_object_types,
    update_object_type,
)
from config.databases import get_async_db
from fausto.fapi import Response
from fastapi import APIRouter, Body, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/object_types",
    tags=["Object Types"],
    dependencies=[Depends(JWTBearer())],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=Response, summary="List all object types")
async def list_object_types(s: AsyncSession = Depends(get_async_db)):
    """Retrieve a list of all object types.

    Returns:
        Response: A response object containing a list of object types.
    """
    return await get_object_types(s=s)


@router.get(
    "/{object_type_id}", response_model=Response, summary="Get an object type by ID"
)
async def read_object_type(
    object_type_id: int, s: AsyncSession = Depends(get_async_db)
):
    """Retrieve a single object type by its ID.

    Args:
        object_type_id (int): The ID of the object type to retrieve.

    Returns:
        Response: A response object containing the object type data.
    """
    return await get_object_type(s=s, object_type_id=object_type_id)


@router.post(
    "/",
    response_model=Response,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new object type",
)
async def creating_object_type(
    object_type: ObjectTypeCreate, s: AsyncSession = Depends(get_async_db)
):
    """Create a new object type.

    Args:
        object_type (ObjectTypeCreate): The object type data to create.

    Returns:
        Response: A response object indicating success or failure.
    """
    return await create_object_type(s=s, data=object_type)


@router.put(
    "/{object_type_id}", response_model=Response, summary="Update an object type"
)
async def updating_object_type(
    object_type_id: int,
    object_type: ObjectTypeUpdate,
    s: AsyncSession = Depends(get_async_db),
):
    """Update an existing object type by its ID.

    Args:
        object_type_id (int): The ID of the object type to update.
        object_type (ObjectTypeUpdate): The updated object type data.

    Returns:
        Response: A response object indicating success or failure.
    """
    return await update_object_type(
        s=s, object_type_id=object_type_id, data=object_type
    )


@router.delete(
    "/{object_type_id}",
    response_model=Response,
    summary="Delete an object type",
)
async def deleting_object_type(
    object_type_id: int, s: AsyncSession = Depends(get_async_db)
):
    """Delete an object type by its ID.

    Args:
        object_type_id (int): The ID of the object type to delete.

    Returns:
        Response: A response object indicating success or failure.
    """
    return await delete_object_type(s=s, object_type_id=object_type_id)


router_object_type = router