import logging
import json
from datetime import datetime

from config.databases import token_store, async_token_store
from config.settings import ACCESS_EXPIRES


def redis_create_key(key: str, value: str):
    token_store.set(key, value, ACCESS_EXPIRES * 1.2)
    cache_token_keys = token_store.keys()
    cache_token_value = token_store.mget(cache_token_keys)

    # logging.debug("Cache keys: "+str(cache_token_keys))
    # logging.debug("Cache values: "+str(cache_token_value))
    # logging.debug("Cache keys/values: " +
    #               str(dict(zip(cache_token_keys, cache_token_value))))


async def async_redis_create_key(key: str, value: str):
    expireat = datetime.now() + ACCESS_EXPIRES
    expireat = expireat.timestamp()
    redis = await async_token_store()
    await redis.set(key, value)
    logging.debug(expireat)
    await redis.expireat(key, expireat)
    cache_token_keys = await redis.keys('*')
    cache_token_value = await redis.mget(*cache_token_keys)
    logging.debug("Cache keys: "+str(cache_token_keys))
    logging.debug("Cache values: "+str(cache_token_value))
    logging.debug("Cache keys/values: " +
                  str(dict(zip(cache_token_keys, cache_token_value))))
    redis.close()
    await redis.wait_closed()