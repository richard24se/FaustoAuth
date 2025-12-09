from fastapi import Request, status
from fastapi.responses import JSONResponse
from fausto import ControllerError

async def controller_error_handler(request: Request, exc: ControllerError):
    """
    Global exception handler for ControllerError.
    Converts ControllerError into a standard JSON response.
    """
    error_content = {
        "message": exc.message,
        "error": True,
        "data": exc.data,
    }
    status_code = exc.status_code or status.HTTP_500_INTERNAL_SERVER_ERROR
    return JSONResponse(
        status_code=status_code,
        content=error_content,
    )
