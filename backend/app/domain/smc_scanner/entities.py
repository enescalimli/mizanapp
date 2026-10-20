from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional, Any
from app.domain.value_objects.money import strict_decimal, ZERO


class SwingType(str, Enum):
    SWING_HIGH = "SWING_HIGH"
    SWING_LOW = "SWING_LOW"


class FVGDirection(str, Enum):
    BULLISH = "BULLISH"
    BEARISH = "BEARISH"


class MitigationStatus(str, Enum):
    UNMITIGATED = "UNMITIGATED"
    PARTIALLY_MITIGATED = "PARTIALLY_MITIGATED"
    FULLY_MITIGATED = "FULLY_MITIGATED"


class BreakType(str, Enum):
    BULLISH_BOS = "BULLISH_BOS"
    BEARISH_BOS = "BEARISH_BOS"
    BULLISH_CHOCH = "BULLISH_CHOCH"
    BEARISH_CHOCH = "BEARISH_CHOCH"


class SweepType(str, Enum):
    SSL_LIQUIDITY_SWEEP = "SSL_LIQUIDITY_SWEEP"  # Sell-Side Liquidity Sweep (Bullish Reversal signal)
    BSL_LIQUIDITY_SWEEP = "BSL_LIQUIDITY_SWEEP"  # Buy-Side Liquidity Sweep (Bearish Reversal signal)


class SignalStatus(str, Enum):
    ACTIVE = "ACTIVE"
    MITIGATED = "MITIGATED"
    ARCHIVED_DUE_TO_NON_COMPLIANCE = "ARCHIVED_DUE_TO_NON_COMPLIANCE"


@dataclass(frozen=True)
class Candle:
    """Zero-Float OHLCV Candle Model."""
    time: datetime
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: Decimal = ZERO

    def __post_init__(self):
        object.__setattr__(self, "open", strict_decimal(self.open))
        object.__setattr__(self, "high", strict_decimal(self.high))
        object.__setattr__(self, "low", strict_decimal(self.low))
        object.__setattr__(self, "close", strict_decimal(self.close))
        object.__setattr__(self, "volume", strict_decimal(self.volume))

        if self.high < self.low:
            raise ValueError(f"Candle High ({self.high}) cannot be less than Low ({self.low}).")

    @property
    def is_bullish(self) -> bool:
        return self.close >= self.open

    @property
    def body_size(self) -> Decimal:
        return abs(self.close - self.open)

    @property
    def upper_wick(self) -> Decimal:
        return self.high - max(self.open, self.close)

    @property
    def lower_wick(self) -> Decimal:
        return min(self.open, self.close) - self.low


@dataclass(frozen=True)
class SwingPoint:
    """Fractal Swing High or Swing Low pivot."""
    index: int
    time: datetime
    price: Decimal
    swing_type: SwingType
    left_bars: int
    right_bars: int

    def __post_init__(self):
        object.__setattr__(self, "price", strict_decimal(self.price))


@dataclass
class FVGZone:
    """Fair Value Gap Zone with progressive mitigation tracking."""
    id: str
    start_time: datetime
    direction: FVGDirection
    upper_bound: Decimal
    lower_bound: Decimal
    mid_price: Decimal
    status: MitigationStatus = MitigationStatus.UNMITIGATED
    mitigated_at: Optional[datetime] = None

    def __post_init__(self):
        self.upper_bound = strict_decimal(self.upper_bound)
        self.lower_bound = strict_decimal(self.lower_bound)
        self.mid_price = strict_decimal(self.mid_price)


@dataclass(frozen=True)
class StructureBreak:
    """Candle-body close confirmed BOS or CHoCH."""
    time: datetime
    break_type: BreakType
    swing_ref_price: Decimal
    break_candle_close: Decimal
    trend: str

    def __post_init__(self):
        object.__setattr__(self, "swing_ref_price", strict_decimal(self.swing_ref_price))
        object.__setattr__(self, "break_candle_close", strict_decimal(self.break_candle_close))


@dataclass(frozen=True)
class LiquiditySweep:
    """Wick-only liquidity grab (SFP / Turtle Soup)."""
    time: datetime
    sweep_type: SweepType
    sweep_level: Decimal
    wick_extreme: Decimal
    close_price: Decimal

    def __post_init__(self):
        object.__setattr__(self, "sweep_level", strict_decimal(self.sweep_level))
        object.__setattr__(self, "wick_extreme", strict_decimal(self.wick_extreme))
        object.__setattr__(self, "close_price", strict_decimal(self.close_price))


@dataclass
class SMCSignal:
    """Halal Gatekeeper approved Smart Money Concept Signal."""
    ticker: str
    timeframe: str
    signal_type: str
    signal_timestamp: datetime
    zone_upper_bound: Decimal
    zone_lower_bound: Decimal
    reference_swing_price: Optional[Decimal] = None
    is_mitigated: bool = False
    status: SignalStatus = SignalStatus.ACTIVE
    metadata_json: dict[str, Any] = field(default_factory=dict)
    company_id: Optional[str] = None

    def __post_init__(self):
        self.zone_upper_bound = strict_decimal(self.zone_upper_bound)
        self.zone_lower_bound = strict_decimal(self.zone_lower_bound)
        if self.reference_swing_price is not None:
            self.reference_swing_price = strict_decimal(self.reference_swing_price)
