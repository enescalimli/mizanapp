from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP, ROUND_CEILING, InvalidOperation, getcontext
from typing import Union

# Set global decimal context precision to 28 digits
getcontext().prec = 28

# Standard Decimal constants
ZERO = Decimal("0")
ONE = Decimal("1")
HUNDRED = Decimal("100")
BASIS_POINTS_DIVISOR = Decimal("10000")

# Standard Quantizers
DECIMAL_2_PLACES = Decimal("0.01")
DECIMAL_4_PLACES = Decimal("0.0001")
DECIMAL_6_PLACES = Decimal("0.000001")
DECIMAL_8_PLACES = Decimal("0.00000001")


def strict_decimal(val: Union[str, int, Decimal]) -> Decimal:
    """Converts a value to Decimal strictly rejecting float types to prevent IEEE 754 precision loss."""
    if isinstance(val, bool):
        raise TypeError("Boolean is not a valid Decimal input.")
    if isinstance(val, float):
        raise TypeError(
            f"Zero-Float Violation: Float value {val!r} is strictly forbidden in financial calculations. "
            "Pass an exact string, integer, or Decimal instead."
        )
    if isinstance(val, Decimal):
        return val
    if isinstance(val, (str, int)):
        try:
            parsed = Decimal(str(val).strip())
            if parsed.is_nan() or parsed.is_infinite():
                raise ValueError(f"NaN or Infinite Decimal value is forbidden: {val!r}")
            return parsed
        except (InvalidOperation, ValueError) as err:
            raise ValueError(f"Invalid decimal string: {val!r}") from err
    raise TypeError(f"Unsupported type for strict_decimal: {type(val).__name__}")


def quantize_amount(val: Decimal, rounding: str = ROUND_HALF_UP) -> Decimal:
    """Quantizes a monetary amount to 4 decimal places (NUMERIC(24, 4))."""
    return strict_decimal(val).quantize(DECIMAL_4_PLACES, rounding=rounding)


def quantize_unit_price(val: Decimal, rounding: str = ROUND_HALF_UP) -> Decimal:
    """Quantizes a unit price or dividend to 6 decimal places (NUMERIC(18, 6))."""
    return strict_decimal(val).quantize(DECIMAL_6_PLACES, rounding=rounding)


def quantize_share_quantity(val: Decimal, rounding: str = ROUND_HALF_UP) -> Decimal:
    """Quantizes a share/lot quantity to 6 decimal places (NUMERIC(20, 6))."""
    return strict_decimal(val).quantize(DECIMAL_6_PLACES, rounding=rounding)


def quantize_ratio(val: Decimal, rounding: str = ROUND_HALF_UP) -> Decimal:
    """Quantizes a ratio to 8 decimal places (NUMERIC(12, 8))."""
    return strict_decimal(val).quantize(DECIMAL_8_PLACES, rounding=rounding)


def quantize_purification_currence(val: Decimal, rounding: str = ROUND_HALF_UP) -> Decimal:
    """Quantizes an investor's purification or zakat payable amount to 2 decimal places (kuruş),
    defaulting to ROUND_HALF_UP or ROUND_CEILING for Shariah prudence.
    """
    return strict_decimal(val).quantize(DECIMAL_2_PLACES, rounding=rounding)


@dataclass(frozen=True)
class Money:
    """Immutable domain Value Object representing an exact monetary quantity (Zero-Float)."""

    amount: Decimal
    currency: str = "TRY"

    def __post_init__(self) -> None:
        object.__setattr__(self, "amount", quantize_amount(strict_decimal(self.amount)))

    def __add__(self, other: "Money") -> "Money":
        self._check_currency(other)
        return Money(self.amount + other.amount, self.currency)

    def __sub__(self, other: "Money") -> "Money":
        self._check_currency(other)
        return Money(self.amount - other.amount, self.currency)

    def __mul__(self, scalar: Union[Decimal, int, str]) -> "Money":
        dec_scalar = strict_decimal(scalar)
        return Money(self.amount * dec_scalar, self.currency)

    def __truediv__(self, other: Union["Money", Decimal, int, str]) -> Union[Decimal, "Money"]:
        if isinstance(other, Money):
            self._check_currency(other)
            if other.amount == ZERO:
                raise ZeroDivisionError("Division by zero in Money / Money ratio calculation")
            return quantize_ratio(self.amount / other.amount)
        dec_scalar = strict_decimal(other)
        if dec_scalar == ZERO:
            raise ZeroDivisionError("Division by zero in Money / scalar")
        return Money(self.amount / dec_scalar, self.currency)

    def _check_currency(self, other: "Money") -> None:
        if self.currency != other.currency:
            raise ValueError(f"Currency mismatch: {self.currency} != {other.currency}")

    def __str__(self) -> str:
        return f"{self.amount:.4f} {self.currency}"


@dataclass(frozen=True)
class Ratio:
    """Immutable domain Value Object representing a financial ratio/percentage (Zero-Float)."""

    value: Decimal

    def __post_init__(self) -> None:
        object.__setattr__(self, "value", quantize_ratio(strict_decimal(self.value)))

    @classmethod
    def from_numerator_denominator(
        cls,
        numerator: Union[Decimal, int, str],
        denominator: Union[Decimal, int, str],
        rounding: str = ROUND_HALF_UP,
    ) -> "Ratio":
        num = strict_decimal(numerator)
        den = strict_decimal(denominator)
        if den == ZERO:
            raise ZeroDivisionError("Denominator cannot be zero in Ratio calculation")
        return cls(quantize_ratio(num / den, rounding=rounding))

    @classmethod
    def from_percentage(cls, percent: Union[Decimal, int, str]) -> "Ratio":
        p = strict_decimal(percent)
        return cls(p / HUNDRED)

    def to_percentage_string(self, decimals: int = 2) -> str:
        pct = (self.value * HUNDRED).quantize(Decimal(10) ** -decimals, rounding=ROUND_HALF_UP)
        return f"{pct:.{decimals}f}%"

    def is_strictly_less_than(self, threshold: Union["Ratio", Decimal, str]) -> bool:
        thresh = threshold.value if isinstance(threshold, Ratio) else strict_decimal(threshold)
        return self.value < thresh

    def is_less_than_or_equal(self, threshold: Union["Ratio", Decimal, str]) -> bool:
        thresh = threshold.value if isinstance(threshold, Ratio) else strict_decimal(threshold)
        return self.value <= thresh


@dataclass(frozen=True)
class BasisPoints:
    """Immutable domain Value Object representing basis points (1 bp = 0.0001 = 0.01%)."""

    bps: int

    def __post_init__(self) -> None:
        if isinstance(self.bps, float) or not isinstance(self.bps, int):
            raise TypeError(f"BasisPoints requires an integer, got {type(self.bps).__name__}")

    def to_ratio(self) -> Ratio:
        return Ratio(Decimal(self.bps) / BASIS_POINTS_DIVISOR)

    def to_decimal(self) -> Decimal:
        return quantize_ratio(Decimal(self.bps) / BASIS_POINTS_DIVISOR)

    @classmethod
    def from_ratio(cls, ratio: Ratio) -> "BasisPoints":
        bps_val = int((ratio.value * BASIS_POINTS_DIVISOR).to_integral_value(rounding=ROUND_HALF_UP))
        return cls(bps_val)


@dataclass(frozen=True)
class ShareQuantity:
    """Immutable domain Value Object representing share or lot quantities."""

    quantity: Decimal

    def __post_init__(self) -> None:
        object.__setattr__(self, "quantity", quantize_share_quantity(strict_decimal(self.quantity)))

    def __add__(self, other: "ShareQuantity") -> "ShareQuantity":
        return ShareQuantity(self.quantity + other.quantity)

    def __sub__(self, other: "ShareQuantity") -> "ShareQuantity":
        return ShareQuantity(self.quantity - other.quantity)


@dataclass(frozen=True)
class FiscalPeriod:
    """Immutable domain Value Object representing a fiscal year and quarter."""

    year: int
    quarter: int
    period_days: int = 90

    def __post_init__(self) -> None:
        if not (1 <= self.quarter <= 4):
            raise ValueError(f"Quarter must be between 1 and 4, got {self.quarter}")
        if not (1900 <= self.year <= 2100):
            raise ValueError(f"Invalid fiscal year: {self.year}")
        if self.period_days <= 0:
            raise ValueError(f"period_days must be positive, got {self.period_days}")

    @property
    def label(self) -> str:
        return f"{self.year}-Q{self.quarter}"

    def __str__(self) -> str:
        return self.label
