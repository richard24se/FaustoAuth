from typing import Any, Optional

from auth.handlers import JWTBearer
from auth.model.pydantic import PermissionCreate, PermissionUpdate
from auth.service.permission import (
    create_permission,
    delete_permission,
    get_permission,
    get_permissions,
    update_permission,
)
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


@router.get("/", response_model=Response, summary="List all permissions")
async def list_permissions(
    s: AsyncSession = Depends(get_async_db),
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
    return await get_permissions(
        s=s, obj_name=obj_name, username=username, role_id=role_id
    )


@router.get(
    "/{permission_id}", response_model=Response, summary="Get a permission by ID"
)
async def read_permission(permission_id: int, s: AsyncSession = Depends(get_async_db)):
    """Retrieve a single permission by its ID.

    Args:
        permission_id (int): The ID of the permission to retrieve.

    Returns:
        Response: A response object containing the permission data.
    """
    return await get_permission(s=s, permission_id=permission_id)


@router.post(
    "/",
    response_model=Response,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new permission",
)
async def creating_permission(
    permission: PermissionCreate, s: AsyncSession = Depends(get_async_db)
):
    """Create a new permission.

    Args:
        permission (PermissionCreate): The permission data to create.

    Returns:
        Response: A response object indicating success or failure.
    """
    return await create_permission(s=s, data=permission)


@router.put(
    "/{permission_id}", response_model=Response, summary="Update a permission"
)
async def updating_permission(
    permission_id: int, permission: PermissionUpdate, s: AsyncSession = Depends(get_async_db)
):
    """Update an existing permission by its ID.

    Args:
        permission_id (int): The ID of the permission to update.
        permission (PermissionUpdate): The updated permission data.

    Returns:
        Response: A response object indicating success or failure.
    """
    return await update_permission(s=s, permission_id=permission_id, data=permission)


@router.delete(
    "/{permission_id}",
    response_model=Response,
    summary="Delete a permission",
)
async def deleting_permission(permission_id: int, s: AsyncSession = Depends(get_async_db)):
    """Delete a permission by its ID.

    Args:
        permission_id (int): The ID of the permission to delete.

    Returns:
        Response: A response object indicating success or failure.
    """
    return await delete_permission(s=s, permission_id=permission_id)


router_permission = router