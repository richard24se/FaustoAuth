# -*- coding: utf-8 -*-
import logging
from typing import Any, NamedTuple


class ControllerError(Exception):
    """Custom exception for controller-level errors."""

    def __init__(self, message: str, data: Any = None, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.data = data
        self.status_code = status_code


class ValidationResult(NamedTuple):
    """Structured result for validation functions."""

    ok: bool
    message: str
    data: dict[str, Any] | None = None
    filtered: dict[str, Any] | None = None


def validate_required_data(
    json_data: dict[str, Any],
    required_keys: set[str],
    optional_keys: set[str] = None,
) -> ValidationResult:
    """
    Validates that a dictionary contains all required keys and no unknown keys.

    :param json_data: The dictionary to validate.
    :param required_keys: A set of keys that must be present.
    :param optional_keys: A set of keys that are allowed but not required.
    :return: A ValidationResult tuple.
    """
    if optional_keys is None:
        optional_keys = set()

    try:
        data_keys = set(json_data.keys())
        missing_keys = required_keys - data_keys
        extra_keys = data_keys - required_keys - optional_keys

        error_messages = []
        if missing_keys:
            error_messages.append(f"Missing keys: {', '.join(sorted(missing_keys))}")
        if extra_keys:
            error_messages.append(f"Unknown keys: {', '.join(sorted(extra_keys))}")

        if not error_messages:
            return ValidationResult(ok=True, message="Validation successful.")

        return ValidationResult(
            ok=False,
            message="; ".join(error_messages),
            data={"missing": list(missing_keys), "unknown": list(extra_keys)},
        )
    except Exception as e:
        logging.exception("Error during data validation: %s", e)
        return ValidationResult(ok=False, message="An internal error occurred during validation.")


def args_parser(args: dict[str, list]) -> dict[str, Any]:
    """
    Parses a dictionary of list values (like query params) into a dictionary
    with single values or lists, converting boolean-like strings.
    """

    def _depure(value: list) -> Any:
        if len(value) == 1:
            result = value[0]
            if result.lower() == "true":
                return True
            if result.lower() == "false":
                return False
            return result
        return list(set(value))  # Return unique values if multiple are present

    return {key: _depure(value) for key, value in args.items()}