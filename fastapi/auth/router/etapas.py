from typing import Optional

from pydantic import BaseModel
from auth.service.etapas import EtapaService
from utils.fastapi import Response

from fastapi import APIRouter, Body

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
    data = EtapaService.obtener_etapas()
    respuesta = Response(message="Esta es la lista de etapas", error=False, data=data)
    return respuesta


@router.get("/grupos_postulantes", response_model=Response)
async def read_obtener_grupo_etapas(fecha: str):
    data = EtapaService.obtener_grupo_etapas(fecha)
    respuesta = Response(
        message="Esta es la lista de grupos de postulantes etapas", error=False, data=data
    )
    return respuesta


@router.get("/postulantes", response_model=Response)
async def read_obtener_postulantes(
    grupo_postulante_id: str = None, etapa_id: int = None
):
    data = EtapaService.obtener_postulantes(grupo_postulante_id, etapa_id)
    respuesta = Response(
        message="Esta es la lista de grupos de postulantes etapas", error=False, data=data
    )
    return respuesta


@router.post("/")
async def insert_item(etapa: Etapa, test_id: Optional[int] = None, body=Body(...)):
    return body


router_etapas = router
