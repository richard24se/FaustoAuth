#DB LAYER
from model.config import SQLALCH_AUTH

from model.models import User
from fausto.utils import tryWrapper, sqlaPurge, format_dict_sqlalch
import logging

@tryWrapper
def createUser(data):
    try:
        s = SQLALCH_AUTH()
        new_user = User(**data)
        s.add(new_user)
        s.commit()
        s.close()
        return "Se creó satisfactoriamente!"
    except Exception as error:
        sqlaPurge(s)
        error = str(error)
        logging.error("SQLACLH: "+error)
        return error

@tryWrapper
def updateUser(id, data):
    if id is None:
        return "Envíe el id!"
    try:
        s = SQLALCH_AUTH()
        s.query(User).filter_by(id=id).update(data)
        s.commit()
        s.close()
        return "Se actualizó satisfactoriamente!"
    except Exception as error:
        sqlaPurge(s)
        error = str(error)
        logging.error("SQLACLH: "+error)
        return error

@tryWrapper
def deleteUser(id):
    try:
        s = SQLALCH_AUTH()
        state = s.query(User).filter(User.id==id).delete()
        logging.debug("SQLALCH state: "+str(state))
        s.commit()
        s.close()
        if state:
            return "Se eliminó satisfactoriamente!"
        else: 
            return "El registro ya estaba eliminado!"
    except Exception as error:
        sqlaPurge(s)
        error = str(error)
        logging.error("SQLALCH: "+error)
        return error
@tryWrapper
def getUser(id):
    try:
        s = SQLALCH_AUTH()
        user = s.query(User).filter(User.id==id).first()
        s.close()
        if user:
            logging.debug("SQLALCH user: "+str(user.__dict__))
            user_dict = format_dict_sqlalch(user.__dict__)
            return "Se encontró el usuario!", user_dict
        else: 
            return "No existe el usuario!"
            
    except Exception as error:
        sqlaPurge(s)
        error = str(error)
        logging.error("SQLALCH: "+error)
        return error