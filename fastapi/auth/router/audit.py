from typing import Optional

from auth.dependencies import AuthContext, get_auth_context
from auth.handlers import JWTBearer
from auth.model.pydantic import AuditCreate, AuditUpdate
from auth.service.audit import AuditService
from config.databases import get_async_db
from fausto import ControllerError
from fausto.fapi import Response
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import APIRouter, Depends, status

router = APIRouter(
    prefix="/audit",
    tags=["Audit"],
    dependencies=[Depends(JWTBearer())],
    responses={404: {"description": "Not found"}},
)


async def get_audit_service(s: AsyncSession = Depends(get_async_db)) -> AuditService:
    return AuditService(s)


@router.get("/", response_model=Response, summary="List all audit logs")
async def list_audits(
    service: AuditService = Depends(get_audit_service),
    auth: AuthContext = Depends(get_auth_context),
):
    """Retrieve a list of all audit trail records.

    Returns:
        Response: A response object containing a list of audit records.
    """
    filters = {}
    # Scoping is handled automatically by CRUDBase using tenant_context.
    # Super-god users have no tenant_context, so they see all naturally.
    # If a super-god WANTS to filter -> they need query params (not implemented yet for strict tenant_id filter here).
    # IF specific scoping is needed for super-god acting as tenant, they should set context or pass filter.
    
    audits = await service.get_multi(filters=filters)
    return Response(message="Found", data=audits)


@router.get("/{audit_id}", response_model=Response, summary="Get an audit log by ID")
async def read_audit(
    audit_id: int,
    service: AuditService = Depends(get_audit_service),
    auth: AuthContext = Depends(get_auth_context),
):
    """Retrieve a single audit trail record by its ID.

    Args:
        audit_id (int): The ID of the audit record to retrieve.

    Returns:
        Response: A response object containing the audit record data.
    """
    audit = await service.get(id=audit_id)
    if not audit:
        raise ControllerError("Audit not found.", status_code=404)

    # Scoping handled by service.get -> applies filter automatically. 
    # If returned, it belongs to tenant (or user is super-god).

    return Response(message="Found", data=audit)


@router.post(
    "/",
    response_model=Response,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new audit log",
)
async def creating_audit(
    audit: AuditCreate,
    service: AuditService = Depends(get_audit_service),
):
    """Create a new audit trail record.

    Args:
        audit (AuditCreate): The audit record data to create.

    Returns:
        Response: A response object indicating success or failure.
    """
    # Tenant ID injection handled in Service/CRUDBase via context or explicit passing
    new_audit = await service.create(obj_in=audit)
    return Response(message="Saved successful!", data=new_audit)


@router.put("/{audit_id}", response_model=Response, summary="Update an audit log")
async def updating_audit(
    audit_id: int,
    audit: AuditUpdate,
    service: AuditService = Depends(get_audit_service),
):
    """Update an existing audit trail record by its ID.

    Args:
        audit_id (int): The ID of the audit record to update.
        audit (AuditUpdate): The updated audit record data.

    Returns:
        Response: A response object indicating success or failure.
    """
    updated_audit = await service.update(id=audit_id, obj_in=audit)
    return Response(message="Update successful!", data=updated_audit)


@router.delete(
    "/{audit_id}",
    response_model=Response,
    summary="Delete an audit log",
)
async def deleting_audit(
    audit_id: int,
    service: AuditService = Depends(get_audit_service),
):
    """Delete an audit trail record by its ID.

    Args:
        audit_id (int): The ID of the audit record to delete.

    Returns:
        Response: A response object indicating success or failure.
    """
    deleted_audit = await service.remove(id=audit_id)
    return Response(message="Deleted successful!", data=deleted_audit)


router_audit = router

