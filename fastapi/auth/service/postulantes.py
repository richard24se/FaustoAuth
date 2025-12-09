from config.databases import SQLALCH_RECLUTAMIENTO
from reclutamiento.models import RecluPostulante
from utils.sqlalch import get_filter_fields_multi_sqlalch, qf_sqlalch, sqlalch_wrapper


class PostulanteService:
    """Postulante Service"""

    @staticmethod
    @sqlalch_wrapper(SQLALCH_RECLUTAMIENTO)
    def obtener_postulantes(s, postulantes_id) -> list:
        filters = get_filter_fields_multi_sqlalch(
            {"postulante_id": postulantes_id}, RecluPostulante
        )
        datos = s.query(RecluPostulante).filter(*filters)
        return [qf_sqlalch(x) for x in datos]
