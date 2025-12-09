import logging
from typing import Any, List

from auth.model.models import AuditType
from auth.model.pydantic import AuditTypeCreate, AuditTypeUpdate
from config.databases import SQLALCH_AUTH
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
from fausto.sqlalch import async_sqlalch_wrapper, to_dict
from fastapi import Depends
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession


class AuditTypeService:
    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def create_audit_type(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, data: AuditTypeCreate
    ) -> dict:
        """Creates a new audit type."""
        result = await s.execute(select(AuditType).filter(AuditType.name == data.name))
        existing = result.scalars().first()
        if existing:
            raise ControllerError(f"The audit type '{data.name}' already exists.")

        new_audit_type = AuditType(**data.model_dump())
        s.add(new_audit_type)
        await s.flush()
        await s.refresh(new_audit_type)
        logging.info("Successfully created audit type '%s'.", new_audit_type.name)
        return {"message": "Saved successful!", "data": to_dict(new_audit_type)}

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def update_audit_type(
        s: AsyncSession = Depends(SQLALCH_AUTH),
        *,
        audit_type_id: int,
        data: AuditTypeUpdate,
    ) -> dict:
        """Updates an existing audit type."""
        if not audit_type_id:
            raise ControllerError("Audit type ID must be provided.")

        result = await s.execute(
            select(AuditType).filter(AuditType.id == audit_type_id)
        )
        audit_type = result.scalars().first()
        if not audit_type:
            raise ControllerError("Audit type not found.", status_code=404)

        if data.name and data.name != audit_type.name:
            result = await s.execute(
                select(AuditType).filter(
                    AuditType.name == data.name, AuditType.id != audit_type_id
                )
            )
            existing = result.scalars().first()
            if existing:
                raise ControllerError(f"The audit type '{data.name}' already exists.")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(audit_type, key, value)

        s.add(audit_type)
        await s.flush()
        await s.refresh(audit_type)

        logging.info("Successfully updated audit type with ID %d.", audit_type_id)
        return {"message": "Update successful!", "data": to_dict(audit_type)}

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def delete_audit_type(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, audit_type_id: int
    ) -> dict:
        """Deletes an audit type."""
        result = await s.execute(
            select(AuditType).filter(AuditType.id == audit_type_id)
        )
        audit_type = result.scalars().first()
        if not audit_type:
            raise ControllerError(
                "Audit type not found, it may have already been deleted.",
                status_code=404
            )
        
        audit_type_dict = to_dict(audit_type)
        await s.delete(audit_type)
        logging.info("Successfully deleted audit type with ID %d.", audit_type_id)
        return {"message": "Deleted successful!", "data": audit_type_dict}

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def get_audit_type(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, audit_type_id: int
    ) -> dict[str, Any]:
        """Retrieves a single audit type by its ID."""
        result = await s.execute(
            select(AuditType).filter(AuditType.id == audit_type_id)
        )
        audit_type = result.scalars().first()
        if not audit_type:
            raise ControllerError("Audit type not found.", status_code=404)

        logging.debug("Found audit type with ID %d.", audit_type_id)
        return {"message": "Found", "data": to_dict(audit_type)}

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def get_audit_types(
        s: AsyncSession = Depends(SQLALCH_AUTH),
    ) -> List[dict[str, Any]]:
        """Retrieves all audit types."""
        result = await s.execute(select(AuditType).order_by(desc(AuditType.id)))
        audit_types = result.scalars().all()
        if not audit_types:
            raise ControllerError("No audit types found.", [])

        logging.debug("Retrieved %d audit types.", len(audit_types))
        return {"message": "Found", "data": to_dict(audit_types)}