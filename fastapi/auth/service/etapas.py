import datetime
import time
import logging
import datetime
import requests
from sqlalchemy import func
from sqlalchemy import or_
from sqlalchemy.sql import select

from config.databases import SQLALCH_RECLUTAMIENTO
from reclutamiento.models import RecluEtapa, RecluPostulanteEtapa

from utils.sqlalch import (sqlalch_wrapper, qf_sqlalch, get_filter_fields_sqlalch,
                           get_filter_fields_multi_sqlalch, filter_fields_sqlalch, get_columns_sqlalch, get_fields_sqlalch,
                           get_order_fields_multi_sqlalch)
from utils import validate_required_data, validate_required_args

from pydantic import BaseModel


class Etapa(BaseModel):
    etapa_id: int
    etapa: str


@sqlalch_wrapper(SQLALCH_RECLUTAMIENTO)
def obtener_etapas(s) -> dict:
    datos = s.query(RecluEtapa).all()
    datos = [Etapa(**qf_sqlalch(x)) for x in datos]
    return {'msg': "Esta es la lista de etapas", 'error': False, 'data': datos}


@sqlalch_wrapper(SQLALCH_RECLUTAMIENTO)
def obtener_grupo_etapas(s, fecha) -> dict:
    datos = s.query(RecluPostulanteEtapa.grupo_postulante_etapa_id).distinct().filter(
        RecluPostulanteEtapa.fecha_hora_inicio.like(fecha+"%"), RecluPostulanteEtapa.grupo_postulante_etapa_id != None)
    datos = [qf_sqlalch(x) for x in datos]
    return {'msg': "Esta es la lista de grupos de postulantes etapas", 'error': False, 'data': datos}


@sqlalch_wrapper(SQLALCH_RECLUTAMIENTO)
def obtener_postulantes(s, grupo_postulante_id, etapa_id) -> dict:
    query = s.query(RecluPostulanteEtapa)
    if grupo_postulante_id:
        query = query.filter(
            RecluPostulanteEtapa.grupo_postulante_etapa_id == grupo_postulante_id)
    if etapa_id:
        query = query.filter(RecluPostulanteEtapa.etapa_id == etapa_id)
    datos = query.all()
    datos = [filter_fields_sqlalch(qf_sqlalch(x),['postulante_id']) for x in datos]
    return {'msg': "Esta es la lista de grupos de postulantes etapas", 'error': False, 'data': datos}
