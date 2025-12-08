import logging
from typing import Any, List

from auth.model.models import Audit
from auth.model.pydantic import AuditCreate, AuditUpdate
from config.databases import SQLALCH_AUTH
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
from fausto.sqlalch import async_sqlalch_wrapper, to_dict # Use async_sqlalch_wrapper
from fastapi import Depends # Import Depends
from sqlalchemy import select, update, delete # Import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession


@fapi_wrapper
@async_sqlalch_wrapper
async def create_audit(s: AsyncSession = Depends(SQLALCH_AUTH), *, data: AuditCreate) -> str:
    """Creates a new audit log.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        data (AuditCreate): The Pydantic model containing the audit data.

    Returns:
        str: A success message.
    """
    new_audit = Audit(**data.model_dump())
    s.add(new_audit)
    # Commit is handled by the async_sqlalch_wrapper
    logging.info("Successfully created audit log.")
    return "Saved successful!"


@fapi_wrapper
@async_sqlalch_wrapper
async def update_audit(s: AsyncSession = Depends(SQLALCH_AUTH), *, audit_id: int, data: AuditUpdate) -> str:
    """Updates an existing audit log.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        audit_id (int): The ID of the audit log to update.
        data (AuditUpdate): A Pydantic model containing the fields to update.

    Returns:
        str: A success message.
    """
    if not audit_id:
        raise ControllerError("Audit ID must be provided.")

    # Use update statement for async
    result = await s.execute(
        update(Audit)
        .where(Audit.id == audit_id)
        .values(**data.model_dump(exclude_unset=True))
    )
    # Commit is handled by the async_sqlalch_wrapper

    if result.rowcount == 0: # Check rowcount for update
        raise ControllerError("Audit not found or data is the same.")

    logging.info("Successfully updated audit log with ID %d.", audit_id)
    return "Update successful!"


@fapi_wrapper
@async_sqlalch_wrapper
async def delete_audit(s: AsyncSession = Depends(SQLALCH_AUTH), *, audit_id: int) -> str:
    """Deletes an audit log.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        audit_id (int): The ID of the audit log to delete.

    Returns:
        str: A success message.
    """
    result = await s.execute(
        delete(Audit).where(Audit.id == audit_id)
    )
    # Commit is handled by the async_sqlalch_wrapper

    if result.rowcount == 0: # Check rowcount for delete
        raise ControllerError("Audit not found, it may have already been deleted.")

    logging.info("Successfully deleted audit log with ID %d.", audit_id)
    return "Deleted successful!"


@fapi_wrapper
@async_sqlalch_wrapper
async def get_audit(s: AsyncSession = Depends(SQLALCH_AUTH), *, audit_id: int) -> tuple[str, dict[str, Any]]:
    """Retrieves a single audit log by its ID.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        audit_id (int): The ID of the audit log to retrieve.

    Returns:
        tuple[str, dict[str, Any]]: A tuple containing a success message and the audit data.
    """
    result = await s.execute(
        select(Audit).filter(Audit.id == audit_id)
    )
    audit = result.scalars().first() # Use scalars().first()

    if not audit:
        raise ControllerError("Audit not found.")

    logging.debug("Found audit log with ID %d.", audit_id)
    return "Audit was found!", to_dict(audit)


@fapi_wrapper
@async_sqlalch_wrapper
async def get_audits(s: AsyncSession = Depends(SQLALCH_AUTH)) -> tuple[str, List[dict[str, Any]]]:
    """Retrieves all audit logs.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.

    Returns:
        tuple[str, List[dict[str, Any]]]: A tuple containing a success message and a list of audit logs.
    """
    result = await s.execute(
        select(Audit)
    )
    audits = result.scalars().all() # Use scalars().all()

    if not audits:
        raise ControllerError("No audits found.", [])

    logging.debug("Retrieved %d audit logs.", len(audits))
    return "Audits were found!", to_dict(audits)