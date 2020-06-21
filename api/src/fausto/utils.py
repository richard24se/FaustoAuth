#LIBRARY LAYER
import datetime as dt
import logging
import traceback
from flask import request

from model.config import SQLALCH_AUTH
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

def format_dict_sqlalch(dictio):
    logging.debug("Input dictio: "+str(dictio))
    dictio.pop('_sa_instance_state',None)
    logging.debug("Input dictio: "+str(dictio))
    for keys in dictio:
        tipo = type(dictio[keys])
        date = str(dictio[keys])
        logging.debug("Keys of dictio: "+str(keys))
        if tipo is dt.date:
            date = dictio[keys]
            string_date = date.strftime('%Y-%m-%d')
            dictio[keys] = string_date
        elif tipo is dt.datetime:
            date = dictio[keys]
            string_date = date.strftime('%Y-%m-%d %H:%M:%S')
            dictio[keys] = string_date  
        if dictio[keys] is None:
            dictio[keys] = "No Data"
    return dictio

class ControllerError(Exception):
    pass

def sqlalchWrapper(func):
    def inner(*args, **kwargs):
        session = SQLALCH_AUTH()  # Scoped session
        try:
            return func(session, *args, **kwargs)  # Wrapper
        except IntegrityError as error:
            logging.exception("SQLAlchemyError: "+str(error))
            session.rollback()
            session.close()
            raise Exception("SQLAlchemyError : Hay problemas con la integridad de datos, revisa los logs")
        except SQLAlchemyError as error:
            logging.exception("SQLAlchemyError: "+str(error))
            session.rollback()
            session.close()
            raise Exception("SQLAlchemyError: "+str(error))
        except ControllerError as error:
            logging.debug("ControllerError: "+str(error))
            size_error = error.args.__len__()
            if (size_error == 1):
                raise Exception(error)
            elif(size_error > 1):
                raise Exception(error.args[0], error.args[1])
            else:
                raise Exception(error)
        except Exception as error:
            logging.exception("SyntaxError: "+str(error))
            session.rollback()
            session.close()
            raise Exception("SyntaxError: "+str(error))
        finally:
            session.close()
    return inner


def get_fields_sqlalch(cols,model):
        return [model.__dict__[k] for k in cols]


def get_columns_sqlalch(model):
    return model.__table__.columns.keys()


def get_prefix_fields_sqlalch(cols, model, prefix):
    return [model.__dict__[k].label(prefix+k) for k in cols]
    

def tryWrapper(function):
    def wrapper(*args, **kwargs):
        try:
            data = "Data not found!"             
            response = function(*args, **kwargs)
            if type(response) is tuple:
                msg, data = response  
            else:
                msg = response               
            return { "msg": msg, "data": data, "error": False}
        except Exception as error:
            logging.error("#----------------->ERROR de tryWrapper <----------------------#")
            logging.debug(traceback.format_exc())
            return { "msg": str(error), "data": data, "error": True}
    return wrapper

def jsonVerify(request):
    if request.data:
        logging.debug("Has data: "+str(request.data))
        logging.debug("Has JSON data")
        logging.debug("Has JSON data: "+str(request.json))
        return request.json
    else:
        logging.debug("Hasn't JSON data")
        return { "msg": "Please provide JSON" }
        
def jsonWrapper(fn):
    def wrapper(*args, **kwargs):
        if request.data:
            logging.debug("Has data: "+str(request.data))
            logging.debug("Has JSON data")
            logging.debug("Has JSON data: "+str(request.json))
            return fn(*args, **kwargs)
        else:
            logging.debug("Hasn't JSON data")
            return { "msg": "Please provide JSON" }
    return wrapper

def dict_sqlalch(alch_object):
    if hasattr(alch_object, '__dict__'):
        return alch_object.__dict__
    elif hasattr(alch_object, '_asdict'):
        return alch_object._asdict()


def quick_format_sqlalch(alch_object):
    return format_dict_sqlalch(dict_sqlalch(alch_object))

def sqlaPurge(s):
    s.rollback()
    s.close()
