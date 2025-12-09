from auth.handlers import JWTBearer
from auth.model.pydantic import UserCreate, UserUpdate
from auth.service.user import UserService
from config.databases import get_async_db
from fausto.fapi import Response
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

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
):
    """Retrieve a list of all users.

    Returns:
        Response: A response object containing a list of users.
    """
    return await service.get_multi()


@router.get("/{user_id}", response_model=Response, summary="Get a user by ID")
async def read_user(
    user_id: int,
    service: UserService = Depends(get_user_service),
):
    """Retrieve a single user by their ID.

    Args:
        user_id (int): The ID of the user to retrieve.

    Returns:
        Response: A response object containing the user data.
    """
    return await service.get(id=user_id)


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
    return await service.get_user_name(username=username)


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
    return await service.create(obj_in=user)


@router.put("/{user_id}", response_model=Response, summary="Update a user")
async def updating_user(
    user_id: int,
    user: UserUpdate,
    service: UserService = Depends(get_user_service),
):
    """Update an existing user's details.

    Args:
        user_id (int): The ID of the user to update.
        user (UserUpdate): The updated user data.

    Returns:
        Response: A response object indicating success or failure.
    """
    return await service.update(id=user_id, obj_in=user)


@router.delete(
    "/{user_id}",
    response_model=Response,
    summary="Delete a user",
)
async def deleting_user(
    user_id: int,
    service: UserService = Depends(get_user_service),
):
    """Delete a user by their ID.

    Args:
        user_id (int): The ID of the user to delete.

    Returns:
        Response: A response object indicating success or failure.
    """
    return await service.remove(id=user_id)


router_user = router