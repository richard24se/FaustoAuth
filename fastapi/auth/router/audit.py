from typing import Any, List

from auth.handlers import JWTBearer
from auth.dependencies import AuthContext, get_auth_context
from auth.service.audit import AuditService
from config.databases import get_async_db
from fausto.fapi import Response
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/audit",
    tags=["Audit"],
    dependencies=[Depends(JWTBearer())],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=Response, summary="List all audit logs")
async def list_audits(
    s: AsyncSession = Depends(get_async_db), auth: AuthContext = Depends(get_auth_context)
):
    """Retrieve a list of all audit trail records.

    Returns:
        Response: A response object containing a list of audit records.
    """
    tenant_id = None
    if "super-god" not in auth.scopes:
        tenant_id = auth.tenant_id
        if not tenant_id:
             return Response(message="Found", data=[])

    audits = await AuditService.get_audits(s=s, tenant_id=tenant_id)
    return Response(message="Found", data=audits)


@router.get("/{audit_id}", response_model=Response, summary="Get an audit log by ID")
async def read_audit(
    audit_id: int,
    s: AsyncSession = Depends(get_async_db),
    auth: AuthContext = Depends(get_auth_context),
):
    """Retrieve a single audit trail record by its ID.

    Args:
        audit_id (int): The ID of the audit record to retrieve.

    Returns:
        Response: A response object containing the audit record data.
    """
    tenant_id = None
    if "super-god" not in auth.scopes:
        tenant_id = auth.tenant_id
        if not tenant_id:
             from fausto import ControllerError
             raise ControllerError("Unauthorized", status_code=403)

    audit = await AuditService.get_audit(s=s, audit_id=audit_id, tenant_id=tenant_id)
    return Response(message="Found", data=audit)


router_audit = router
