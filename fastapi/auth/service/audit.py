import logging
from typing import Any, List

from auth.model.models import Audit
from auth.model.pydantic import AuditCreate, AuditUpdate
from config.databases import SQLALCH_AUTH
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
from fausto.sqlalch import async_sqlalch_wrapper, to_dict
from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class AuditService:
    """Audit Service"""

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def create_audit(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, data: AuditCreate
    ) -> dict:
        """Creates a new audit log."""
        new_audit = Audit(**data.model_dump())
        s.add(new_audit)
        await s.flush()
        await s.refresh(new_audit)
        logging.info("Successfully created audit log.")
        return {"msg": "Saved successful!", "data": to_dict(new_audit)}

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def update_audit(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, audit_id: int, data: AuditUpdate
    ) -> dict:
        """Updates an existing audit log."""
        if not audit_id:
            raise ControllerError("Audit ID must be provided.")

        result = await s.execute(select(Audit).filter_by(id=audit_id))
        audit = result.scalars().one_or_none()

        if not audit:
            raise ControllerError("Audit not found.")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(audit, key, value)

        s.add(audit)
        await s.flush()
        await s.refresh(audit)

        logging.info("Successfully updated audit log with ID %d.", audit_id)
        return {"msg": "Update successful!", "data": to_dict(audit)}

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def delete_audit(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, audit_id: int
    ) -> dict:
        """Deletes an audit log."""
        result = await s.execute(select(Audit).filter_by(id=audit_id))
        audit = result.scalars().first()

        if not audit:
            raise ControllerError(
                "Audit not found, it may have already been deleted.",
                status_code=404
            )

        audit_dict = to_dict(audit)
        await s.delete(audit)

        logging.info("Successfully deleted audit log with ID %d.", audit_id)
        return {"msg": "Deleted successful!", "data": audit_dict}

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def get_audit(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, audit_id: int
    ) -> dict[str, Any]:
        """Retrieves a single audit log by its ID."""
        result = await s.execute(select(Audit).filter(Audit.id == audit_id))
        audit = result.scalars().first()

        if not audit:
            raise ControllerError("Audit not found.", status_code=404)

        logging.debug("Found audit with ID %d.", audit_id)
        return {"msg": "Found", "data": to_dict(audit)}

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def get_audits(s: AsyncSession = Depends(SQLALCH_AUTH)) -> List[dict[str, Any]]:
        """Retrieves all audit logs."""
        result = await s.execute(select(Audit))
        audits = result.scalars().all()

        if not audits:
            raise ControllerError("No audits found.", [])

        logging.debug("Retrieved %d audit logs.", len(audits))
        return {"msg": "Found", "data": to_dict(audits)}