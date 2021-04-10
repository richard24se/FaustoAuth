import logging
from config.settings import JWT_SECRET_KEY, JWT_TOKEN_EXPIRES, JWT_TOKEN_REFRESH_EXPIRES, JWT_SYSTEM
import jwt
import hashlib
# DATE
from datetime import datetime, timedelta


def encode_auth_token(identity):
    try:
        payload = {
            'exp': datetime.utcnow() + timedelta(seconds=int(JWT_TOKEN_EXPIRES)),
            'iat': datetime.utcnow(),
            'username': f"{encrypt_string(identity)}",
            'system': JWT_SYSTEM,
            'identity': identity,
            'type': 'access'
        }
        token = jwt.encode(payload, JWT_SECRET_KEY,
                           algorithm='HS256')  # .decode('utf-8')
        logging.debug("Token generated "+str(token))
        return token
    except Exception as e:
        logging.debug("Error in generate code: "+str(e))
        return e


def decode_auth_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return 'Sign expired, please login again'
    except jwt.InvalidTokenError:
        return 'Good trye, but this token is invalid, please login again'


def encode_refresh_auth_token(identity):
    try:
        payload = {
            'exp': datetime.utcnow() + timedelta(seconds=int(JWT_TOKEN_REFRESH_EXPIRES)),
            'iat': datetime.utcnow(),
            'username': f"{encrypt_string(identity)}",
            'system': JWT_SYSTEM,
            'identity': identity,
            'type': 'refresh'
        }
        token = jwt.encode(payload, JWT_SECRET_KEY,
                           algorithm='HS256')  # .decode('utf-8')
        logging.debug("Token generado: "+str(token))
        return token
    except Exception as e:
        logging.debug("Error en generar token: "+str(e))
        return e


def encrypt_string(string: str):
    hash_object = hashlib.sha256(string.encode('utf8'))
    return hash_object.hexdigest()
