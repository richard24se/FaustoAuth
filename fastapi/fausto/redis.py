import logging
from typing import Any

from config.databases import async_token_store
from fausto import ControllerError


async def redis_create_key(key: str, value: str, expire_delta: int | None = None) -> str:
    """Creates a new key-value pair in Redis with an optional expiration.

    Args:
        key (str): The key to store.
        value (str): The value to store.
        expire_delta (int | None): The expiration time in seconds. Defaults to None.

    Returns:
        str: A success message.
    """
    try:
        await async_token_store.set(key, value, ex=expire_delta)
        logging.debug("Redis key '%s' created/updated.", key)
        return "Saved successful!"
    except Exception as e:
        logging.error("Error creating/updating Redis key '%s': %s", key, e)
        raise ControllerError(f"Error creating/updating Redis key: {e}")


async def redis_get_key(key: str) -> str | None:
    """Retrieves the value associated with a key from Redis.

    Args:
        key (str): The key to retrieve.

    Returns:
        str | None: The value of the key, or None if the key does not exist.
    """
    try:
        value = await async_token_store.get(key)
        logging.debug("Redis key '%s' retrieved.", key)
        return value
    except Exception as e:
        logging.error("Error retrieving Redis key '%s': %s", key, e)
        raise ControllerError(f"Error retrieving Redis key: {e}")


async def redis_delete_key(key: str) -> str:
    """Deletes a key from Redis.

    Args:
        key (str): The key to delete.

    Returns:
        str: A success message.
    """
    try:
        await async_token_store.delete(key)
        logging.debug("Redis key '%s' deleted.", key)
        return "Deleted successful!"
    except Exception as e:
        logging.error("Error deleting Redis key '%s': %s", key, e)
        raise ControllerError(f"Error deleting Redis key: {e}")


async def get_redis_connection() -> Any:
    """Provides an asynchronous Redis connection.

    This function is intended for direct use of the async_token_store client.

    Returns:
        Any: An asynchronous Redis client instance.
    """
    return async_token_store