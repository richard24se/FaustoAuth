#LIBRARY LAYER
import datetime as dt
import logging
import traceback
from flask import request

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
            dictio[keys] = "No tiene"
    return dictio

def get_fields_sqlalch(cols,model):
        return [model.__dict__[k] for k in cols]

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

def sqlaPurge(s):
    s.rollback()
    s.close()
