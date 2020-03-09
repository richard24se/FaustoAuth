#DB LAYER
from model.config import SQLALCH_AUTH

from model.models import User
from fausto.utils import tryWrapper, sqlaPurge, format_dict_sqlalch, quick_format_sqlalch, sqlalchWrapper, ControllerError
import logging

@tryWrapper
@sqlalchWrapper
def createUser(s,data):
    duplicate_username = s.query(User).filter_by(username=data.get('username')).one_or_none()
    if duplicate_username:
        raise ControllerError("Ya existe usuario: '"+data.get('username')+"'")
    new_user = User(**data)
    s.add(new_user)
    s.commit()
    return "Se creó satisfactoriamente!"

@tryWrapper
@sqlalchWrapper
def updateUser(s, id, data):
    if id is None:
        raise ControllerError("Envíe el id!")
    duplicate_username = s.query(User).filter(User.username==data.get('username'), User.id!=id).one_or_none()
    if duplicate_username:
        raise ControllerError("Ya existe usuario: '"+data.get('username')+"'")
    s.query(User).filter_by(id=id).update(data)
    s.commit()       
    return "Se actualizó satisfactoriamente!"    

@tryWrapper
@sqlalchWrapper
def deleteUser(s, id):
        state = s.query(User).filter(User.id==id).delete()
        logging.debug("SQLALCH state: "+str(state))
        s.commit()
        if state:
            return "Se eliminó satisfactoriamente!"
        else: 
            return "El registro ya estaba eliminado!"

@tryWrapper
@sqlalchWrapper
def getUser(s,id):    
    user = s.query(User).filter(User.id==id).first()        
    if user:
        logging.debug("SQLALCH user: "+str(quick_format_sqlalch(user)))
        user_dict = quick_format_sqlalch(user)
        return "Se encontró el usuario!", user_dict
    else: 
        raise ControllerError("No existe el usuario!")

@tryWrapper
@sqlalchWrapper
def getUsers(s):
    user = s.query(User).all()
    if user:
        logging.debug("SQLALCH user: "+str(user))
        user_dict = [ quick_format_sqlalch(i) for i in user]
        return "Se encontró el usuario!", user_dict
    else: 
        raise ControllerError("No existen usuarios!", [])