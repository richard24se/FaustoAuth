from auth.handlers import JWTBearer
from auth.model.pydantic import PydanticAuditType
from auth.service.audit_type import (
    create_audit_type,
    delete_audit_type,
    get_audit_type,
    get_audit_types,
    update_audit_type,
)
from fausto.fapi import Response

from fastapi import APIRouter, Body, Depends

router = APIRouter(
    prefix="/audit_type",
    tags=["audit_type"],
    dependencies=[Depends(JWTBearer())],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=Response)
async def list_audit_types():
    return get_audit_types()


@router.get("/{audit_type_id}", response_model=Response)
async def read_audit_type(audit_type_id: int):
    return get_audit_type(audit_type_id)


@router.post("/", response_model=Response)
async def creating_audit_type(audit_type: PydanticAuditType):
    return create_audit_type(audit_type.__dict__)


@router.put("/{audit_type_id}", response_model=Response)
async def updating_audit_type(audit_type_id: int, audit_type=Body(...)):
    return update_audit_type(audit_type_id, audit_type)


@router.delete("/{audit_type_id}", response_model=Response)
async def deleting_audit_type(audit_type_id: int):
    return delete_audit_type(audit_type_id)


router_audit_type = router
