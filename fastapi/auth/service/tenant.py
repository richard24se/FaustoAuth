import re
from typing import Any
from auth.model.models import Tenant
from auth.model.pydantic import TenantCreate, TenantUpdate
from sqlalchemy.ext.asyncio import AsyncSession
from fausto import ControllerError
from .base import CRUDBase


class TenantService(CRUDBase[Tenant, TenantCreate, TenantUpdate]):
    """Service for managing Tenant entities."""

    def __init__(self, session: AsyncSession):
        super().__init__(Tenant, session)

    async def create(self, *, obj_in: TenantCreate | dict[str, Any]) -> dict[str, Any]:
        """Override create to handle slug generation."""
        if isinstance(obj_in, dict):
            obj_in_data = obj_in.copy()
        else:
            obj_in_data = obj_in.model_dump()

        if not obj_in_data.get("slug"):
            name = obj_in_data.get("name")
            if name:
                # Simple slugification: lowercase, strip, replace non-alphanumeric with hyphens
                slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
                obj_in_data["slug"] = slug
            else:
                raise ControllerError("Name is required to generate slug.")

        return await super().create(obj_in=obj_in_data)
