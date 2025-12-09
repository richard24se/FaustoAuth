import logging
from datetime import datetime, timezone
from typing import Any, List

from auth.model.models import Object, Permission, RolePermission
from auth.model.pydantic import ObjectCreate, ObjectUpdate
from config.databases import SQLALCH_AUTH
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
from fausto.sqlalch import async_sqlalch_wrapper, to_dict
from fastapi import Depends
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession


class ObjectService:
    """Object Service"""

    @staticmethod
    async def create_object(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, data: ObjectCreate | dict[str, Any]
    ) -> dict[str, Any]:
        """Creates a new object."""
        try:
            if isinstance(data, dict):
                obj_data = data
                name = obj_data.get("name")
            else:
                obj_data = data.model_dump()
                name = data.name

            result = await s.execute(select(Object).filter_by(name=name))
            existing_object = result.scalars().first()
            if existing_object:
                raise ControllerError(f"The object name '{name}' already exists.")

            new_obj = Object(**obj_data)
            s.add(new_obj)
            await s.commit()
            await s.refresh(new_obj)
            logging.info("Successfully created object '%s'.", name)
            return to_dict(new_obj)
        except ControllerError:
            await s.rollback()
            raise
        except Exception as e:
            await s.rollback()
            raise ControllerError(str(e))

    @staticmethod
    async def update_object(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, object_id: int, data: ObjectUpdate | dict[str, Any]
    ) -> dict[str, Any]:
        """Updates an existing object."""
        try:
            if not object_id:
                raise ControllerError("Object ID must be provided.")

            result = await s.execute(select(Object).filter_by(id=object_id))
            obj = result.scalars().first()
            if not obj:
                raise ControllerError("Object not found.", status_code=404)

            if isinstance(data, dict):
                update_data = data
                name = update_data.get("name")
            else:
                update_data = data.model_dump(exclude_unset=True)
                name = data.name

            if name and name != obj.name:
                result = await s.execute(
                    select(Object).filter(Object.name == name, Object.id != object_id)
                )
                existing_name = result.scalars().first()
                if existing_name:
                    raise ControllerError(f"The object name '{name}' already exists.")

            if isinstance(data, dict):
                 update_data["modificated_date"] = datetime.now(timezone.utc)
            else:
                 # Already handled by model_dump if passed, but here we enforce it
                 update_data["modificated_date"] = datetime.now(timezone.utc)

            for key, value in update_data.items():
                setattr(obj, key, value)
            
            s.add(obj)
            await s.commit()
            await s.refresh(obj)
            
            logging.info("Successfully updated object with ID %d.", object_id)
            return to_dict(obj)
        except ControllerError:
            await s.rollback()
            raise
        except Exception as e:
            await s.rollback()
            raise ControllerError(str(e))

    @staticmethod
    async def delete_object(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, object_id: int
    ) -> dict[str, Any]:
        """Deletes an object."""
        try:
            result = await s.execute(select(Object).filter_by(id=object_id))
            obj = result.scalars().first()
            if not obj:
                raise ControllerError(
                    "Object not found, it may have already been deleted.",
                    status_code=404
                )
            obj_dict = to_dict(obj)
            await s.delete(obj)
            await s.commit()
            logging.info("Successfully deleted object with ID %d.", object_id)
            return obj_dict
        except ControllerError:
            await s.rollback()
            raise
        except Exception as e:
            await s.rollback()
            raise ControllerError(str(e))

    @staticmethod
    async def get_object(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, object_id: int
    ) -> dict[str, Any]:
        """Retrieves a single object by its ID."""
        try:
            result = await s.execute(select(Object).filter_by(id=object_id))
            obj = result.scalars().first()
            if not obj:
                raise ControllerError("Object not found.", status_code=404)

            return to_dict(obj)
        except ControllerError:
            raise
        except Exception as e:
            raise ControllerError(str(e))

    @staticmethod
    async def get_object_role(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, role_id: int
    ) -> List[dict[str, Any]]:
        """Retrieves all objects associated with a specific role."""
        try:
            result = await s.execute(
                select(Object)
                .join(Permission, Permission.id_object == Object.id)
                .join(RolePermission, RolePermission.id_permission == Permission.id)
                .filter(RolePermission.id_role == role_id)
                .distinct()
            )
            objects = result.scalars().all()

            if not objects:
                raise ControllerError("No objects found for this role.", [], status_code=404)

            return to_dict(objects)
        except ControllerError:
            raise
        except Exception as e:
            raise ControllerError(str(e))

    @staticmethod
    async def get_objects(
        s: AsyncSession = Depends(SQLALCH_AUTH),
    ) -> List[dict[str, Any]]:
        """Retrieves all objects, ordered by ID descending."""
        try:
            result = await s.execute(select(Object).order_by(desc(Object.id)))
            objects = result.scalars().all()
            if not objects:
                raise ControllerError("No objects found.", [], status_code=404)

            return to_dict(objects)
        except ControllerError:
            raise
        except Exception as e:
            raise ControllerError(str(e))
