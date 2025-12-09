# fastapi/tests/unit/conftest.py
"""Unit test fixtures with mocked dependencies."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timezone


@pytest.fixture
def mock_async_session():
    """Create a mocked AsyncSession for unit tests."""
    session = AsyncMock()
    session.execute = AsyncMock()
    session.commit = AsyncMock()
    session.rollback = AsyncMock()
    session.refresh = AsyncMock()
    session.add = MagicMock()
    session.delete = AsyncMock()
    session.close = AsyncMock()
    return session


@pytest.fixture
def mock_scalars_result():
    """Create a mock for scalars().first() pattern."""
    def _create_result(first_value=None, all_values=None):
        scalars = MagicMock()
        scalars.first.return_value = first_value
        scalars.all.return_value = all_values or []
        
        result = MagicMock()
        result.scalars.return_value = scalars
        return result
    return _create_result


@pytest.fixture
def sample_datetime():
    """Provide a sample datetime for testing."""
    return datetime(2024, 1, 1, 12, 0, 0, tzinfo=timezone.utc)


@pytest.fixture
def mock_model_object():
    """Create a mock SQLAlchemy model object."""
    def _create_mock(model_class_name="TestModel", **attrs):
        mock_obj = MagicMock()
        mock_obj.__class__.__name__ = model_class_name
        for key, value in attrs.items():
            setattr(mock_obj, key, value)
        return mock_obj
    return _create_mock
