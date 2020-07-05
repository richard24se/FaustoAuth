from model.config import SQLALCH_AUTH

from model.models import AuditType
from fausto.utils import tryWrapper, sqlaPurge, format_dict_sqlalch, quick_format_sqlalch, sqlalchWrapper, ControllerError
import logging

@tryWrapper
@sqlalchWrapper
def create_audit_type(s,data):
    new_data = AuditType(**data)
    s.add(new_data)
    s.commit()
    return "Saved successful!"

@tryWrapper
@sqlalchWrapper
def update_audit_type(s, id, data):
    if id is None:
        raise ControllerError("Send id!")
    s.query(AuditType).filter_by(id=id).update(data)
    s.commit()       
    return "Update successful!"

@tryWrapper
@sqlalchWrapper
def delete_audit_type(s, id):
        state = s.query(AuditType).filter(AuditType.id==id).delete()
        logging.debug("SQLALCH state: "+str(state))
        s.commit()
        if state:
            return "Deleted successful!"
        else: 
            return "The record has already been deleted!"

@tryWrapper
@sqlalchWrapper
def get_audit_type(s,id):    
    audit_type = s.query(AuditType).filter(AuditType.id==id).first()
    if audit_type:
        logging.debug("SQLALCH AuditType: "+str(quick_format_sqlalch(audit_type)))
        audit_type_dict = quick_format_sqlalch(audit_type)
        return "Audit type was found!", audit_type_dict
    else: 
        raise ControllerError("Audit type not found")

@tryWrapper
@sqlalchWrapper
def get_audit_types(s):
    audit_types = s.query(AuditType).oreder_by(AuditType.id).all()
    if audit_types:
        logging.debug("SQLALCH AuditType: "+str(audit_types))
        audit_types_dict = [ quick_format_sqlalch(i) for i in audit_types]
        return "Audit types were found!", audit_types_dict
    else: 
        raise ControllerError("No Audit types found!", [])