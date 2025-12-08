from typing import Any, List

from auth.handlers import JWTBearer
from auth.model.pydantic import AuditCreate, AuditUpdate
from auth.service.audit import (
    create_audit,
    delete_audit,
    get_audit,
    get_audits,
    update_audit,
)
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
    return await get_audits(s=s)


@router.get("/{audit_id}", response_model=Response, summary="Get an audit log by ID")
async def read_audit(audit_id: int, s: AsyncSession = Depends(get_async_db)):
    """Retrieve a single audit trail record by its ID.

    Args:
        audit_id (int): The ID of the audit record to retrieve.

    Returns:
        Response: A response object containing the audit record data.
    """
    return await get_audit(s=s, audit_id=audit_id)


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
    return await create_audit(s=s, data=audit)


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
    return await update_audit(s=s, audit_id=audit_id, data=audit)


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
    return await delete_audit(s=s, audit_id=audit_id)


router_audit = router
