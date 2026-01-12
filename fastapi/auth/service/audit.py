import logging
from dataclasses import asdict, dataclass
from typing import Any, List

from auth.model.models import Audit
from auth.model.pydantic import AuditCreate, AuditUpdate
from config.databases import SQLALCH_AUTH
from fausto import ControllerError
from fausto.sqlalch import to_dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import Depends

from .base import CRUDBase


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


class AuditService(CRUDBase[Audit, AuditCreate, AuditUpdate]):
    """Audit Service"""

    def __init__(self, session: AsyncSession):
        super().__init__(Audit, session)

    async def create(self, *, obj_in: AuditCreate | AuditDTO | dict[str, Any]) -> dict[str, Any]:
        """Creates a new audit log."""
        try:
            if isinstance(obj_in, dict):
                audit_data = obj_in
            elif isinstance(obj_in, AuditDTO):
                # Convert dataclass to dict for SQLAlchemy
                audit_data = asdict(obj_in)
            else:
                audit_data = obj_in.model_dump()

            # Delegate to parent, but handle DTO conversion first manually if needed, 
            # or just call super().create with the dict.
            # CRUDBase.create handles dicts.
            
            # STRICT TENANT ISOLATION: Override tenant_id if context is present
            # (Handled by CRUDBase, but we ensure it's in the data if the caller didn't provide it
            # and expected context to fill it. But Audit often comes from backend logic that might know the tenant.)
            
            return await super().create(obj_in=audit_data)
        except Exception as e:
            raise ControllerError(str(e))

