from contextvars import ContextVar
from typing import Optional

# Global context variable for the current request's tenant ID
# This is set by middleware and read by the SQLAlchemy event listener
tenant_context: ContextVar[Optional[int]] = ContextVar("tenant_context", default=None)
