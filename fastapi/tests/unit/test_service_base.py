# fastapi/tests/unit/test_service_base.py
"""Unit tests for CRUDBase service class using real models."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from auth.service.base import CRUDBase
from auth.model.models import Role
from fausto import ControllerError


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
def role_service(mock_async_session):
    """Create a CRUDBase instance for Role model."""
    return CRUDBase(Role, mock_async_session)


@pytest.fixture
def role_service_with_excludes(mock_async_session):
    """Create a CRUDBase instance with excluded fields."""
    return CRUDBase(Role, mock_async_session, exclude_fields=["password"])


class TestCRUDBaseCreate:
    """Tests for CRUDBase.create() method."""

    @pytest.mark.asyncio
    async def test_create_success(self, role_service, mock_async_session):
        """Test successful creation."""
        mock_input = MagicMock()
        mock_input.model_dump.return_value = {"name": "new_role", "display_name": "New Role"}
        
        with patch("auth.service.base.jsonable_encoder", return_value={"name": "new_role", "display_name": "New Role"}):
            with patch("auth.service.base.to_dict", return_value={"id": 1, "name": "new_role", "display_name": "New Role"}):
                result = await role_service.create(obj_in=mock_input)
        
        assert result["msg"] == "Saved successful!"
        assert result["data"]["name"] == "new_role"
        mock_async_session.add.assert_called_once()
        mock_async_session.commit.assert_called_once()
        mock_async_session.refresh.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_exception_rollback(self, role_service, mock_async_session):
        """Test create() rolls back on exception."""
        mock_input = MagicMock()
        mock_input.model_dump.return_value = {"name": "new_role"}
        mock_async_session.commit.side_effect = Exception("Commit failed")
        
        with patch("auth.service.base.jsonable_encoder", return_value={"name": "new_role"}):
            with pytest.raises(ControllerError) as exc_info:
                await role_service.create(obj_in=mock_input)
        
        assert "Commit failed" in str(exc_info.value)
        mock_async_session.rollback.assert_called_once()


class TestCRUDBaseProcessData:
    """Tests for CRUDBase._process_data() method."""

    def test_process_data_no_excludes(self, role_service):
        """Test _process_data without excluded fields."""
        mock_obj = MagicMock()
        
        with patch("auth.service.base.to_dict", return_value={"id": 1, "name": "test", "password": "secret"}):
            result = role_service._process_data(mock_obj)
        
        assert "password" in result  # Not excluded

    def test_process_data_with_excludes(self, role_service_with_excludes):
        """Test _process_data with excluded fields."""
        mock_obj = MagicMock()
        
        with patch("auth.service.base.to_dict", return_value={"id": 1, "name": "test", "password": "secret"}):
            with patch("auth.service.base.remove_fields_sqlalch", return_value={"id": 1, "name": "test"}):
                result = role_service_with_excludes._process_data(mock_obj)
        
        assert "password" not in result
