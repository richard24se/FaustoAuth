import logging
from datetime import datetime, timezone

from auth.model.models import Role, RolePermission
from auth.model.pydantic import RoleCreate, RoleUpdate
from fausto import ControllerError
from fausto.sqlalch import to_dict
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from .base import CRUDBase


class RoleService(CRUDBase[Role, RoleCreate, RoleUpdate]):
    """Role Service"""

    def __init__(self, session: AsyncSession):
        super().__init__(Role, session)

    async def create(self, *, obj_in: RoleCreate) -> dict:
        """Creates a new role and associates it with a list of permissions."""
        try:
            result = await self.session.execute(select(Role).filter_by(name=obj_in.name))
            existing_role = result.scalars().first()
            if existing_role:
                raise ControllerError(f"The role '{obj_in.name}' already exists.", status_code=400)

            new_role = Role(name=obj_in.name, display_name=obj_in.display_name)
            self.session.add(new_role)
            await self.session.flush()

            if obj_in.permissions:
                for perm_id in obj_in.permissions:
                    self.session.add(RolePermission(id_role=new_role.id, id_permission=perm_id))

            await self.session.commit()
            await self.session.refresh(new_role)
            logging.info(
                "Successfully created role '%s' with %d permissions.",
                new_role.name,
                len(obj_in.permissions or []),
            )
            return {"msg": "Saved successful!", "data": self._process_data(new_role)}
        except ControllerError:
            await self.session.rollback()
            raise
        except Exception as e:
            await self.session.rollback()
            raise ControllerError(str(e))

    async def update(self, *, id: int, obj_in: RoleUpdate) -> dict:
        """Updates an existing role's details and its associated permissions."""
        try:
            result = await self.session.execute(select(Role).filter_by(id=id))
            role = result.scalars().first()
            if not role:
                raise ControllerError("Role not found.", status_code=404)

            if obj_in.name and obj_in.name != role.name:
                result = await self.session.execute(select(Role).filter(Role.name == obj_in.name))
                existing_name = result.scalars().first()
                if existing_name:
                    raise ControllerError(f"The role name '{obj_in.name}' already exists.", status_code=400)

            update_data = obj_in.model_dump(exclude_unset=True, exclude={"permissions"})
            for key, value in update_data.items():
                setattr(role, key, value)

            role.modificated_date = datetime.now(timezone.utc)
            self.session.add(role)

            if obj_in.permissions is not None:
                await self.session.execute(delete(RolePermission).where(RolePermission.id_role == id))
                for perm_id in obj_in.permissions:
                    self.session.add(RolePermission(id_role=id, id_permission=perm_id))
            
            await self.session.commit()
            await self.session.refresh(role)

            logging.info("Successfully updated role ID %d.", id)
            return {"msg": "Update successful!", "data": self._process_data(role)}
        except ControllerError:
            await self.session.rollback()
            raise
        except Exception as e:
            await self.session.rollback()
            raise ControllerError(str(e))
