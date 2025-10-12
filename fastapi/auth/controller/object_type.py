from auth.handlers import JWTBearer
from auth.model.pydantic import PydanticObjectType
from auth.service.object_type import (
    create_object_type,
    delete_object_type,
    get_object_type,
    get_object_types,
    update_object_type,
)
from fausto.fapi import Response

from fastapi import APIRouter, Body, Depends

router = APIRouter(
    prefix="/object_types",
    tags=["object_types"],
    dependencies=[Depends(JWTBearer())],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=Response)
async def list_object_types():
    return get_object_types()


@router.get("/{object_type_id}", response_model=Response)
async def read_object_type(object_type_id: int):
    return get_object_type(object_type_id)


@router.post("/", response_model=Response)
async def creating_object_type(object_type: PydanticObjectType):
    return create_object_type(object_type.__dict__)


@router.put("/{object_type_id}", response_model=Response)
async def updating_object_type(object_type_id: int, object_type=Body(...)):
    return update_object_type(object_type_id, object_type)


@router.delete("/{object_type_id}", response_model=Response)
async def deleting_object_type(object_type_id: int):
    return delete_object_type(object_type_id)


router_object_type = router
