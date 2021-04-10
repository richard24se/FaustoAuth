from config.databases import SQLALCH_AUTH
from auth.model.models import Audit
from fausto.sqlalch import sqlaPurge, format_dict_sqlalch, quick_format_sqlalch, sqlalch_wrapper, get_fields_sqlalch
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
import logging


@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def create_audit(s, data):
    new_data = Audit(**data)
    s.add(new_data)
    s.commit()
    return "Saved successful!"


@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def update_audit(s, id, data):
    if id is None:
        raise ControllerError("Send id!")
    s.query(Audit).filter_by(id=id).update(data)
    s.commit()
    return "Update successful!"


@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def delete_audit(s, id):
    state = s.query(Audit).filter(Audit.id == id).delete()
    logging.debug("SQLALCH state: "+str(state))
    s.commit()
    if state:
        return "Deleted successful!"
    else:
        return "The record has already been deleted!"


@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def get_audit(s, id):
    audit = s.query(Audit).filter(Audit.id == id).first()
    if audit:
        logging.debug("SQLALCH Audit: "+str(quick_format_sqlalch(audit)))
        audit_dict = quick_format_sqlalch(audit)
        return "Audit was found! ", audit_dict
    else:
        raise ControllerError("Audit not found")


@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def get_audits(s):
    audits = s.query(Audit).order_by(Audit.id).all()
    if audits:
        logging.debug("SQLALCH Audit: "+str(audits))
        audits_dict = [quick_format_sqlalch(i) for i in audits]
        return "Audits were found!", audits_dict
    else:
        raise ControllerError("No Audits found!", [])
