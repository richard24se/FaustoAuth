from auth.handlers import JWTBearer
from auth.model.pydantic import PydanticUser
from auth.service.user import (
    create_user,
    delete_user,
    get_user,
    get_user_name,
    get_users,
    update_user,
)
from fausto.fapi import Response

from fastapi import APIRouter, Body, Depends

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
