# fastapi/tests/unit/test_fausto_sqlalch.py
"""Unit tests for fausto.sqlalch utility functions."""
import pytest
from datetime import datetime, date, time
from decimal import Decimal

from fausto.sqlalch import (
    remove_fields_sqlalch,
    remove_none_fields_sqlalch,
)


class TestRemoveFieldsSqlalch:
    """Tests for remove_fields_sqlalch() function."""

    def test_remove_single_field(self):
        """Test removing a single field."""
        data = {"id": 1, "name": "test", "password": "secret"}
        result = remove_fields_sqlalch(data, ["password"])
        
        assert "password" not in result
        assert result["id"] == 1
        assert result["name"] == "test"

    def test_remove_multiple_fields(self):
        """Test removing multiple fields."""
        data = {"id": 1, "name": "test", "password": "secret", "token": "abc123"}
        result = remove_fields_sqlalch(data, ["password", "token"])
        
        assert "password" not in result
        assert "token" not in result
        assert len(result) == 2

    def test_remove_nonexistent_field(self):
        """Test removing a field that doesn't exist."""
        data = {"id": 1, "name": "test"}
        result = remove_fields_sqlalch(data, ["nonexistent"])
        
        assert result == {"id": 1, "name": "test"}

    def test_remove_empty_list(self):
        """Test with empty fields list."""
        data = {"id": 1, "name": "test"}
        result = remove_fields_sqlalch(data, [])
        
        assert result == data


class TestRemoveNoneFieldsSqlalch:
    """Tests for remove_none_fields_sqlalch() function."""

    def test_remove_none_values(self):
        """Test removing None values."""
        data = {"id": 1, "name": "test", "description": None, "value": None}
        result = remove_none_fields_sqlalch(data)
        
        assert "description" not in result
        assert "value" not in result
        assert result == {"id": 1, "name": "test"}

    def test_keep_all_if_no_none(self):
        """Test keeping all fields if no None values."""
        data = {"id": 1, "name": "test", "value": 0, "flag": False, "text": ""}
        result = remove_none_fields_sqlalch(data)
        
        # Should keep 0, False, and empty string (they're not None)
        assert result == data

    def test_empty_dict(self):
        """Test with empty dictionary."""
        result = remove_none_fields_sqlalch({})
        assert result == {}

    def test_all_none(self):
        """Test with all None values."""
        data = {"a": None, "b": None, "c": None}
        result = remove_none_fields_sqlalch(data)
        assert result == {}
