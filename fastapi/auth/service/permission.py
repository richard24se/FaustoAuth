import logging
from datetime import datetime, timezone
from typing import Any, Optional

from auth.model.models import Object, Permission, Role, RolePermission, User
from auth.model.pydantic import PermissionCreate, PermissionUpdate
from fausto import ControllerError
from fausto.sqlalch import to_dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .base import CRUDBase


class PermissionService(CRUDBase[Permission, PermissionCreate, PermissionUpdate]):
    """Permission Service"""

    def __init__(self, session: AsyncSession):
        super().__init__(Permission, session)

    async def create(self, *, obj_in: PermissionCreate) -> dict:
        """Creates a new permission."""
        try:
            result = await self.session.execute(select(Permission).filter(Permission.name == obj_in.name))
            existing = result.scalars().first()
            if existing:
                raise ControllerError(f"The permission '{obj_in.name}' already exists.", status_code=400)

            new_permission = Permission(**obj_in.model_dump())
            self.session.add(new_permission)
            await self.session.commit()
            await self.session.refresh(new_permission)
            logging.info("Successfully created permission '%s'.", new_permission.name)
            return {"msg": "Saved successful!", "data": self._process_data(new_permission)}
        except ControllerError:
            await self.session.rollback()
            raise
        except Exception as e:
            await self.session.rollback()
            raise ControllerError(str(e))

    async def update(
        self,
        *,
        id: int,
        obj_in: PermissionUpdate,
    ) -> dict:
        """Updates an existing permission."""
        try:
            result = await self.session.execute(select(Permission).filter_by(id=id))
            permission = result.scalars().first()
            if not permission:
                raise ControllerError("Permission not found.", status_code=404)

            if obj_in.name and obj_in.name != permission.name:
                result = await self.session.execute(
                    select(Permission).filter(
                        Permission.name == obj_in.name, Permission.id != id
                    )
                )
                existing = result.scalars().first()
                if existing:
                    raise ControllerError(f"The permission '{obj_in.name}' already exists.", status_code=400)

            update_data = obj_in.model_dump(exclude_unset=True)
            update_data["modificated_date"] = datetime.now(timezone.utc)

            for key, value in update_data.items():
                setattr(permission, key, value)
                
            self.session.add(permission)
            await self.session.commit()
            await self.session.refresh(permission)
            
            logging.info("Successfully updated permission with ID %d.", id)
            return {"msg": "Update successful!", "data": self._process_data(permission)}
        except ControllerError:
            await self.session.rollback()
            raise
        except Exception as e:
            await self.session.rollback()
            raise ControllerError(str(e))

    async def get_permissions(
        self,
        *,
        obj_name: Optional[str] = None,
        username: Optional[str] = None,
        role_id: Optional[int] = None,
    ) -> Any:
        """Retrieves a list of permissions based on optional filters."""
        try:
            query = select(Permission)

            if username and obj_name:
                query = (
                    query.join(RolePermission)
                    .join(Object, Object.id == Permission.id_object)
                    .join(Role, Role.id == RolePermission.id_role)
                    .join(User, User.id_role == Role.id)
                    .filter(Object.name == obj_name, User.username == username)
                )
                result = await self.session.execute(query)
                permissions = result.scalars().all()
                if not permissions:
                    raise ControllerError(
                        "No permissions found for the given user and object.",
                        {"enabled": False},
                        status_code=404
                    )

                result = await self.session.execute(
                    select(User.id, User.username).filter_by(username=username)
                )
                user_info = result.first()
                response_data = {
                    "id": user_info.id,
                    "username": user_info.username,
                    "permissions": to_dict(permissions),
                    "enabled": True,
                }
                return {"msg": "Found", "data": response_data}

            elif role_id:
                query = (
                    query.join(RolePermission)
                    .filter(RolePermission.id_role == role_id)
                    .order_by(Permission.id.desc())
                )
                result = await self.session.execute(query)
                permissions = result.scalars().all()
            else:
                query = query.order_by(Permission.id)
                result = await self.session.execute(query)
                permissions = result.scalars().all()

            if not permissions:
                raise ControllerError("No permissions found.", [], status_code=404)

            return {"msg": "Found", "data": [self._process_data(p) for p in permissions]}
        except ControllerError:
            raise
        except Exception as e:
            raise ControllerError(str(e))
