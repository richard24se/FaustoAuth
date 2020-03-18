from model.config import SQLALCH_AUTH

from model.models import ObjectType
from fausto.utils import tryWrapper, sqlaPurge, format_dict_sqlalch, quick_format_sqlalch, sqlalchWrapper, ControllerError
import logging

@tryWrapper
@sqlalchWrapper
def create_object_type(s,data):
    duplicate_object = s.query(ObjectType).filter_by(name=data.get('name')).one_or_none()
    if duplicate_object:
        raise ControllerError("Ya existe tipo de objecto: '"+data.get('name')+"'")
    new_data = ObjectType(**data)
    s.add(new_data)
    s.commit()
    return "Se creó satisfactoriamente!"

@tryWrapper
@sqlalchWrapper
def update_object_type(s, id, data):
    if id is None:
        raise ControllerError("Envíe el id!")
    duplicate_object = s.query(ObjectType).filter(ObjectType.name==data.get('name'), ObjectType.id!=id).one_or_none()
    if duplicate_object:
        raise ControllerError("Ya existe tipo de objecto: '"+data.get('name')+"'")
    s.query(ObjectType).filter_by(id=id).update(data)
    s.commit()       
    return "Se actualizó satisfactoriamente!"    

@tryWrapper
@sqlalchWrapper
def delete_object_type(s, id):
        state = s.query(ObjectType).filter(ObjectType.id==id).delete()
        logging.debug("SQLALCH state: "+str(state))
        s.commit()
        if state:
            return "Se eliminó satisfactoriamente!"
        else: 
            return "El registro ya estaba eliminado!"

@tryWrapper
@sqlalchWrapper
def get_object_type(s,id):    
    objecto = s.query(ObjectType).filter(ObjectType.id==id).first()        
    if objecto:
        logging.debug("SQLALCH ObjectTypeType: "+str(quick_format_sqlalch(objecto)))
        rol_dict = quick_format_sqlalch(objecto)
        return "Se encontró el tipo de objecto!", rol_dict
    else: 
        raise ControllerError("No existe el tipo de objecto")

@tryWrapper
@sqlalchWrapper
def get_object_types(s):
    objecto = s.query(ObjectType).all()
    if objecto:
        logging.debug("SQLALCH user: "+str(objecto))
        rol_dict = [ quick_format_sqlalch(i) for i in objecto]
        return "Se encontró tipos de objectos!", rol_dict
    else: 
        raise ControllerError("No existen tipos de objectos!", [])