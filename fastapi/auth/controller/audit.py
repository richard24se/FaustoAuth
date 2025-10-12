from auth.handlers import JWTBearer
from auth.model.pydantic import PydanticAudit
from auth.service.audit import (
    create_audit,
    delete_audit,
    get_audit,
    get_audits,
    update_audit,
)
from fausto.fapi import Response

from fastapi import APIRouter, Body, Depends

router = APIRouter(
    prefix="/audit",
    tags=["audit"],
    dependencies=[Depends(JWTBearer())],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=Response)
async def list_audits():
    return get_audits()


@router.get("/{audit_id}", response_model=Response)
async def read_audit(audit_id: int):
    return get_audit(audit_id)


@router.post("/", response_model=Response)
async def creating_audit(audit: PydanticAudit):
    return create_audit(audit.__dict__)


@router.put("/{audit_id}", response_model=Response)
async def updating_audit(audit_id: int, audit=Body(...)):
    return update_audit(audit_id, audit)


@router.delete("/{audit_id}", response_model=Response)
async def deleting_audit(audit_id: int):
    return delete_audit(audit_id)


router_audit = router

__all__ = ["router_audit"]
