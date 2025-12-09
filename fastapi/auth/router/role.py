from auth.handlers import JWTBearer
from auth.model.pydantic import RoleCreate, RoleUpdate
from auth.service.role import RoleService
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


async def get_role_service(s: AsyncSession = Depends(get_async_db)) -> RoleService:
    return RoleService(s)


@router.get("/", response_model=Response, summary="List all roles")
async def list_roles(service: RoleService = Depends(get_role_service)):
    """Retrieve a list of all user roles.

    Returns:
        Response: A response object containing a list of roles.
    """
    return await service.get_multi()


@router.get("/{role_id}", response_model=Response, summary="Get a role by ID")
async def read_role(role_id: int, service: RoleService = Depends(get_role_service)):
    """Retrieve a single role by its ID.

    Args:
        role_id (int): The ID of the role to retrieve.

    Returns:
        Response: A response object containing the role data.
    """
    return await service.get(id=role_id)


@router.post(
    "/",
    response_model=Response,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new role",
)
async def creating_role(
    role: RoleCreate, service: RoleService = Depends(get_role_service)
):
    """Create a new user role.

    Associates it with a list of permission IDs.

    Args:
        role (RoleCreate): The role data to create.

    Returns:
        Response: A response object indicating success or failure.
    """
    return await service.create(obj_in=role)


@router.put("/{role_id}", response_model=Response, summary="Update a role")
async def updating_role(
    role_id: int, role: RoleUpdate, service: RoleService = Depends(get_role_service)
):
    """Update an existing role's details and its associated permissions.

    Args:
        role_id (int): The ID of the role to update.
        role (RoleUpdate): The updated role data.

    Returns:
        Response: A response object indicating success or failure.
    """
    return await service.update(id=role_id, obj_in=role)


@router.delete(
    "/{role_id}",
    response_model=Response,
    summary="Delete a role",
)
async def deleting_role(
    role_id: int, service: RoleService = Depends(get_role_service)
):
    """Delete a role by its ID.

    Args:
        role_id (int): The ID of the role to delete.

    Returns:
        Response: A response object indicating success or failure.
    """
    return await service.remove(id=role_id)


router_role = router