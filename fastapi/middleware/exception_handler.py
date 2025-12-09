import logging
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

class GlobalExceptionMiddleware(BaseHTTPMiddleware):
    """
    Middleware to catch all unhandled exceptions and return a standardized JSON response.
    
    This acts as a final safety net for any errors that escape the application's
    exception handlers, ensuring the client always receives a valid JSON response.
    """
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as exc:
            logging.error("Unhandled exception occurred: %s", exc, exc_info=True)
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": True,
                    "message": "Internal Server Error",
                    "data": str(exc),
                }
            )
