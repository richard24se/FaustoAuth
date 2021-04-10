# -*- coding: utf-8 -*-
from sqlalchemy import create_engine, inspect
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session, scoped_session, sessionmaker
import redis
import aioredis
from config.settings import (DB_HOST, DB_NAME,
                             DB_PASSWORD, DB_PORT,
                             DB_USER)


def create_connection_db(conf):
    engine = create_engine("postgresql://"+conf['user']+":"+conf['pass']+"@"+conf['host'] +
                           ":"+conf['port']+"/"+conf['dbname'], pool_size=3000, max_overflow=1, pool_recycle=3600)
    session_factory = sessionmaker(bind=engine)
    ses = scoped_session(session_factory)
    return ses


# SQLALCHEMY
SQLALCH_AUTH = create_connection_db({'host': DB_HOST,
                                     'user': DB_USER,
                                     'port': DB_PORT,
                                     'pass': DB_PASSWORD,
                                     'dbname': DB_NAME})
# REDIS
token_store = redis.StrictRedis(
    host='auth_cache', port=6379, db=0, decode_responses=True)

# ASYNC REDIS
async def async_token_store():
    return await aioredis.create_redis_pool(
        'redis://auth_cache')
