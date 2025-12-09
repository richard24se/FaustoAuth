from typing import Any, Optional

from auth.handlers import JWTBearer
from auth.model.pydantic import ObjectCreate, ObjectUpdate
from auth.service.object import ObjectService
from config.databases import get_async_db
from fausto.fapi import Response
from fastapi import APIRouter, Body, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/object",
    tags=["Objects"],
    dependencies=[Depends(JWTBearer())],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=Response, summary="List all objects")
async def list_objects(
    s: AsyncSession = Depends(get_async_db), role_id: Optional[int] = None
):
    """Retrieve a list of all system objects.

    If `role_id` is provided, the list is filtered to show only objects
    accessible to that role.

    Args:
        role_id (Optional[int]): The ID of the role to filter objects by. Defaults to None.

    Returns:
        Response: A response object containing a list of objects.
    """
    if role_id:
        return await ObjectService.get_object_role(s=s, role_id=role_id)
    return await ObjectService.get_objects(s=s)


@router.get("/{object_id}", response_model=Response, summary="Get an object by ID")
async def read_object(object_id: int, s: AsyncSession = Depends(get_async_db)):
    """Retrieve a single system object by its ID.

    Args:
        object_id (int): The ID of the object to retrieve.

    Returns:
        Response: A response object containing the object data.
    """
    return await ObjectService.get_object(s=s, object_id=object_id)


@router.post(
    "/",
    response_model=Response,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new object",
)
async def creating_object(obj: ObjectCreate, s: AsyncSession = Depends(get_async_db)):
    """Create a new system object that can have permissions applied to it.

    Args:
        obj (ObjectCreate): The object data to create.

    Returns:
        Response: A response object indicating success or failure.
    """
    return await ObjectService.create_object(s=s, data=obj)


@router.put("/{object_id}", response_model=Response, summary="Update an object")
async def updating_object(
    object_id: int, obj: ObjectUpdate, s: AsyncSession = Depends(get_async_db)
):
    """Update an existing system object by its ID.

    Args:
        object_id (int): The ID of the object to update.
        obj (ObjectUpdate): The updated object data.

    Returns:
        Response: A response object indicating success or failure.
    """
    return await ObjectService.update_object(s=s, object_id=object_id, data=obj)


@router.delete(
    "/{object_id}",
    response_model=Response,
    summary="Delete an object",
)
async def deleting_object(object_id: int, s: AsyncSession = Depends(get_async_db)):
    """Delete a system object by its ID.

    Args:
        object_id (int): The ID of the object to delete.

    Returns:
        Response: A response object indicating success or failure.
    """
    return await ObjectService.delete_object(s=s, object_id=object_id)


router_object = router