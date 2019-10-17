#DB LAYER
from model.config import SQLALCH_AUTH

from model.models import User
from fausto.utils import tryWrapper

@tryWrapper
def createUser(data):
    try:
        s = SQLALCH_AUTH()
        new_user = User(**data)
        s.add(new_user)
        s.commit()
        return "Se creó satisfactoriamente!", None
    except Exception as error:
        s.rollback()
        s.close()
        return str(error), None