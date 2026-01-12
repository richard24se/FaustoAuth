from typing import Any

from auth.handlers import JWTBearer
from auth.model.pydantic import PermissionTypeCreate, PermissionTypeUpdate
from auth.service.permission_type import PermissionTypeService
from config.databases import get_async_db
from fausto.fapi import Response
from fastapi import APIRouter, Body, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/permission_types",
    tags=["Permission Types"],
    dependencies=[Depends(JWTBearer())],
    responses={404: {"description": "Not found"}},
)


async def get_permission_type_service(
    s: AsyncSession = Depends(get_async_db),
) -> PermissionTypeService:
    return PermissionTypeService(s)


@router.get("/", response_model=Response, summary="List all permission types")
async def list_permission_types(
    service: PermissionTypeService = Depends(get_permission_type_service),
):
    """Retrieve a list of all permission types.

    Returns:
        Response: A response object containing a list of permission types.
    """
    perm_types = await service.get_multi()
    return Response(message="Found", data=perm_types)


@router.get(
    "/{permission_type_id}",
    response_model=Response,
    summary="Get a permission type by ID",
)
async def read_permission_type(
    permission_type_id: int,
    service: PermissionTypeService = Depends(get_permission_type_service),
):
    """Retrieve a single permission type by its ID.

    Args:
        permission_type_id (int): The ID of the permission type to retrieve.

    Returns:
        Response: A response object containing the permission type data.
    """
    perm_type = await service.get(id=permission_type_id)
    if not perm_type:
        # CRUDBase raises 404, but just in case
        from fausto import ControllerError
        raise ControllerError("Permission type not found.", status_code=404)
        
    return Response(message="Found", data=perm_type)


@router.post(
    "/",
    response_model=Response,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new permission type",
)
async def creating_permission_type(
    permission_type: PermissionTypeCreate,
    service: PermissionTypeService = Depends(get_permission_type_service),
):
    """Create a new permission type.

    Args:
        permission_type (PermissionTypeCreate): The permission type data to create.

    Returns:
        Response: A response object indicating success or failure.
    """
    new_perm_type = await service.create(obj_in=permission_type)
    return Response(message="Saved successful!", data=new_perm_type)


@router.put(
    "/{permission_type_id}",
    response_model=Response,
    summary="Update a permission type",
)
async def updating_permission_type(
    permission_type_id: int,
    permission_type: PermissionTypeUpdate,
    service: PermissionTypeService = Depends(get_permission_type_service),
):
    """Update an existing permission type by its ID.

    Args:
        permission_type_id (int): The ID of the permission type to update.
        permission_type (PermissionTypeUpdate): The updated permission type data.

    Returns:
        Response: A response object indicating success or failure.
    """
    updated_perm_type = await service.update(
        id=permission_type_id, obj_in=permission_type
    )
    return Response(message="Update successful!", data=updated_perm_type)


@router.delete(
    "/{permission_type_id}",
    response_model=Response,
    summary="Delete a permission type",
)
async def deleting_permission_type(
    permission_type_id: int,
    service: PermissionTypeService = Depends(get_permission_type_service),
):
    """Delete a permission type by its ID.

    Args:
        permission_type_id (int): The ID of the permission type to delete.

    Returns:
        Response: A response object indicating success or failure.
    """
    deleted_perm_type = await service.remove(id=permission_type_id)
    return Response(message="Deleted successful!", data=deleted_perm_type)


router_permission_type = router


