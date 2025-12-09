# fastapi/tests/unit/test_fausto_fapi.py
"""Unit tests for fausto.fapi module."""
import pytest
from fausto.fapi import Response, _unpack_tuple_response


class TestResponse:
    """Tests for the Response model."""

    def test_response_with_message(self):
        """Test Response with message."""
        resp = Response(message="Operation successful")
        assert resp.message == "Operation successful"
        assert resp.error is False

    def test_response_error(self):
        """Test Response with error."""
        resp = Response(message="Something went wrong", error=True)
        assert resp.error is True
        assert resp.message == "Something went wrong"

    def test_response_serialization(self):
        """Test Response can be serialized to dict."""
        resp = Response(message="Test", data={"key": "value"})
        data = resp.model_dump()
        
        assert "error" in data
        assert "message" in data
        assert "data" in data

    def test_response_with_list_data(self):
        """Test Response with list data."""
        items = [{"id": 1}, {"id": 2}, {"id": 3}]
        resp = Response(message="Found", data=items)
        
        assert isinstance(resp.data, list)
        assert len(resp.data) == 3

    def test_response_with_none_data(self):
        """Test Response explicitly with None data."""
        resp = Response(message="Not found", data=None)
        assert resp.data is None


class TestUnpackTupleResponse:
    """Tests for _unpack_tuple_response helper function."""

    def test_unpack_tuple_with_all_parts(self):
        """Test unpacking tuple with message, data, and error."""
        result = _unpack_tuple_response(("Success", {"id": 1}, False))
        assert result["message"] == "Success"
        assert result["data"] == {"id": 1}
        assert result["error"] is False

    def test_unpack_tuple_with_error(self):
        """Test unpacking tuple with error=True."""
        result = _unpack_tuple_response(("Error occurred", None, True))
        assert result["message"] == "Error occurred"
        assert result["error"] is True
        assert result["data"] is None

    def test_unpack_tuple_with_list_data(self):
        """Test unpacking tuple with list data."""
        data = [{"id": 1}, {"id": 2}]
        result = _unpack_tuple_response(("Found", data, False))
        assert result["data"] == data
        assert result["message"] == "Found"

    def test_unpack_tuple_order_independent(self):
        """Test that tuple unpacking is order independent."""
        result = _unpack_tuple_response((False, {"id": 1}, "Message"))
        assert result["message"] == "Message"
        assert result["data"] == {"id": 1}
        assert result["error"] is False
