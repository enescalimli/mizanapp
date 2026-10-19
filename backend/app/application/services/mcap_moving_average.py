from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from typing import Optional, Sequence

from app.domain.screening.entities import MarketValuationInput
from app.domain.screening.ratio_calculator import (
    TRADING_DAYS_12M,
    TRADING_DAYS_24M,
    TRADING_DAYS_36M,
    RatioCalculator,
)
from app.domain.value_objects.money import (
    ZERO,
    quantize_amount,
    quantize_share_quantity,
    quantize_unit_price,
    strict_decimal,
)


@dataclass(frozen=True)
class DailyPriceSharePoint:
    valuation_date: date
    close_price: Decimal
    shares_outstanding: Decimal

    def __post_init__(self) -> None:
        price = quantize_unit_price(strict_decimal(self.close_price))
        shares = quantize_share_quantity(strict_decimal(self.shares_outstanding))
        if price < ZERO or shares <= ZERO:
            raise ValueError("close_price must be >= 0 and shares_outstanding > 0")
        object.__setattr__(self, "close_price", price)
        object.__setattr__(self, "shares_outstanding", shares)

    @property
    def market_cap(self) -> Decimal:
        return quantize_amount(self.close_price * self.shares_outstanding)


class MarketCapMovingAverageService:
    """12, 24 ve 36 aylık (252, 504, 756 işlem günü) hareketli ortalama piyasa değeri servisi."""

    @staticmethod
    def build_valuation_from_daily_mcaps(
        spot_market_cap: Decimal,
        historical_daily_mcaps: Optional[Sequence[Decimal]] = None,
    ) -> MarketValuationInput:
        spot = quantize_amount(strict_decimal(spot_market_cap))
        if not historical_daily_mcaps:
            return MarketValuationInput(spot_market_cap=spot)

        cleaned = [quantize_amount(strict_decimal(m)) for m in historical_daily_mcaps]
        ma_12m = RatioCalculator.compute_moving_average_mcap(cleaned, TRADING_DAYS_12M)
        ma_24m = RatioCalculator.compute_moving_average_mcap(cleaned, TRADING_DAYS_24M)
        ma_36m = RatioCalculator.compute_moving_average_mcap(cleaned, TRADING_DAYS_36M)

        return MarketValuationInput(
            spot_market_cap=spot,
            mcap_ma_12m=ma_12m,
            mcap_ma_24m=ma_24m,
            mcap_ma_36m=ma_36m,
            historical_daily_mcaps=cleaned,
        )

    @classmethod
    def build_valuation_from_price_series(
        cls,
        series: Sequence[DailyPriceSharePoint],
    ) -> MarketValuationInput:
        if not series:
            raise ValueError("Price series cannot be empty")
        sorted_series = sorted(series, key=lambda x: x.valuation_date)
        mcaps = [pt.market_cap for pt in sorted_series]
        return cls.build_valuation_from_daily_mcaps(
            spot_market_cap=mcaps[-1],
            historical_daily_mcaps=mcaps,
        )
