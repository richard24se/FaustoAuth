

import logging
from fastapi import APIRouter, Depends
from fastapi import Body
from pydantic import BaseModel
from typing import Optional, Any, Union

from auth.handlers import JWTBearer
from fausto.fapi import Response, fapi_get_bearer_token
from auth.service.auth import validate_user, revoke_user, check_blacklist_user, refresh_user
from auth.service.user import get_users, get_user, create_user, update_user, delete_user, get_user_name
from auth.model.pydantic import PydanticUser
router = APIRouter(
    prefix="/user",
    tags=["user"],
    dependencies=[Depends(JWTBearer())],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=Response)
async def list_users():
    return get_users()


@router.get("/{user_id}", response_model=Response)
async def read_user(user_id: int):
    return get_user(user_id)

@router.get("/permission/{username}", response_model=Response)
async def read_user_permission(username: str):
    return get_user_name(username)

@router.post("/", response_model=Response)
async def creating_user(user: PydanticUser):
    return create_user(user.__dict__)

@router.put("/{user_id}", response_model=Response)
async def updating_user(user_id: int, user=Body(...)):
    return update_user(user_id, user)

@router.delete("/{user_id}", response_model=Response)
async def deleting_user(user_id: int):
    return delete_user(user_id)

router_user = router