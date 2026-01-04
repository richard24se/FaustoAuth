from typing import Optional

from auth.dependencies import AuthContext, get_auth_context
from auth.handlers import JWTBearer
from auth.model.pydantic import ObjectCreate, ObjectUpdate
from auth.service.object import ObjectService
from config.databases import get_async_db
from fausto.fapi import Response
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import APIRouter, Depends, status

router = APIRouter(
    prefix="/object",
    tags=["Objects"],
    dependencies=[Depends(JWTBearer())],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=Response, summary="List all objects")
async def list_objects(
    s: AsyncSession = Depends(get_async_db),
    role_id: Optional[int] = None,
    auth: AuthContext = Depends(get_auth_context),
):
    """Retrieve a list of all system objects.

    If `role_id` is provided, the list is filtered to show only objects
    accessible to that role.

    Args:
        role_id (Optional[int]): The ID of the role to filter objects by. Defaults to None.

    Returns:
        Response: A response object containing a list of objects.
    """
    service = ObjectService(s)

    if role_id:
        objects = await service.get_object_role(role_id=role_id)
    else:
        # get_multi automatically applies tenant filtering via CRUDBase
        objects = await service.get_multi()

    return Response(message="Found", data=objects)


@router.get("/{object_id}", response_model=Response, summary="Get an object by ID")
async def read_object(
    object_id: int,
    s: AsyncSession = Depends(get_async_db),
    auth: AuthContext = Depends(get_auth_context),
):
    """Retrieve a single system object by its ID."""
    service = ObjectService(s)
    # get automatically applies tenant filtering via CRUDBase
    obj = await service.get(id=object_id)
    return Response(message="Found", data=obj)


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
    service = ObjectService(s)
    new_obj = await service.create(obj_in=obj)
    return Response(message="Saved successful!", data=new_obj)


@router.put("/{object_id}", response_model=Response, summary="Update an object")
async def updating_object(
    object_id: int,
    obj: ObjectUpdate,
    s: AsyncSession = Depends(get_async_db),
    auth: AuthContext = Depends(get_auth_context),
):
    """Update an existing system object by its ID."""
    service = ObjectService(s)
    # update automatically applies tenant filtering via CRUDBase
    updated_obj = await service.update(id=object_id, obj_in=obj)
    return Response(message="Update successful!", data=updated_obj)


@router.delete(
    "/{object_id}",
    response_model=Response,
    summary="Delete an object",
)
async def deleting_object(
    object_id: int,
    s: AsyncSession = Depends(get_async_db),
    auth: AuthContext = Depends(get_auth_context),
):
    """Delete a system object by its ID."""
    service = ObjectService(s)
    # remove automatically applies tenant filtering via CRUDBase
    deleted_obj = await service.remove(id=object_id)
    return Response(message="Deleted successful!", data=deleted_obj)


router_object = router
