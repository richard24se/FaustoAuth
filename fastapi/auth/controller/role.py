

import logging
from fastapi import APIRouter, Depends
from fastapi import Body

from auth.handlers import JWTBearer
from fausto.fapi import Response
from auth.service.role import get_roles, get_role, create_role, update_role, delete_role
from auth.model.pydantic import PydanticRole

router = APIRouter(
    prefix="/role",
    tags=["role"],
    dependencies=[Depends(JWTBearer())],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=Response)
async def list_roles():
    return get_roles()


@router.get("/{role_id}", response_model=Response)
async def read_role(role_id: int):
    return get_role(role_id)


@router.post("/", response_model=Response)
async def creating_role(role: PydanticRole):
    return create_role(role.__dict__)


@router.put("/{role_id}", response_model=Response)
async def updating_role(role_id: int, role=Body(...)):
    return update_role(role_id, role)


@router.delete("/{role_id}", response_model=Response)
async def deleting_role(role_id: int):
    return delete_role(role_id)

router_role = router
