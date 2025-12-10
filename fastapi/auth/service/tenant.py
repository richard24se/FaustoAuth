from auth.model.models import Tenant
from auth.model.pydantic import TenantCreate, TenantUpdate
from sqlalchemy.ext.asyncio import AsyncSession
from .base import CRUDBase

class TenantService(CRUDBase[Tenant, TenantCreate, TenantUpdate]):
    """Service for managing Tenant entities."""

    def __init__(self, session: AsyncSession):
        super().__init__(Tenant, session)
