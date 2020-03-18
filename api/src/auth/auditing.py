from model.config import SQLALCH_AUTH

from model.models import Auditing
from fausto.utils import tryWrapper, sqlaPurge, format_dict_sqlalch, quick_format_sqlalch, sqlalchWrapper, ControllerError
import logging

@tryWrapper
@sqlalchWrapper
def create_auditing(s,data):
    new_data = Auditing(**data)
    s.add(new_data)
    s.commit()
    return "Se creó satisfactoriamente!"

@tryWrapper
@sqlalchWrapper
def update_auditing(s, id, data):
    if id is None:
        raise ControllerError("Envíe el id!")
    s.query(Auditing).filter_by(id=id).update(data)
    s.commit()       
    return "Se actualizó satisfactoriamente!"    

@tryWrapper
@sqlalchWrapper
def delete_auditing(s, id):
        state = s.query(Auditing).filter(Auditing.id==id).delete()
        logging.debug("SQLALCH state: "+str(state))
        s.commit()
        if state:
            return "Se eliminó satisfactoriamente!"
        else: 
            return "El registro ya estaba eliminado!"

@tryWrapper
@sqlalchWrapper
def get_auditing(s,id):    
    auditoria = s.query(Auditing).filter(Auditing.id==id).first()        
    if auditoria:
        logging.debug("SQLALCH Auditing: "+str(quick_format_sqlalch(auditoria)))
        rol_dict = quick_format_sqlalch(auditoria)
        return "Se encontró auditoria!", rol_dict
    else: 
        raise ControllerError("No existe auditoria")

@tryWrapper
@sqlalchWrapper
def get_auditings(s):
    auditoria = s.query(Auditing).all()
    if auditoria:
        logging.debug("SQLALCH user: "+str(auditoria))
        rol_dict = [ quick_format_sqlalch(i) for i in auditoria]
        return "Se encontró auditorias!", rol_dict
    else: 
        raise ControllerError("No existen auditorias!", [])