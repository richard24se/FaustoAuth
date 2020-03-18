from model.config import SQLALCH_AUTH

from model.models import Rol
from fausto.utils import tryWrapper, sqlaPurge, format_dict_sqlalch, quick_format_sqlalch, sqlalchWrapper, ControllerError
import logging

@tryWrapper
@sqlalchWrapper
def create_rol(s,data):
    duplicate_rol = s.query(Rol).filter_by(name=data.get('name')).one_or_none()
    if duplicate_rol:
        raise ControllerError("Ya existe rol: '"+data.get('name')+"'")
    new_rol = Rol(**data)
    s.add(new_rol)
    s.commit()
    return "Se creó satisfactoriamente!"

@tryWrapper
@sqlalchWrapper
def update_rol(s, id, data):
    if id is None:
        raise ControllerError("Envíe el id!")
    duplicate_rol = s.query(Rol).filter(Rol.name==data.get('name'), Rol.id!=id).one_or_none()
    if duplicate_rol:
        raise ControllerError("Ya existe rol: '"+data.get('name')+"'")
    s.query(Rol).filter_by(id=id).update(data)
    s.commit()       
    return "Se actualizó satisfactoriamente!"    

@tryWrapper
@sqlalchWrapper
def delete_rol(s, id):
        state = s.query(Rol).filter(Rol.id==id).delete()
        logging.debug("SQLALCH state: "+str(state))
        s.commit()
        if state:
            return "Se eliminó satisfactoriamente!"
        else: 
            return "El registro ya estaba eliminado!"

@tryWrapper
@sqlalchWrapper
def get_rol(s,id):    
    rol = s.query(Rol).filter(Rol.id==id).first()        
    if rol:
        logging.debug("SQLALCH Rol: "+str(quick_format_sqlalch(rol)))
        rol_dict = quick_format_sqlalch(rol)
        return "Se encontró el rol!", rol_dict
    else: 
        raise ControllerError("No existe el rol")

@tryWrapper
@sqlalchWrapper
def get_rols(s):
    rol = s.query(Rol).all()
    if rol:
        logging.debug("SQLALCH user: "+str(rol))
        rol_dict = [ quick_format_sqlalch(i) for i in rol]
        return "Se encontró roles!", rol_dict
    else: 
        raise ControllerError("No existen roles!", [])