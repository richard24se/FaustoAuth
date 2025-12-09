from typing import Any

from auth.handlers import JWTBearer
from auth.model.pydantic import ObjectTypeCreate, ObjectTypeUpdate
from auth.service.object_type import ObjectTypeService
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
    obj_types = await ObjectTypeService.get_object_types(s=s)
    return Response(message="Found", data=obj_types)


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
    obj_type = await ObjectTypeService.get_object_type(s=s, object_type_id=object_type_id)
    return Response(message="Found", data=obj_type)


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
    new_obj_type = await ObjectTypeService.create_object_type(s=s, data=object_type.model_dump())
    return Response(message="Saved successful!", data=new_obj_type)


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
    updated_obj_type = await ObjectTypeService.update_object_type(
        s=s, object_type_id=object_type_id, data=object_type.model_dump(exclude_unset=True)
    )
    return Response(message="Update successful!", data=updated_obj_type)


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
    deleted_obj_type = await ObjectTypeService.delete_object_type(s=s, object_type_id=object_type_id)
    return Response(message="Deleted successful!", data=deleted_obj_type)


router_object_type = router