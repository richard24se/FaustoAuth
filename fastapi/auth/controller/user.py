from typing import Any

from auth.handlers import JWTBearer
from auth.model.pydantic import UserCreate, UserUpdate
from auth.service.user import (
    create_user,
    delete_user,
    get_user,
    get_user_name,
    get_users,
    update_user,
)
from config.databases import get_async_db
from fausto.fapi import Response
from fastapi import APIRouter, Body, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/user",
    tags=["Users"],
    dependencies=[Depends(JWTBearer())],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=Response, summary="List all users")
async def list_users(s: AsyncSession = Depends(get_async_db)):
    """Retrieve a list of all users.

    Passwords are not included.

    Returns:
        Response: A response object containing a list of users.
    """
    return await get_users(s=s)


@router.get("/{user_id}", response_model=Response, summary="Get a user by ID")
async def read_user(user_id: int, s: AsyncSession = Depends(get_async_db)):
    """Retrieve a single user by their ID.

    The password is not included.

    Args:
        user_id (int): The ID of the user to retrieve.

    Returns:
        Response: A response object containing the user data.
    """
    return await get_user(s=s, user_id=user_id)


@router.get(
    "/{username}/permissions",
    response_model=Response,
    summary="Get a user's profile and permissions by username",
)
async def read_user_permission(username: str, s: AsyncSession = Depends(get_async_db)):
    """Retrieve a user's profile, including their role and detailed permissions.

    Args:
        username (str): The username to look up.

    Returns:
        Response: A response object containing the user's profile and permissions.
    """
    return await get_user_name(s=s, username=username)


@router.post(
    "/",
    response_model=Response,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user",
)
async def creating_user(user: UserCreate, s: AsyncSession = Depends(get_async_db)):
    """Create a new user.

    The password will be hashed upon creation.

    Args:
        user (UserCreate): The user data to create.

    Returns:
        Response: A response object indicating success or failure.
    """
    return await create_user(s=s, data=user)


@router.put("/{user_id}", response_model=Response, summary="Update a user")
async def updating_user(user_id: int, user: UserUpdate, s: AsyncSession = Depends(get_async_db)):
    """Update an existing user's details by their ID.

    Args:
        user_id (int): The ID of the user to update.
        user (UserUpdate): The updated user data.

    Returns:
        Response: A response object indicating success or failure.
    """
    return await update_user(s=s, user_id=user_id, data=user)


@router.delete(
    "/{user_id}",
    response_model=Response,
    summary="Delete a user",
)
async def deleting_user(user_id: int, s: AsyncSession = Depends(get_async_db)):
    """Delete a user by their ID.

    The system's super-user cannot be deleted.

    Args:
        user_id (int): The ID of the user to delete.

    Returns:
        Response: A response object indicating success or failure.
    """
    return await delete_user(s=s, user_id=user_id)


router_user = router