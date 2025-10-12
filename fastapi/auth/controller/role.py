from auth.handlers import JWTBearer
from auth.model.pydantic import PydanticRole
from auth.service.role import create_role, delete_role, get_role, get_roles, update_role
from fausto.fapi import Response

from fastapi import APIRouter, Body, Depends

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
