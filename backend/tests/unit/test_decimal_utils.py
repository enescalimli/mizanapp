from decimal import Decimal
import pytest
from pydantic import BaseModel

from app.core.decimal_utils import (
    strict_decimal,
    quantize_amount,
    quantize_ratio,
    quantize_share_quantity,
    quantize_purification_currence,
    StringifiedDecimal4,
    StringifiedDecimal8,
    ZERO,
    ONE,
)
from app.domain.value_objects.money import (
    Money,
    Ratio,
    BasisPoints,
    ShareQuantity,
    FiscalPeriod,
)


def test_strict_decimal_rejects_float():
    """Verify that any float passed into strict_decimal raises TypeError (Zero-Float law)."""
    with pytest.raises(TypeError, match="Zero-Float Violation"):
        strict_decimal(0.33)

    with pytest.raises(TypeError, match="Zero-Float Violation"):
        strict_decimal(100.5)


def test_strict_decimal_accepts_str_and_int_and_decimal():
    """Verify that strings, integers, and Decimals are accepted."""
    assert strict_decimal("0.33000000") == Decimal("0.33000000")
    assert strict_decimal(100) == Decimal("100")
    assert strict_decimal(Decimal("45.1234")) == Decimal("45.1234")


def test_quantizers():
    """Verify quantizer precision matches the schema."""
    val = Decimal("123.456789123")
    assert quantize_amount(val) == Decimal("123.4568")  # 4 places
    assert quantize_share_quantity(val) == Decimal("123.456789")  # 6 places
    assert quantize_ratio(val) == Decimal("123.45678912")  # 8 places
    assert quantize_purification_currence(val) == Decimal("123.46")  # 2 places


def test_money_value_object():
    """Verify Money arithmetic and currency safety."""
    m1 = Money("1000.5000", "TRY")
    m2 = Money("500.2500", "TRY")

    # Addition & Subtraction
    m_sum = m1 + m2
    assert m_sum.amount == Decimal("1500.7500")

    m_diff = m1 - m2
    assert m_diff.amount == Decimal("500.2500")

    # Multiplication by scalar
    m_mul = m1 * 2
    assert m_mul.amount == Decimal("2001.0000")

    # Money / Money yields Ratio
    ratio = m2 / m1
    assert ratio == Decimal("0.50000000")

    # Currency mismatch
    m_usd = Money("100.0000", "USD")
    with pytest.raises(ValueError, match="Currency mismatch"):
        _ = m1 + m_usd


def test_ratio_value_object():
    """Verify Ratio formatting, comparison, and basis points."""
    r = Ratio("0.32950000")
    assert r.to_percentage_string(2) == "32.95%"
    assert r.is_less_than_or_equal(Decimal("0.33000000")) is True
    assert r.is_less_than_or_equal(Decimal("0.30000000")) is False

    # Basis points
    bp = BasisPoints.from_ratio(r)
    assert bp.bps == 3295


def test_fiscal_period():
    """Verify FiscalPeriod validation and labeling."""
    fp = FiscalPeriod(2026, 2)
    assert fp.label == "2026-Q2"
    assert str(fp) == "2026-Q2"

    with pytest.raises(ValueError, match="Quarter must be between 1 and 4"):
        FiscalPeriod(2026, 5)


class SampleDTO(BaseModel):
    amount: StringifiedDecimal4
    ratio: StringifiedDecimal8


def test_stringified_decimal_pydantic_serialization():
    """Verify that Pydantic v2 serializes Decimals into exact strings."""
    dto = SampleDTO(amount=Decimal("1450.5000"), ratio=Decimal("0.02456789"))
    json_data = dto.model_dump(mode="json")

    assert json_data["amount"] == "1450.5000"
    assert json_data["ratio"] == "0.02456789"
    assert isinstance(json_data["amount"], str)
    assert isinstance(json_data["ratio"], str)


def test_stringified_decimal_pydantic_rejects_float():
    """Verify that passing a float into Pydantic model raises error."""
    with pytest.raises(Exception):
        SampleDTO(amount=100.5, ratio=0.05)  # type: ignore
