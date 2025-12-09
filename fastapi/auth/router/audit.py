from typing import Any, List

from auth.handlers import JWTBearer
from auth.model.pydantic import AuditCreate, AuditUpdate
from auth.service.audit import AuditService
from config.databases import get_async_db
from fausto.fapi import Response
from fastapi import APIRouter, Body, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/audit",
    tags=["Audit"],
    dependencies=[Depends(JWTBearer())],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=Response, summary="List all audit logs")
async def list_audits(s: AsyncSession = Depends(get_async_db)):
    """Retrieve a list of all audit trail records.

    Returns:
        Response: A response object containing a list of audit records.
    """
    audits = await AuditService.get_audits(s=s)
    return Response(message="Found", data=audits)


@router.get("/{audit_id}", response_model=Response, summary="Get an audit log by ID")
async def read_audit(audit_id: int, s: AsyncSession = Depends(get_async_db)):
    """Retrieve a single audit trail record by its ID.

    Args:
        audit_id (int): The ID of the audit record to retrieve.

    Returns:
        Response: A response object containing the audit record data.
    """
    audit = await AuditService.get_audit(s=s, audit_id=audit_id)
    return Response(message="Found", data=audit)


@router.post(
    "/",
    response_model=Response,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new audit log",
)
async def creating_audit(audit: AuditCreate, s: AsyncSession = Depends(get_async_db)):
    """Create a new audit trail record.

    Args:
        audit (AuditCreate): The audit record data to create.

    Returns:
        Response: A response object indicating success or failure.
    """
    new_audit = await AuditService.create_audit(s=s, data=audit.model_dump())
    return Response(message="Saved successful!", data=new_audit)


@router.put("/{audit_id}", response_model=Response, summary="Update an audit log")
async def updating_audit(
    audit_id: int, audit: AuditUpdate, s: AsyncSession = Depends(get_async_db)
):
    """Update an existing audit trail record by its ID.

    Args:
        audit_id (int): The ID of the audit record to update.
        audit (AuditUpdate): The updated audit record data.

    Returns:
        Response: A response object indicating success or failure.
    """
    updated_audit = await AuditService.update_audit(s=s, audit_id=audit_id, data=audit.model_dump(exclude_unset=True))
    return Response(message="Update successful!", data=updated_audit)


@router.delete(
    "/{audit_id}",
    response_model=Response,
    summary="Delete an audit log",
)
async def deleting_audit(audit_id: int, s: AsyncSession = Depends(get_async_db)):
    """Delete an audit trail record by its ID.

    Args:
        audit_id (int): The ID of the audit record to delete.

    Returns:
        Response: A response object indicating success or failure.
    """
    deleted_audit = await AuditService.delete_audit(s=s, audit_id=audit_id)
    return Response(message="Deleted successful!", data=deleted_audit)


router_audit = router
