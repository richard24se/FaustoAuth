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


class ObjectTypeService:
    """Object Type Service"""

    @staticmethod
    async def create_object_type(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, data: ObjectTypeCreate | dict[str, Any]
    ) -> dict[str, Any]:
        """Creates a new object type."""
        try:
            if isinstance(data, dict):
                obj_data = data
                name = obj_data.get("name")
            else:
                obj_data = data.model_dump()
                name = data.name

            result = await s.execute(select(ObjectType).filter(ObjectType.name == name))
            existing = result.scalars().first()
            if existing:
                raise ControllerError(f"The object type '{name}' already exists.")

            new_obj_type = ObjectType(**obj_data)
            s.add(new_obj_type)
            await s.commit()
            await s.refresh(new_obj_type)
            logging.info("Successfully created object type '%s'.", new_obj_type.name)
            return to_dict(new_obj_type)
        except ControllerError:
            await s.rollback()
            raise
        except Exception as e:
            await s.rollback()
            raise ControllerError(str(e))

    @staticmethod
    async def update_object_type(
        s: AsyncSession = Depends(SQLALCH_AUTH),
        *,
        object_type_id: int,
        data: ObjectTypeUpdate | dict[str, Any],
    ) -> dict[str, Any]:
        """Updates an existing object type."""
        try:
            if not object_type_id:
                raise ControllerError("Object type ID must be provided.")

            result = await s.execute(
                select(ObjectType).filter(ObjectType.id == object_type_id)
            )
            obj_type = result.scalars().first()
            if not obj_type:
                raise ControllerError("Object type not found.", status_code=404)

            if isinstance(data, dict):
                update_data = data
                name = update_data.get("name")
            else:
                update_data = data.model_dump(exclude_unset=True)
                name = data.name

            if name and name != obj_type.name:
                result = await s.execute(
                    select(ObjectType).filter(
                        ObjectType.name == name, ObjectType.id != object_type_id
                    )
                )
                existing = result.scalars().first()
                if existing:
                    raise ControllerError(f"The object type '{name}' already exists.")

            for key, value in update_data.items():
                setattr(obj_type, key, value)

            s.add(obj_type)
            await s.commit()
            await s.refresh(obj_type)

            logging.info("Successfully updated object type with ID %d.", object_type_id)
            return to_dict(obj_type)
        except ControllerError:
            await s.rollback()
            raise
        except Exception as e:
            await s.rollback()
            raise ControllerError(str(e))

    @staticmethod
    async def delete_object_type(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, object_type_id: int
    ) -> dict[str, Any]:
        """Deletes an object type."""
        try:
            result = await s.execute(
                select(ObjectType).filter(ObjectType.id == object_type_id)
            )
            obj_type = result.scalars().first()
            if not obj_type:
                raise ControllerError(
                    "Object type not found, it may have already been deleted.",
                    status_code=404
                )

            obj_type_dict = to_dict(obj_type)
            await s.delete(obj_type)
            await s.commit()
            logging.info("Successfully deleted object type with ID %d.", object_type_id)
            return obj_type_dict
        except ControllerError:
            await s.rollback()
            raise
        except Exception as e:
            await s.rollback()
            raise ControllerError(str(e))

    @staticmethod
    async def get_object_type(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, object_type_id: int
    ) -> dict[str, Any]:
        """Retrieves a single object type by its ID."""
        try:
            result = await s.execute(
                select(ObjectType).filter(ObjectType.id == object_type_id)
            )
            obj_type = result.scalars().first()
            if not obj_type:
                raise ControllerError("Object type not found.", status_code=404)

            logging.debug("Found object type with ID %d.", object_type_id)
            return to_dict(obj_type)
        except ControllerError:
            raise
        except Exception as e:
            raise ControllerError(str(e))

    @staticmethod
    async def get_object_types(
        s: AsyncSession = Depends(SQLALCH_AUTH),
    ) -> List[dict[str, Any]]:
        """Retrieves all object types."""
        try:
            result = await s.execute(select(ObjectType).order_by(desc(ObjectType.id)))
            obj_types = result.scalars().all()
            if not obj_types:
                raise ControllerError("No object types found.", [], status_code=404)

            logging.debug("Retrieved %d object types.", len(obj_types))
            return to_dict(obj_types)
        except ControllerError:
            raise
        except Exception as e:
            raise ControllerError(str(e))
