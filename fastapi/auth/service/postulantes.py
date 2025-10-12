from config.databases import SQLALCH_RECLUTAMIENTO
from reclutamiento.models import RecluPostulante
from utils.sqlalch import get_filter_fields_multi_sqlalch, qf_sqlalch, sqlalch_wrapper


@sqlalch_wrapper(SQLALCH_RECLUTAMIENTO)
def obtener_postulantes(s, postulantes_id) -> dict:
    filters = get_filter_fields_multi_sqlalch(
        {"postulante_id": postulantes_id}, RecluPostulante
    )
    datos = s.query(RecluPostulante).filter(*filters)
    datos = [qf_sqlalch(x) for x in datos]
    return {"msg": "Esta es la lista de etapas", "error": False, "data": datos}
