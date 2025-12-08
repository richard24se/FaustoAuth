import logging
from typing import Any, List

from auth.model.models import AuditType
from auth.model.pydantic import AuditTypeCreate, AuditTypeUpdate
from config.databases import SQLALCH_AUTH
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
from fausto.sqlalch import async_sqlalch_wrapper, to_dict # Use async_sqlalch_wrapper
from fastapi import Depends # Import Depends
from sqlalchemy import desc, select, update, delete # Import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession


@fapi_wrapper
@async_sqlalch_wrapper
async def create_audit_type(s: AsyncSession = Depends(SQLALCH_AUTH), *, data: AuditTypeCreate) -> str:
    """Creates a new audit type.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        data (AuditTypeCreate): The Pydantic model containing the audit type data.

    Returns:
        str: A success message.
    """
    result = await s.execute(select(AuditType).filter(AuditType.name == data.name))
    existing = result.scalars().first()
    if existing:
        raise ControllerError(f"The audit type '{data.name}' already exists.")

    new_audit_type = AuditType(**data.model_dump())
    s.add(new_audit_type)
    # Commit is handled by the async_sqlalch_wrapper
    logging.info("Successfully created audit type '%s'.", new_audit_type.name)
    return "Saved successful!"


@fapi_wrapper
@async_sqlalch_wrapper
async def update_audit_type(
    s: AsyncSession = Depends(SQLALCH_AUTH), *, audit_type_id: int, data: AuditTypeUpdate
) -> str:
    """Updates an existing audit type.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        audit_type_id (int): The ID of the audit type to update.
        data (AuditTypeUpdate): A Pydantic model containing the fields to update.

    Returns:
        str: A success message.
    """
    if not audit_type_id:
        raise ControllerError("Audit type ID must be provided.")

    result = await s.execute(select(AuditType).filter(AuditType.id == audit_type_id))
    audit_type = result.scalars().first()
    if not audit_type:
        raise ControllerError("Audit type not found.")

    if data.name and data.name != audit_type.name:
        result = await s.execute(
            select(AuditType).filter(
                AuditType.name == data.name, AuditType.id != audit_type_id
            )
        )
        existing = result.scalars().first()
        if existing:
            raise ControllerError(f"The audit type '{data.name}' already exists.")

    # Use update statement for async
    result = await s.execute(
        update(AuditType)
        .where(AuditType.id == audit_type_id)
        .values(**data.model_dump(exclude_unset=True))
    )
    # Commit is handled by the async_sqlalch_wrapper

    if result.rowcount == 0: # Check rowcount for update
        raise ControllerError("Audit type not found or data is the same.")

    logging.info("Successfully updated audit type with ID %d.", audit_type_id)
    return "Update successful!"


@fapi_wrapper
@async_sqlalch_wrapper
async def delete_audit_type(s: AsyncSession = Depends(SQLALCH_AUTH), *, audit_type_id: int) -> str:
    """Deletes an audit type.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        audit_type_id (int): The ID of the audit type to delete.

    Returns:
        str: A success message.
    """
    result = await s.execute(select(AuditType).filter(AuditType.id == audit_type_id))
    audit_type = result.scalars().first()
    if not audit_type:
        raise ControllerError(
            "Audit type not found, it may have already been deleted."
        )

    await s.delete(audit_type)
    # Commit is handled by the async_sqlalch_wrapper
    logging.info("Successfully deleted audit type with ID %d.", audit_type_id)
    return "Deleted successful!"


@fapi_wrapper
@async_sqlalch_wrapper
async def get_audit_type(
    s: AsyncSession = Depends(SQLALCH_AUTH), *, audit_type_id: int
) -> tuple[str, dict[str, Any]]:
    """Retrieves a single audit type by its ID.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.
        audit_type_id (int): The ID of the audit type to retrieve.

    Returns:
        tuple[str, dict[str, Any]]: A tuple containing a success message and the audit type data.
    """
    result = await s.execute(select(AuditType).filter(AuditType.id == audit_type_id))
    audit_type = result.scalars().first()
    if not audit_type:
        raise ControllerError("Audit type not found.")

    logging.debug("Found audit type with ID %d.", audit_type_id)
    return "Audit type was found!", to_dict(audit_type)


@fapi_wrapper
@async_sqlalch_wrapper
async def get_audit_types(s: AsyncSession = Depends(SQLALCH_AUTH)) -> tuple[str, List[dict[str, Any]]]:
    """Retrieves all audit types.

    Args:
        s (AsyncSession): The SQLAlchemy asynchronous session.

    Returns:
        tuple[str, List[dict[str, Any]]]: A tuple containing a success message and a list of audit types.
    """
    result = await s.execute(select(AuditType).order_by(desc(AuditType.id)))
    audit_types = result.scalars().all()
    if not audit_types:
        raise ControllerError("No audit types found.", [])

    logging.debug("Retrieved %d audit types.", len(audit_types))
    return "Audit types were found!", to_dict(audit_types)