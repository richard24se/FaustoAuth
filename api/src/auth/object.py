from model.config import SQLALCH_AUTH

from model.models import Object
from fausto.utils import tryWrapper, sqlaPurge, format_dict_sqlalch, quick_format_sqlalch, sqlalchWrapper, ControllerError
import logging

@tryWrapper
@sqlalchWrapper
def create_object(s,data):
    duplicate_object = s.query(Object).filter_by(name=data.get('name')).one_or_none()
    if duplicate_object:
        raise ControllerError("Ya existe objecto: '"+data.get('name')+"'")
    new_data = Object(**data)
    s.add(new_data)
    s.commit()
    return "Se creó satisfactoriamente!"

@tryWrapper
@sqlalchWrapper
def update_object(s, id, data):
    if id is None:
        raise ControllerError("Envíe el id!")
    duplicate_object = s.query(Object).filter(Object.name==data.get('name'), Object.id!=id).one_or_none()
    if duplicate_object:
        raise ControllerError("Ya existe objecto: '"+data.get('name')+"'")
    s.query(Object).filter_by(id=id).update(data)
    s.commit()       
    return "Se actualizó satisfactoriamente!"    

@tryWrapper
@sqlalchWrapper
def delete_object(s, id):
        state = s.query(Object).filter(Object.id==id).delete()
        logging.debug("SQLALCH state: "+str(state))
        s.commit()
        if state:
            return "Se eliminó satisfactoriamente!"
        else: 
            return "El registro ya estaba eliminado!"

@tryWrapper
@sqlalchWrapper
def get_object(s,id):    
    objecto = s.query(Object).filter(Object.id==id).first()        
    if objecto:
        logging.debug("SQLALCH Object: "+str(quick_format_sqlalch(objecto)))
        rol_dict = quick_format_sqlalch(objecto)
        return "Se encontró el objecto!", rol_dict
    else: 
        raise ControllerError("No existe el objecto")

@tryWrapper
@sqlalchWrapper
def get_objects(s):
    objecto = s.query(Object).all()
    if objecto:
        logging.debug("SQLALCH user: "+str(objecto))
        rol_dict = [ quick_format_sqlalch(i) for i in objecto]
        return "Se encontró objectos!", rol_dict
    else: 
        raise ControllerError("No existen objectos!", [])