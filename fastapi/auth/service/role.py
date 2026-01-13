import logging
from datetime import datetime, timezone
from typing import Any

from auth.model.models import Role, RolePermission
from auth.model.pydantic import RoleCreate, RoleUpdate
from fausto import ControllerError
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from .base import CRUDBase


class RoleService(CRUDBase[Role, RoleCreate, RoleUpdate]):
    """Service for managing Role entities.

    This service handles the creation, update, retrieval, and deletion of roles.
    It manages the many-to-many relationship between roles and permissions.
    """

    def __init__(self, session: AsyncSession):
        super().__init__(Role, session)

    async def create(self, *, obj_in: RoleCreate | dict[str, Any]) -> dict[str, Any]:
        """Creates a new role and associates it with a list of permissions.

        Args:
            obj_in (RoleCreate | dict[str, Any]): The data to create the role with.

        Returns:
            dict[str, Any]: A dictionary representation of the created role.

        Raises:
            ControllerError: If the role name already exists or other errors occur.
        """
        try:
            if isinstance(obj_in, dict):
                role_data = obj_in
                name = role_data.get("name")
                display_name = role_data.get("display_name")
                permissions = role_data.get("permissions")
                tenant_id = role_data.get("tenant_id")
            else:
                role_data = obj_in.model_dump()
                name = obj_in.name
                display_name = obj_in.display_name
                permissions = obj_in.permissions
                tenant_id = obj_in.tenant_id

            # STRICT TENANT ISOLATION: Override tenant_id if context is present
            tid = self.current_tenant
            if tid:
                tenant_id = tid

            query = select(Role).filter_by(name=name)
            query = self._apply_tenant_filter(query)
            result = await self.session.execute(query)
            existing_role = result.scalars().first()
            if existing_role:
                raise ControllerError(f"The role '{name}' already exists.", status_code=400)

            new_role = Role(name=name, display_name=display_name, tenant_id=tenant_id)
            self.session.add(new_role)
            await self.session.flush()

            if permissions:
                for perm_id in permissions:
                    self.session.add(RolePermission(role_id=new_role.id, permission_id=perm_id))

            await self.session.commit()
            await self.session.refresh(new_role)
            logging.info(
                "Successfully created role '%s' with %d permissions.",
                new_role.name,
                len(permissions or []),
            )
            return self._process_data(new_role)
        except ControllerError:
            await self.session.rollback()
            raise
        except Exception as e:
            await self.session.rollback()
            raise ControllerError(str(e))

    async def update(self, *, id: int, obj_in: RoleUpdate | dict[str, Any]) -> dict[str, Any]:
        """Updates an existing role's details and its associated permissions.

        If `permissions` is provided in the update data, the existing
        permissions for the role are replaced with the new list.

        Args:
            id (int): The ID of the role to update.
            obj_in (RoleUpdate | dict[str, Any]): The update data.

        Returns:
            dict[str, Any]: A dictionary representation of the updated role.

        Raises:
            ControllerError: If the role is not found, name exists, or update fails.
        """
        try:
            query = select(Role).filter_by(id=id)
            query = self._apply_tenant_filter(query)
            result = await self.session.execute(query)
            role = result.scalars().first()
            if not role:
                raise ControllerError("Role not found.", status_code=404)

            if isinstance(obj_in, dict):
                role_data = obj_in
                name = role_data.get("name")
                permissions = role_data.get("permissions")
                update_data = {k: v for k, v in role_data.items() if k != "permissions"}
            else:
                name = obj_in.name
                permissions = obj_in.permissions
                update_data = obj_in.model_dump(exclude_unset=True, exclude={"permissions"})

            if name and name != role.name:
                query = select(Role).filter(Role.name == name)
                query = self._apply_tenant_filter(query)
                result = await self.session.execute(query)
                existing_name = result.scalars().first()
                if existing_name:
                    raise ControllerError(f"The role name '{name}' already exists.", status_code=400)

            for key, value in update_data.items():
                setattr(role, key, value)

            role.modificated_date = datetime.now(timezone.utc)
            self.session.add(role)

            if permissions is not None:
                await self.session.execute(delete(RolePermission).where(RolePermission.role_id == id))
                for perm_id in permissions:
                    self.session.add(RolePermission(role_id=id, permission_id=perm_id))

            await self.session.commit()
            await self.session.refresh(role)

            logging.info("Successfully updated role ID %d.", id)
            return self._process_data(role)
        except ControllerError:
            await self.session.rollback()
            raise
        except Exception as e:
            await self.session.rollback()
            raise ControllerError(str(e))
