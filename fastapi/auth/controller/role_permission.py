from auth.handlers import JWTBearer
from auth.service.role_permission import get_role_permission
from fausto.fapi import Response

from fastapi import APIRouter, Depends

router = APIRouter(
    prefix="/role_permission",
    tags=["role_permission"],
    dependencies=[Depends(JWTBearer())],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=Response)
async def read_role_permission(role: int):
    return get_role_permission(role)


router_role_permission = router
