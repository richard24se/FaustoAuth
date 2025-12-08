from typing import Any

from auth.handlers import JWTBearer
from auth.model.pydantic import PermissionTypeCreate, PermissionTypeUpdate
from auth.service.permission_type import (
    create_permission_type,
    delete_permission_type,
    get_permission_type,
    get_permission_types,
    update_permission_type,
)
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


@router.get("/", response_model=Response, summary="List all permission types")
async def list_permission_types(s: AsyncSession = Depends(get_async_db)):
    """Retrieve a list of all permission types.

    Returns:
        Response: A response object containing a list of permission types.
    """
    return await get_permission_types(s=s)


@router.get(
    "/{permission_type_id}",
    response_model=Response,
    summary="Get a permission type by ID",
)
async def read_permission_type(
    permission_type_id: int, s: AsyncSession = Depends(get_async_db)
):
    """Retrieve a single permission type by its ID.

    Args:
        permission_type_id (int): The ID of the permission type to retrieve.

    Returns:
        Response: A response object containing the permission type data.
    """
    return await get_permission_type(s=s, permission_type_id=permission_type_id)


@router.post(
    "/",
    response_model=Response,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new permission type",
)
async def creating_permission_type(
    permission_type: PermissionTypeCreate, s: AsyncSession = Depends(get_async_db)
):
    """Create a new permission type.

    Args:
        permission_type (PermissionTypeCreate): The permission type data to create.

    Returns:
        Response: A response object indicating success or failure.
    """
    return await create_permission_type(s=s, data=permission_type)


@router.put(
    "/{permission_type_id}",
    response_model=Response,
    summary="Update a permission type",
)
async def updating_permission_type(
    permission_type_id: int,
    permission_type: PermissionTypeUpdate,
    s: AsyncSession = Depends(get_async_db),
):
    """Update an existing permission type by its ID.

    Args:
        permission_type_id (int): The ID of the permission type to update.
        permission_type (PermissionTypeUpdate): The updated permission type data.

    Returns:
        Response: A response object indicating success or failure.
    """
    return await update_permission_type(
        s=s, permission_type_id=permission_type_id, data=permission_type
    )


@router.delete(
    "/{permission_type_id}",
    response_model=Response,
    summary="Delete a permission type",
)
async def deleting_permission_type(
    permission_type_id: int, s: AsyncSession = Depends(get_async_db)
):
    """Delete a permission type by its ID.

    Args:
        permission_type_id (int): The ID of the permission type to delete.

    Returns:
        Response: A response object indicating success or failure.
    """
    return await delete_permission_type(s=s, permission_type_id=permission_type_id)


router_permission_type = router