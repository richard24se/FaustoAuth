from model.config import SQLALCH_AUTH

from model.models import AuditingType
from fausto.utils import tryWrapper, sqlaPurge, format_dict_sqlalch, quick_format_sqlalch, sqlalchWrapper, ControllerError
import logging

@tryWrapper
@sqlalchWrapper
def createAuditingType(s,data):
    new_data = AuditingType(**data)
    s.add(new_data)
    s.commit()
    return "Se creó satisfactoriamente!"

@tryWrapper
@sqlalchWrapper
def updateAuditingType(s, id, data):
    if id is None:
        raise ControllerError("Envíe el id!")
    s.query(AuditingType).filter_by(id=id).update(data)
    s.commit()       
    return "Se actualizó satisfactoriamente!"    

@tryWrapper
@sqlalchWrapper
def deleteAuditingType(s, id):
        state = s.query(AuditingType).filter(AuditingType.id==id).delete()
        logging.debug("SQLALCH state: "+str(state))
        s.commit()
        if state:
            return "Se eliminó satisfactoriamente!"
        else: 
            return "El registro ya estaba eliminado!"

@tryWrapper
@sqlalchWrapper
def getAuditingType(s,id):    
    auditoria = s.query(AuditingType).filter(AuditingType.id==id).first()        
    if auditoria:
        logging.debug("SQLALCH AuditingType: "+str(quick_format_sqlalch(auditoria)))
        rol_dict = quick_format_sqlalch(auditoria)
        return "Se encontró auditoria!", rol_dict
    else: 
        raise ControllerError("No existe auditoria")

@tryWrapper
@sqlalchWrapper
def getAuditingTypes(s):
    auditoria = s.query(AuditingType).all()
    if auditoria:
        logging.debug("SQLALCH user: "+str(auditoria))
        rol_dict = [ quick_format_sqlalch(i) for i in auditoria]
        return "Se encontró auditorias!", rol_dict
    else: 
        raise ControllerError("No existen auditorias!", [])