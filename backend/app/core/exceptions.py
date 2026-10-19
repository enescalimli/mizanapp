from typing import Any, Optional
from fastapi import HTTPException, status


class KatilimException(Exception):
    """Base exception for Katilim Platform domain and application errors."""

    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(message)
        self.message = message
        self.details = details


class ShariahComplianceViolationError(KatilimException):
    """Raised when an action violates Islamic Finance / Katilim rules."""

    pass


class AccountingIdentityError(KatilimException):
    """Raised when footnote components do not match balance sheet totals."""

    pass


class ZeroFloatViolationError(KatilimException):
    """Raised when a float type is detected in financial calculations."""

    pass


class NonCompliantInstrumentError(KatilimException):
    """Raised when an operation attempts to run technical analysis or generate signals

    for an instrument that is NON_COMPLIANT in the Katilim screening pool.
    """

    pass


class EntityNotFoundError(KatilimException):
    """Raised when an entity is not found in the database."""

    pass
