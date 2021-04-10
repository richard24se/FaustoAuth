import logging
from fastapi import APIRouter, Depends
from fastapi import Body
from pydantic import BaseModel
from typing import Optional, Any, Union

from auth.handler_jwt import JWTBearer
from utils.fastapi import Response
from reclutamiento.service.etapas import obtener_etapas, obtener_grupo_etapas, obtener_postulantes
router = APIRouter(
    prefix="/etapas",
    tags=["etapas"],
    # dependencies=[Depends(JWTBearer())],

    responses={404: {"description": "Not found"}},
)


class Etapa(BaseModel):
    etapa_id: int
    etapa: str


@router.get("/", response_model=Response)
async def read_items():
    data = obtener_etapas()
    respuesta = Response(**data)
    return respuesta

@router.get("/grupos_postulantes", response_model=Response)
async def read_obtener_grupo_etapas(fecha: str):
    data = obtener_grupo_etapas(fecha)
    respuesta = Response(**data)
    return respuesta

@router.get("/postulantes", response_model=Response)
async def read_obtener_postulantes(grupo_postulante_id: str = None, etapa_id: int= None):
    data = obtener_postulantes(grupo_postulante_id, etapa_id)
    respuesta = Response(**data)
    return respuesta

@router.post("/")
async def insert_item(etapa: Etapa, test_id: Optional[int] = None,  body=Body(...)):
    return body

router_etapas = router
