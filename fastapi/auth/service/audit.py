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


from dataclasses import dataclass, asdict

@dataclass(slots=True)
class AuditDTO:
    """Internal DTO for creating audit logs using slots for memory optimization."""
    id_user: int
    id_audit_type: int
    tenant_id: int
    data: str | None = None
    input: str | None = None
    ip_address: str | None = None
    user_agent: str | None = None
    status: str | None = None


class AuditService:
    """Audit Service"""

    @staticmethod
    async def create_audit(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, data: AuditCreate | AuditDTO | dict[str, Any]
    ) -> dict[str, Any]:
        """Creates a new audit log."""
        try:
            if isinstance(data, dict):
                audit_data = data
            elif isinstance(data, AuditDTO):
                # Convert dataclass to dict for SQLAlchemy
                audit_data = asdict(data)
            else:
                audit_data = data.model_dump()

            new_audit = Audit(**audit_data)
            s.add(new_audit)
            await s.commit() # Commit explicitly
            await s.refresh(new_audit)
            logging.info("Successfully created audit log.")
            
            # Manually construct response to avoid implicit lazy loading issues with to_dict
            # within async context (greenlet error).
            response = audit_data.copy()
            response["id"] = new_audit.id
            if new_audit.created_date:
                response["created_date"] = new_audit.created_date.isoformat()
            
            return response
        except ControllerError:
            await s.rollback()
            raise
        except Exception as e:
            await s.rollback()
            raise ControllerError(str(e))

    @staticmethod
    async def update_audit(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, audit_id: int, data: AuditUpdate | dict[str, Any], tenant_id: int | None = None
    ) -> dict[str, Any]:
        """Updates an existing audit log."""
        try:
            if not audit_id:
                raise ControllerError("Audit ID must be provided.")

            query = select(Audit).filter_by(id=audit_id)
            if tenant_id is not None:
                query = query.filter(Audit.tenant_id == tenant_id)

            result = await s.execute(query)
            audit = result.scalars().one_or_none()

            if not audit:
                raise ControllerError("Audit not found.", status_code=404)

            if isinstance(data, dict):
                update_data = data
            else:
                update_data = data.model_dump(exclude_unset=True)

            for key, value in update_data.items():
                setattr(audit, key, value)

            s.add(audit)
            await s.commit()
            await s.refresh(audit)

            logging.info("Successfully updated audit log with ID %d.", audit_id)
            return to_dict(audit)
        except ControllerError:
            await s.rollback()
            raise
        except Exception as e:
            await s.rollback()
            raise ControllerError(str(e))

    @staticmethod
    async def delete_audit(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, audit_id: int, tenant_id: int | None = None
    ) -> dict[str, Any]:
        """Deletes an audit log."""
        try:
            query = select(Audit).filter_by(id=audit_id)
            if tenant_id is not None:
                query = query.filter(Audit.tenant_id == tenant_id)

            result = await s.execute(query)
            audit = result.scalars().first()

            if not audit:
                raise ControllerError(
                    "Audit not found, it may have already been deleted.",
                    status_code=404
                )

            audit_dict = to_dict(audit)
            await s.delete(audit)
            await s.commit()

            logging.info("Successfully deleted audit log with ID %d.", audit_id)
            return audit_dict
        except ControllerError:
            await s.rollback()
            raise
        except Exception as e:
            await s.rollback()
            raise ControllerError(str(e))

    @staticmethod
    async def get_audit(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, audit_id: int, tenant_id: int | None = None
    ) -> dict[str, Any]:
        """Retrieves a single audit log by its ID."""
        try:
            query = select(Audit).filter(Audit.id == audit_id)
            if tenant_id is not None:
                query = query.filter(Audit.tenant_id == tenant_id)

            result = await s.execute(query)
            audit = result.scalars().first()

            if not audit:
                raise ControllerError("Audit not found.", status_code=404)

            logging.debug("Found audit with ID %d.", audit_id)
            return to_dict(audit)
        except ControllerError:
            raise
        except Exception as e:
            raise ControllerError(str(e))

    @staticmethod
    async def get_audits(s: AsyncSession = Depends(SQLALCH_AUTH), tenant_id: int | None = None) -> List[dict[str, Any]]:
        """Retrieves all audit logs."""
        try:
            query = select(Audit)
            if tenant_id is not None:
                query = query.filter(Audit.tenant_id == tenant_id)

            result = await s.execute(query)
            audits = result.scalars().all()

            if not audits:
                return []

            logging.debug("Retrieved %d audit logs.", len(audits))
            return to_dict(audits)
        except ControllerError:
            raise
        except Exception as e:
            raise ControllerError(str(e))