from decimal import Decimal, ROUND_HALF_UP, ROUND_CEILING, InvalidOperation, getcontext
from typing import Annotated, Any, Union
from pydantic import GetCoreSchemaHandler
from pydantic_core import core_schema

# Set global decimal context precision to 28 digits
getcontext().prec = 28

# Standard Decimal constants
ZERO = Decimal("0")
ONE = Decimal("1")
HUNDRED = Decimal("100")
BASIS_POINTS_DIVISOR = Decimal("10000")

# Standard Quantizers
DECIMAL_4_PLACES = Decimal("0.0001")
DECIMAL_6_PLACES = Decimal("0.000001")
DECIMAL_8_PLACES = Decimal("0.00000001")
DECIMAL_2_PLACES = Decimal("0.01")


def strict_decimal(val: Union[str, int, Decimal]) -> Decimal:
    """Converts a value to Decimal strictly rejecting float types to prevent IEEE 754 precision loss."""
    if isinstance(val, float):
        raise TypeError(
            f"Zero-Float Violation: Float value {val!r} is strictly forbidden in financial calculations. "
            "Pass an exact string or integer instead."
        )
    if isinstance(val, Decimal):
        return val
    try:
        return Decimal(str(val).strip())
    except (InvalidOperation, ValueError) as err:
        raise ValueError(f"Invalid decimal string: {val!r}") from err


def quantize_amount(val: Decimal, rounding: str = ROUND_HALF_UP) -> Decimal:
    """Quantizes a monetary amount to 4 decimal places (NUMERIC(24, 4))."""
    return val.quantize(DECIMAL_4_PLACES, rounding=rounding)


def quantize_unit_price(val: Decimal, rounding: str = ROUND_HALF_UP) -> Decimal:
    """Quantizes a unit price or dividend to 6 decimal places (NUMERIC(18, 6))."""
    return val.quantize(DECIMAL_6_PLACES, rounding=rounding)


def quantize_share_quantity(val: Decimal, rounding: str = ROUND_HALF_UP) -> Decimal:
    """Quantizes a share/lot quantity to 6 decimal places (NUMERIC(20, 6))."""
    return val.quantize(DECIMAL_6_PLACES, rounding=rounding)


def quantize_ratio(val: Decimal, rounding: str = ROUND_HALF_UP) -> Decimal:
    """Quantizes a ratio to 8 decimal places (NUMERIC(12, 8))."""
    return val.quantize(DECIMAL_8_PLACES, rounding=rounding)


def quantize_purification_currence(val: Decimal, rounding: str = ROUND_HALF_UP) -> Decimal:
    """Quantizes an investor's purification or zakat payable amount to 2 decimal places (kuruş),

    defaulting to ROUND_HALF_UP or ROUND_CEILING for Shariah prudence.
    """
    return val.quantize(DECIMAL_2_PLACES, rounding=rounding)


class _StringifiedDecimalAnnotation:
    """Pydantic v2 core schema annotation to strictly validate and serialize Decimals as Strings."""

    def __init__(self, decimal_places: int = 4):
        self.decimal_places = decimal_places

    def __get_pydantic_core_schema__(
        self, source_type: Any, handler: GetCoreSchemaHandler
    ) -> core_schema.CoreSchema:
        def validate(value: Any) -> Decimal:
            if isinstance(value, float):
                raise TypeError(
                    f"Zero-Float Violation: Float value {value} is forbidden. Use string or Decimal."
                )
            if isinstance(value, Decimal):
                return value
            if isinstance(value, (str, int)):
                try:
                    return Decimal(str(value).strip())
                except Exception as err:
                    raise ValueError(f"Cannot parse decimal from {value!r}") from err
            raise TypeError(f"Invalid type for Decimal: {type(value)}")

        def serialize(value: Decimal) -> str:
            # Formats to fixed decimal places
            pattern = Decimal(10) ** -self.decimal_places
            return f"{value.quantize(pattern):.{self.decimal_places}f}"

        return core_schema.no_info_before_validator_function(
            validate,
            core_schema.decimal_schema(
                serialization=core_schema.plain_serializer_function_ser_schema(serialize)
            ),
        )


# Type aliases for Pydantic models
StringifiedDecimal4 = Annotated[Decimal, _StringifiedDecimalAnnotation(4)]
StringifiedDecimal6 = Annotated[Decimal, _StringifiedDecimalAnnotation(6)]
StringifiedDecimal8 = Annotated[Decimal, _StringifiedDecimalAnnotation(8)]
StringifiedDecimal2 = Annotated[Decimal, _StringifiedDecimalAnnotation(2)]
