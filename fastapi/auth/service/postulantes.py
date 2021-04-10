import datetime
import time
import logging
import datetime
import requests
from sqlalchemy import func
from sqlalchemy import or_
from sqlalchemy.sql import select

from config.databases import SQLALCH_RECLUTAMIENTO
from reclutamiento.models import RecluPostulante

from utils.sqlalch import (sqlalch_wrapper, qf_sqlalch, get_filter_fields_sqlalch,
                           get_filter_fields_multi_sqlalch, filter_fields_sqlalch, get_columns_sqlalch, get_fields_sqlalch,
                           get_order_fields_multi_sqlalch)
from utils import validate_required_data, validate_required_args

from pydantic import BaseModel




@sqlalch_wrapper(SQLALCH_RECLUTAMIENTO)
def obtener_postulantes(s, postulantes_id) -> dict:
    filters = get_filter_fields_multi_sqlalch({'postulante_id': postulantes_id}, RecluPostulante)
    datos = s.query(RecluPostulante).filter(*filters)
    datos = [qf_sqlalch(x) for x in datos]
    return {'msg': "Esta es la lista de etapas", 'error': False, 'data': datos}