from auth.handlers import JWTBearer
from auth.dependencies import AuthContext, get_auth_context
from auth.model.pydantic import UserCreate, UserUpdate
from auth.service.user import UserService
from config.databases import get_async_db
from fausto.fapi import Response
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

"""
User Management Router.

This module provides CRUD (Create, Read, Update, Delete) endpoints for ensuring
lifecycle management of system users. All endpoints (except potential future public ones)
are protected by JWT authentication.
"""

router = APIRouter(
    prefix="/user",
    tags=["Users"],
    dependencies=[Depends(JWTBearer())],
    responses={404: {"description": "Not found"}},
)


async def get_user_service(s: AsyncSession = Depends(get_async_db)) -> UserService:
    return UserService(s)


@router.get("/", response_model=Response, summary="List all users")
async def list_users(
    service: UserService = Depends(get_user_service),
    auth: AuthContext = Depends(get_auth_context),
):
    """Retrieve a list of all users.

    Returns:
        Response: A response object containing a list of users.
    """
    filters = {}
    if "super-god" not in auth.scopes:
        if auth.tenant_id:
            filters["tenant_id"] = auth.tenant_id
        else:
             return Response(message="Found", data=[])

    users = await service.get_multi(filters=filters)
    return Response(message="Found", data=users)


@router.get("/{user_id}", response_model=Response, summary="Get a user by ID")
async def read_user(
    user_id: int,
    service: UserService = Depends(get_user_service),
    auth: AuthContext = Depends(get_auth_context),
):
    """Retrieve a single user by their ID."""
    from fausto import ControllerError

    user = await service.get(id=user_id)
    if not user:
         raise ControllerError("User not found", status_code=404)

    if "super-god" not in auth.scopes:
        if not auth.tenant_id or user.get("tenant_id") != auth.tenant_id:
             raise ControllerError("Not authorized to access this user", status_code=403)

    return Response(message="Found", data=user)


@router.get(
    "/permission/{username}",
    response_model=Response,
    summary="Get user permissions",
)
async def read_user_permission(
    username: str,
    service: UserService = Depends(get_user_service),
):
    """Retrieve a user by username along with their role and permissions.

    Args:
        username (str): The username of the user.

    Returns:
        Response: A response object containing the user data with permissions.
    """
    user_data = await service.get_user_name(username=username)
    return Response(message="Found", data=user_data)


@router.post(
    "/",
    response_model=Response,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user",
)
async def creating_user(
    user: UserCreate,
    service: UserService = Depends(get_user_service),
):
    """Create a new user.

    Args:
        user (UserCreate): The user data to create.

    Returns:
        Response: A response object indicating success or failure.
    """
    new_user = await service.create(obj_in=user.model_dump())
    return Response(message="Saved successful!", data=new_user)


@router.put("/{user_id}", response_model=Response, summary="Update a user")
async def updating_user(
    user_id: int,
    user: UserUpdate,
    service: UserService = Depends(get_user_service),
    auth: AuthContext = Depends(get_auth_context),
):
    """Update an existing user's details."""
    from fausto import ControllerError

    # Check existence and permission
    existing_user = await service.get(id=user_id)
    if not existing_user:
        raise ControllerError("User not found", status_code=404)

    if "super-god" not in auth.scopes:
        if not auth.tenant_id or existing_user.get("tenant_id") != auth.tenant_id:
                raise ControllerError("Not authorized to update this user", status_code=403)

    updated_user = await service.update(id=user_id, obj_in=user.model_dump(exclude_unset=True))
    return Response(message="Update successful!", data=updated_user)


@router.delete(
    "/{user_id}",
    response_model=Response,
    summary="Delete a user",
)
async def deleting_user(
    user_id: int,
    service: UserService = Depends(get_user_service),
    auth: AuthContext = Depends(get_auth_context),
):
    """Delete a user by their ID."""
    from fausto import ControllerError

    # Check existence and permission
    existing_user = await service.get(id=user_id)
    if not existing_user:
        raise ControllerError("User not found", status_code=404)

    if "super-god" not in auth.scopes:
        if not auth.tenant_id or existing_user.get("tenant_id") != auth.tenant_id:
                raise ControllerError("Not authorized to delete this user", status_code=403)

    deleted_user = await service.remove(id=user_id)
    return Response(message="Deleted successful!", data=deleted_user)


router_user = router