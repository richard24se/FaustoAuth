# -*- coding: utf-8 -*-

import os

from dotenv import load_dotenv
from datetime import timedelta
load_dotenv()
load_dotenv(verbose=True, dotenv_path='.env')



# DATABASE
DB_NAME = os.getenv("DB_NAME", "Fausto")
DB_USER = os.getenv("DB_USER", 'root')
DB_PASSWORD = os.getenv("DB_PASSWD", 'faustoauthdb24$')
DB_HOST = os.getenv("DB_HOST", 'auth_db_postgres')
DB_PORT = os.getenv("DB_PORT", '5432')

# JWT
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'fausto_auth32adadasdsa')
JWT_TOKEN_EXPIRES = os.getenv('JWT_TOKEN_EXPIRES',2409)
JWT_TOKEN_REFRESH_EXPIRES = os.getenv('JWT_TOKEN_REFRESH_EXPIRES',240900)
JWT_SYSTEM = os.getenv('JWT_SYSTEM','FaustoAuth')
JWT_TOKEN_FORMAT = os.getenv('JWT_TOKEN_FORMAT')
# REDIS
ACCESS_EXPIRES = timedelta(seconds=JWT_TOKEN_EXPIRES)