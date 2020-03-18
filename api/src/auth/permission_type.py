from model.config import SQLALCH_AUTH

from model.models import PermissionType
from fausto.utils import tryWrapper, sqlaPurge, format_dict_sqlalch, quick_format_sqlalch, sqlalchWrapper, ControllerError
import logging

@tryWrapper
@sqlalchWrapper
def create_permission_type(s,data):
    duplicate_permission = s.query(PermissionType).filter_by(name=data.get('name')).one_or_none()
    if duplicate_permission:
        raise ControllerError("Ya existe tipo de permiso: '"+data.get('name')+"'")
    new_data = PermissionType(**data)
    s.add(new_data)
    s.commit()
    return "Se creó satisfactoriamente!"

@tryWrapper
@sqlalchWrapper
def update_permission_type(s, id, data):
    if id is None:
        raise ControllerError("Envíe el id!")
    duplicate_permission = s.query(PermissionType).filter(PermissionType.name==data.get('name'), PermissionType.id!=id).one_or_none()
    if duplicate_permission:
        raise ControllerError("Ya existe tipo de permiso: '"+data.get('name')+"'")
    s.query(PermissionType).filter_by(id=id).update(data)
    s.commit()       
    return "Se actualizó satisfactoriamente!"    

@tryWrapper
@sqlalchWrapper
def delete_permission_type(s, id):
        state = s.query(PermissionType).filter(PermissionType.id==id).delete()
        logging.debug("SQLALCH state: "+str(state))
        s.commit()
        if state:
            return "Se eliminó satisfactoriamente!"
        else: 
            return "El registro ya estaba eliminado!"

@tryWrapper
@sqlalchWrapper
def get_permission_type(s,id):    
    permiso = s.query(PermissionType).filter(PermissionType.id==id).first()        
    if permiso:
        logging.debug("SQLALCH PermissionType: "+str(quick_format_sqlalch(permiso)))
        rol_dict = quick_format_sqlalch(permiso)
        return "Se encontró el tipo de permiso!", rol_dict
    else: 
        raise ControllerError("No existe el tipo de permiso")

@tryWrapper
@sqlalchWrapper
def get_permission_types(s):
    permiso = s.query(PermissionType).all()
    if permiso:
        logging.debug("SQLALCH user: "+str(permiso))
        rol_dict = [ quick_format_sqlalch(i) for i in permiso]
        return "Se encontró tipo de permisos!", rol_dict
    else: 
        raise ControllerError("No existen tipo de permisos!", [])