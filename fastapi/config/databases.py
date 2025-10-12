# -*- coding: utf-8 -*-
import redis
from config.settings import DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker


def create_connection_db(conf):
    engine = create_engine(
        "postgresql://"
        + conf["user"]
        + ":"
        + conf["pass"]
        + "@"
        + conf["host"]
        + ":"
        + conf["port"]
        + "/"
        + conf["dbname"],
        pool_size=3000,
        max_overflow=1,
        pool_recycle=3600,
    )
    session_factory = sessionmaker(bind=engine)
    ses = scoped_session(session_factory)
    return ses


# SQLALCHEMY
SQLALCH_AUTH = create_connection_db(
    {
        "host": DB_HOST,
        "user": DB_USER,
        "port": DB_PORT,
        "pass": DB_PASSWORD,
        "dbname": DB_NAME,
    }
)
# REDIS
token_store = redis.StrictRedis(
    host="auth_cache", port=6379, db=0, decode_responses=True
)


# ASYNC REDIS
async def async_token_store():
    return await redis.asyncio.from_url("redis://auth_cache")
