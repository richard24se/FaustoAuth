#LIBRARY LAYER
import datetime as dt
import logging


def formatting_dict_sqlalch(dictio):
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

def get_fields_sqlalch(cols,model):
        return [model.__dict__[k] for k in cols]