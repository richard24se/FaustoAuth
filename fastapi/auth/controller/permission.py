from auth.handlers import JWTBearer
from auth.model.pydantic import PydanticPermission
from auth.service.permission import (
    create_permission,
    delete_permission,
    get_permission,
    get_permissions,
    update_permission,
)
from fausto.fapi import Response

from fastapi import APIRouter, Body, Depends

router = APIRouter(
    prefix="/permission",
    tags=["permission"],
    dependencies=[Depends(JWTBearer())],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=Response)
async def list_permissions(user: str = None, obj: str = None, role: str = None):
    return get_permissions(obj, user, role)


@router.get("/{permission_id}", response_model=Response)
async def read_permission(permission_id: int):
    return get_permission(permission_id)


@router.post("/", response_model=Response)
async def creating_permission(permission: PydanticPermission):
    return create_permission(permission.__dict__)


@router.put("/{permission_id}", response_model=Response)
async def updating_permission(permission_id: int, permission=Body(...)):
    return update_permission(permission_id, permission)


@router.delete("/{permission_id}", response_model=Response)
async def deleting_permission(permission_id: int):
    return delete_permission(permission_id)


router_permission = router
