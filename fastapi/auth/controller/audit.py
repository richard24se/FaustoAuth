

import logging
from fastapi import APIRouter, Depends
from fastapi import Body

from auth.handlers import JWTBearer
from fausto.fapi import Response
from auth.service.audit import get_audit, get_audits, create_audit, update_audit, delete_audit
from auth.model.pydantic import PydanticAudit

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
