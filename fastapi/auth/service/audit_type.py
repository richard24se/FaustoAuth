from config.databases import SQLALCH_AUTH
from auth.model.models import AuditType
from fausto.sqlalch import sqlaPurge, format_dict_sqlalch, quick_format_sqlalch, sqlalch_wrapper, get_fields_sqlalch
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
import logging


@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def create_audit_type(s, data):
    new_data = AuditType(**data)
    s.add(new_data)
    s.commit()
    return "Saved successful!"


@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def update_audit_type(s, id, data):
    if id is None:
        raise ControllerError("Send id!")
    s.query(AuditType).filter_by(id=id).update(data)
    s.commit()
    return "Update successful!"


@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def delete_audit_type(s, id):
    state = s.query(AuditType).filter(AuditType.id == id).delete()
    logging.debug("SQLALCH state: "+str(state))
    s.commit()
    if state:
        return "Deleted successful!"
    else:
        return "The record has already been deleted!"


@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def get_audit_type(s, id):
    audit_type = s.query(AuditType).filter(AuditType.id == id).first()
    if audit_type:
        logging.debug("SQLALCH AuditType: " +
                      str(quick_format_sqlalch(audit_type)))
        audit_type_dict = quick_format_sqlalch(audit_type)
        return "Audit type was found!", audit_type_dict
    else:
        raise ControllerError("Audit type not found")


@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def get_audit_types(s):
    audit_types = s.query(AuditType).order_by(AuditType.id).all()
    if audit_types:
        logging.debug("SQLALCH AuditType: "+str(audit_types))
        audit_types_dict = [quick_format_sqlalch(i) for i in audit_types]
        return "Audit types were found!", audit_types_dict
    else:
        raise ControllerError("No Audit types found!", [])
