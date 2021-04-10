

import logging
from fastapi import APIRouter, Depends
from fastapi import Body

from auth.handlers import JWTBearer
from fausto.fapi import Response
from auth.service.permission_type import get_permission_type, get_permission_types, create_permission_type, update_permission_type, delete_permission_type
from auth.model.pydantic import PydanticPermissionType

router = APIRouter(
    prefix="/permission_types",
    tags=["permission_types"],
    dependencies=[Depends(JWTBearer())],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=Response)
async def list_permission_types():
    return get_permission_types()


@router.get("/{permission_type_id}", response_model=Response)
async def read_permission_type(permission_type_id: int):
    return get_permission_type(permission_type_id)


@router.post("/", response_model=Response)
async def creating_permission_type(permission_type: PydanticPermissionType):
    return create_permission_type(permission_type.__dict__)


@router.put("/{permission_type_id}", response_model=Response)
async def updating_permission_type(permission_type_id: int, permission_type=Body(...)):
    return update_permission_type(permission_type_id, permission_type)


@router.delete("/{permission_type_id}", response_model=Response)
async def deleting_permission_type(permission_type_id: int):
    return delete_permission_type(permission_type_id)

router_permission_type = router
