from typing import List
from config.databases import SQLALCH_RECLUTAMIENTO
from pydantic import BaseModel
from reclutamiento.models import RecluEtapa, RecluPostulanteEtapa
from utils.sqlalch import filter_fields_sqlalch, qf_sqlalch, sqlalch_wrapper


class Etapa(BaseModel):
    etapa_id: int
    etapa: str


class EtapaService:
    """Etapa Service"""

    @staticmethod
    @sqlalch_wrapper(SQLALCH_RECLUTAMIENTO)
    def obtener_etapas(s) -> List[Etapa]:
        datos = s.query(RecluEtapa).all()
        return [Etapa(**qf_sqlalch(x)) for x in datos]

    @staticmethod
    @sqlalch_wrapper(SQLALCH_RECLUTAMIENTO)
    def obtener_grupo_etapas(s, fecha) -> list:
        datos = (
            s.query(RecluPostulanteEtapa.grupo_postulante_etapa_id)
            .distinct()
            .filter(
                RecluPostulanteEtapa.fecha_hora_inicio.like(fecha + "%"),
                RecluPostulanteEtapa.grupo_postulante_etapa_id != None,
            )
        )
        return [qf_sqlalch(x) for x in datos]

    @staticmethod
    @sqlalch_wrapper(SQLALCH_RECLUTAMIENTO)
    def obtener_postulantes(s, grupo_postulante_id, etapa_id) -> list:
        query = s.query(RecluPostulanteEtapa)
        if grupo_postulante_id:
            query = query.filter(
                RecluPostulanteEtapa.grupo_postulante_etapa_id == grupo_postulante_id
            )
        if etapa_id:
            query = query.filter(RecluPostulanteEtapa.etapa_id == etapa_id)
        datos = query.all()
        return [filter_fields_sqlalch(qf_sqlalch(x), ["postulante_id"]) for x in datos]
