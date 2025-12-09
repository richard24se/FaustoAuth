from typing import Any, Optional

from auth.handlers import JWTBearer
from auth.model.pydantic import PermissionCreate, PermissionUpdate
from auth.service.permission import PermissionService
from config.databases import get_async_db
from fausto.fapi import Response
from fastapi import APIRouter, Body, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/permission",
    tags=["Permissions"],
    dependencies=[Depends(JWTBearer())],
    responses={404: {"description": "Not found"}},
)


async def get_permission_service(s: AsyncSession = Depends(get_async_db)) -> PermissionService:
    return PermissionService(s)


@router.get("/", response_model=Response, summary="List all permissions")
async def list_permissions(
    service: PermissionService = Depends(get_permission_service),
    obj_name: Optional[str] = None,
    username: Optional[str] = None,
    role_id: Optional[int] = None,
):
    """Retrieve a list of permissions.

    The list can be filtered by the following query parameters:
    - **obj_name** and **username**: Get permissions for a specific user on a specific object.
    - **role_id**: Get all permissions associated with a specific role.
    - If no parameters are provided, all permissions are returned.

    Args:
        obj_name (Optional[str]): The name of the object to filter by. Defaults to None.
        username (Optional[str]): The username to filter by. Defaults to None.
        role_id (Optional[int]): The role ID to filter by. Defaults to None.

    Returns:
        Response: A response object containing a list of permissions.
    """
    permissions = await service.get_permissions(
        obj_name=obj_name, username=username, role_id=role_id
    )
    return Response(message="Found", data=permissions)


@router.get(
    "/{permission_id}", response_model=Response, summary="Get a permission by ID"
)
async def read_permission(
    permission_id: int, service: PermissionService = Depends(get_permission_service)
):
    """Retrieve a single permission by its ID.

    Args:
        permission_id (int): The ID of the permission to retrieve.

    Returns:
        Response: A response object containing the permission data.
    """
    permission = await service.get(id=permission_id)
    return Response(message="Found", data=permission)


@router.post(
    "/",
    response_model=Response,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new permission",
)
async def creating_permission(
    permission: PermissionCreate,
    service: PermissionService = Depends(get_permission_service),
):
    """Create a new permission.

    Args:
        permission (PermissionCreate): The permission data to create.

    Returns:
        Response: A response object indicating success or failure.
    """
    new_permission = await service.create(obj_in=permission.model_dump())
    return Response(message="Saved successful!", data=new_permission)


@router.put(
    "/{permission_id}", response_model=Response, summary="Update a permission"
)
async def updating_permission(
    permission_id: int,
    permission: PermissionUpdate,
    service: PermissionService = Depends(get_permission_service),
):
    """Update an existing permission by its ID.

    Args:
        permission_id (int): The ID of the permission to update.
        permission (PermissionUpdate): The updated permission data.

    Returns:
        Response: A response object indicating success or failure.
    """
    updated_permission = await service.update(id=permission_id, obj_in=permission.model_dump(exclude_unset=True))
    return Response(message="Update successful!", data=updated_permission)


@router.delete(
    "/{permission_id}",
    response_model=Response,
    summary="Delete a permission",
)
async def deleting_permission(
    permission_id: int, service: PermissionService = Depends(get_permission_service)
):
    """Delete a permission by its ID.

    Args:
        permission_id (int): The ID of the permission to delete.

    Returns:
        Response: A response object indicating success or failure.
    """
    deleted_permission = await service.remove(id=permission_id)
    return Response(message="Deleted successful!", data=deleted_permission)


router_permission = router