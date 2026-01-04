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


@router.get("/", response_model=Response, summary="List all audit logs")
async def list_audits(
    s: AsyncSession = Depends(get_async_db),
    auth: AuthContext = Depends(get_auth_context),
):
    """Retrieve a list of all audit trail records.

    Returns:
        Response: A response object containing a list of audit records.
    """
    tenant_id = None
    if "super-god" not in auth.scopes:
        tenant_id = auth.tenant_id

    # Implicitly: if super-god, tenant_id is None -> returns all.
    # If regular user, tenant_id is set -> returns filtered.

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
    audit = await AuditService.get_audit(s=s, audit_id=audit_id)

    if "super-god" not in auth.scopes:
        if not auth.tenant_id or audit.get("tenant_id") != auth.tenant_id:
            raise ControllerError("Not authorized to access this audit log", status_code=403)

    return Response(message="Found", data=audit)


@router.post(
    "/",
    response_model=Response,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new audit log",
)
async def creating_audit(
    audit: AuditCreate,
    s: AsyncSession = Depends(get_async_db),
    auth: AuthContext = Depends(get_auth_context),
):
    """Create a new audit trail record.

    Args:
        audit (AuditCreate): The audit record data to create.

    Returns:
        Response: A response object indicating success or failure.
    """
    # Force tenant_id for non-super-god users
    audit_data = audit.model_dump()
    if "super-god" not in auth.scopes:
        if auth.tenant_id:
            audit_data["tenant_id"] = auth.tenant_id
        else:
            # Should not happen for authenticated user without super-god
            # (unless system user? but system usually has high prevs)
            pass

    new_audit = await AuditService.create_audit(s=s, data=audit_data)
    return Response(message="Saved successful!", data=new_audit)


@router.put("/{audit_id}", response_model=Response, summary="Update an audit log")
async def updating_audit(
    audit_id: int,
    audit: AuditUpdate,
    s: AsyncSession = Depends(get_async_db),
    auth: AuthContext = Depends(get_auth_context),
):
    """Update an existing audit trail record by its ID.

    Args:
        audit_id (int): The ID of the audit record to update.
        audit (AuditUpdate): The updated audit record data.

    Returns:
        Response: A response object indicating success or failure.
    """
    # Check existence and permission
    existing = await AuditService.get_audit(s=s, audit_id=audit_id)

    if "super-god" not in auth.scopes:
        if not auth.tenant_id or existing.get("tenant_id") != auth.tenant_id:
            raise ControllerError("Not authorized to update this audit log", status_code=403)

    updated_audit = await AuditService.update_audit(s=s, audit_id=audit_id, data=audit.model_dump(exclude_unset=True))
    return Response(message="Update successful!", data=updated_audit)


@router.delete(
    "/{audit_id}",
    response_model=Response,
    summary="Delete an audit log",
)
async def deleting_audit(
    audit_id: int,
    s: AsyncSession = Depends(get_async_db),
    auth: AuthContext = Depends(get_auth_context),
):
    """Delete an audit trail record by its ID.

    Args:
        audit_id (int): The ID of the audit record to delete.

    Returns:
        Response: A response object indicating success or failure.
    """
    # Check existence and permission
    existing = await AuditService.get_audit(s=s, audit_id=audit_id)

    if "super-god" not in auth.scopes:
        if not auth.tenant_id or existing.get("tenant_id") != auth.tenant_id:
            raise ControllerError("Not authorized to delete this audit log", status_code=403)

    deleted_audit = await AuditService.delete_audit(s=s, audit_id=audit_id)
    return Response(message="Deleted successful!", data=deleted_audit)


router_audit = router
