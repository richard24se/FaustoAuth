from auth.handlers import JWTBearer
from auth.model.pydantic import RoleCreate, RoleUpdate
from auth.service.role import create_role, delete_role, get_role, get_roles, update_role
from config.databases import get_async_db
from fausto.fapi import Response
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/role",
    tags=["Roles"],
    dependencies=[Depends(JWTBearer())],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=Response, summary="List all roles")
async def list_roles(s: AsyncSession = Depends(get_async_db)):
    """Retrieve a list of all user roles.

    Returns:
        Response: A response object containing a list of roles.
    """
    return await get_roles(s=s)


@router.get("/{role_id}", response_model=Response, summary="Get a role by ID")
async def read_role(role_id: int, s: AsyncSession = Depends(get_async_db)):
    """Retrieve a single role by its ID.

    Args:
        role_id (int): The ID of the role to retrieve.

    Returns:
        Response: A response object containing the role data.
    """
    return await get_role(s=s, role_id=role_id)


@router.post(
    "/",
    response_model=Response,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new role",
)
async def creating_role(role: RoleCreate, s: AsyncSession = Depends(get_async_db)):
    """Create a new user role.

    Associates it with a list of permission IDs.

    Args:
        role (RoleCreate): The role data to create.

    Returns:
        Response: A response object indicating success or failure.
    """
    return await create_role(s=s, data=role)


@router.put("/{role_id}", response_model=Response, summary="Update a role")
async def updating_role(role_id: int, role: RoleUpdate, s: AsyncSession = Depends(get_async_db)):
    """Update an existing role's details and its associated permissions.

    Args:
        role_id (int): The ID of the role to update.
        role (RoleUpdate): The updated role data.

    Returns:
        Response: A response object indicating success or failure.
    """
    return await update_role(s=s, role_id=role_id, data=role)


@router.delete(
    "/{role_id}",
    response_model=Response,
    summary="Delete a role",
)
async def deleting_role(role_id: int, s: AsyncSession = Depends(get_async_db)):
    """Delete a role by its ID.

    Args:
        role_id (int): The ID of the role to delete.

    Returns:
        Response: A response object indicating success or failure.
    """
    return await delete_role(s=s, role_id=role_id)


router_role = router