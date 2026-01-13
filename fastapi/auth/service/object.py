from typing import Any, List

from auth.model.models import Object, Permission, RolePermission
from auth.model.pydantic import ObjectCreate, ObjectUpdate
from auth.service.base import CRUDBase
from fausto import ControllerError
from fausto.sqlalch import to_dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class ObjectService(CRUDBase[Object, ObjectCreate, ObjectUpdate]):
    """Object Service"""

    def __init__(self, session: AsyncSession):
        super().__init__(model=Object, session=session)

    async def create(self, *, obj_in: ObjectCreate | dict[str, Any]) -> dict[str, Any]:
        """Creates a new object with name uniqueness check."""
        try:
            if isinstance(obj_in, dict):
                obj_in_data = obj_in
                name = obj_in_data.get("name")
            else:
                obj_in_data = obj_in.model_dump()
                name = obj_in.name

            # Inject tenant_id if not present and context is set (handled in CRUDBase.create mostly,
            # but we can double check)
            # Actually CRUDBase.create does:
            # tid = self.current_tenant
            # if tid and hasattr(self.model, "tenant_id") and "tenant_id" not in obj_in_data:
            #     obj_in_data["tenant_id"] = tid

            # Check for existing object with same name in this tenant
            query = select(Object).filter_by(name=name)
            query = self._apply_tenant_filter(query)
            result = await self.session.execute(query)
            existing_object = result.scalars().first()
            if existing_object:
                raise ControllerError(f"The object name '{name}' already exists.")

            # Delegate to parent which handles insertion and tenant_id injection
            return await super().create(obj_in=obj_in)
        except ControllerError:
            raise
        except Exception as e:
            raise ControllerError(str(e))

    async def update(self, *, id: int, obj_in: ObjectUpdate | dict[str, Any]) -> dict[str, Any]:
        """Updates an existing object with name uniqueness check."""
        try:
            # Check existence first (handled in super().update but we need obj for name check?)
            # Actually super().update fetches the object.
            # But we need to check if the NEW name conflicts with ANOTHER object.

            # Let's fetch the object first to compare names?
            # Or just check if name is being updated.
            if isinstance(obj_in, dict):
                update_data = obj_in
                name = update_data.get("name")
            else:
                update_data = obj_in.model_dump(exclude_unset=True)
                name = getattr(obj_in, "name", None)

            if name:
                # Check if name conflicts with another object
                query = select(Object).filter(Object.name == name, Object.id != id)
                query = self._apply_tenant_filter(query)
                result = await self.session.execute(query)
                existing_name = result.scalars().first()
                if existing_name:
                    raise ControllerError(f"The object name '{name}' already exists.")

            return await super().update(id=id, obj_in=obj_in)
        except ControllerError:
            raise
        except Exception as e:
            raise ControllerError(str(e))

    async def get_object_role(self, *, role_id: int) -> List[dict[str, Any]]:
        """Retrieves all objects associated with a specific role."""
        try:
            # This query joins permissions and needs to respect tenant?
            # RolePermission links Role (tenant scoped) to Permission (tenant scoped) to Object (tenant scoped).
            # Usually strict scoping on the Role itself (handled by role_id filtering if validated).
            # But we should also apply tenant filter to the query generally?
            # Or rely on the Role being in the tenant.

            # If we just query based on role_id, and role_id is valid for the tenant, we get permitted objects.
            # But let's add _apply_tenant_filter to be safe on the Object table part?
            # The join query starts with Object.

            query = (
                select(Object)
                .join(Permission, Permission.object_id == Object.id)
                .join(RolePermission, RolePermission.permission_id == Permission.id)
                .filter(RolePermission.role_id == role_id)
                .distinct()
            )
            query = self._apply_tenant_filter(query)

            result = await self.session.execute(query)
            objects = result.scalars().all()

            if not objects:
                # Matches original behavior
                raise ControllerError("No objects found for this role.", [], status_code=404)

            return to_dict(objects)
        except ControllerError:
            raise
        except Exception as e:
            raise ControllerError(str(e))
