

import logging
from fastapi import APIRouter, Depends
from fastapi import Body

from auth.handlers import JWTBearer
from fausto.fapi import Response
from auth.service.object import get_object, get_objects, create_object, update_object, delete_object, get_object_role
from auth.model.pydantic import PydanticObject

router = APIRouter(
    prefix="/object",
    tags=["object"],
    dependencies=[Depends(JWTBearer())],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=Response)
async def list_objects(role: int = None):
    if role:
        return get_object_role(role)
    return get_objects()


@router.get("/{object_id}", response_model=Response)
async def read_object(object_id: int):
    return get_object(object_id)


@router.post("/", response_model=Response)
async def creating_object(object: PydanticObject):
    return create_object(object.__dict__)


@router.put("/{object_id}", response_model=Response)
async def updating_object(object_id: int, object=Body(...)):
    return update_object(object_id, object)


@router.delete("/{object_id}", response_model=Response)
async def deleting_object(object_id: int):
    return delete_object(object_id)

router_object = router
