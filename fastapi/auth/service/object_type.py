import logging
from typing import Any, List

from auth.model.models import ObjectType
from auth.model.pydantic import ObjectTypeCreate, ObjectTypeUpdate
from config.databases import SQLALCH_AUTH
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
from fausto.sqlalch import async_sqlalch_wrapper, to_dict
from fastapi import Depends
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from .base import CRUDBase


class ObjectTypeService(CRUDBase[ObjectType, ObjectTypeCreate, ObjectTypeUpdate]):
    """Object Type Service"""

    def __init__(self, session: AsyncSession):
        super().__init__(ObjectType, session)

    async def create(self, *, obj_in: ObjectTypeCreate | dict[str, Any]) -> dict[str, Any]:
        """Creates a new object type."""
        try:
            if isinstance(obj_in, dict):
                obj_data = obj_in
                name = obj_data.get("name")
            else:
                obj_data = obj_in.model_dump()
                name = obj_in.name

            result = await self.session.execute(select(ObjectType).filter(ObjectType.name == name))
            existing = result.scalars().first()
            if existing:
                raise ControllerError(f"The object type '{name}' already exists.")

            return await super().create(obj_in=obj_data)
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
        obj_in: ObjectTypeUpdate | dict[str, Any],
    ) -> dict[str, Any]:
        """Updates an existing object type."""
        try:
            existing_obj = await self.get(id=id)
            if not existing_obj:
                raise ControllerError("Object type not found.", status_code=404)

            if isinstance(obj_in, dict):
                update_data = obj_in
                name = update_data.get("name")
            else:
                update_data = obj_in.model_dump(exclude_unset=True)
                name = obj_in.name

            if name and name != existing_obj["name"]:
                result = await self.session.execute(
                    select(ObjectType).filter(
                        ObjectType.name == name, ObjectType.id != id
                    )
                )
                existing = result.scalars().first()
                if existing:
                    raise ControllerError(f"The object type '{name}' already exists.")

            return await super().update(id=id, obj_in=obj_in)
        except ControllerError:
            await self.session.rollback()
            raise
        except Exception as e:
            await self.session.rollback()
            raise ControllerError(str(e))

