from dataclasses import dataclass, field
from datetime import date
from decimal import Decimal
from enum import Enum
from typing import List, Optional

from app.domain.value_objects.money import (
    ZERO,
    quantize_amount,
    quantize_ratio,
    quantize_share_quantity,
    quantize_unit_price,
    strict_decimal,
)


class TransactionType(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    BONUS_ISSUE = "BONUS_ISSUE"
    RIGHTS_ISSUE = "RIGHTS_ISSUE"


class InvestmentIntent(str, Enum):
    TRADING_SHORT_TERM = "TRADING_SHORT_TERM"
    LONG_TERM_DIVIDEND = "LONG_TERM_DIVIDEND"


class CalendarBasis(str, Enum):
    HIJRI_354 = "HIJRI_354"
    GREGORIAN_365 = "GREGORIAN_365"


ZAKAT_RATE_HIJRI = Decimal("0.02500000")
ZAKAT_RATE_GREGORIAN = Decimal("0.02577000")


@dataclass(frozen=True)
class PortfolioTransactionInput:
    """FIFO lot eşleştirme motoru için işlem girdisi."""

    transaction_date: date
    transaction_type: TransactionType
    quantity_lots: Decimal
    unit_price: Decimal = ZERO

    def __post_init__(self) -> None:
        qty = quantize_share_quantity(strict_decimal(self.quantity_lots))
        if qty <= ZERO:
            raise ValueError(f"quantity_lots must be positive, got {qty}")
        price = quantize_unit_price(strict_decimal(self.unit_price))
        if price < ZERO:
            raise ValueError(f"unit_price cannot be negative: {price}")
        object.__setattr__(self, "quantity_lots", qty)
        object.__setattr__(self, "unit_price", price)


@dataclass(frozen=True)
class FIFOLotSlice:
    """Dönem içinde elde tutulan tek bir FIFO lot dilimi ve arındırma hesabı."""

    buy_date: date
    sell_date: Optional[date]
    effective_start_date: date
    effective_end_date: date
    quantity_lots: Decimal
    days_held_in_period: int
    period_total_days: int
    pro_rata_factor: Decimal
    purification_amount: Decimal


@dataclass(frozen=True)
class HoldingPurificationResult:
    """Hisse başına / dönem bazlı arındırma sonucu."""

    ticker: str
    fiscal_period: str
    period_start_date: date
    period_end_date: date
    period_total_days: int
    impure_income_isolated_quarter: Decimal
    total_shares_outstanding: Decimal
    purification_per_share: Decimal
    lot_slices: List[FIFOLotSlice]
    total_purification_raw: Decimal
    total_purification_payable: Decimal


@dataclass(frozen=True)
class DividendPurificationResult:
    """Temettü bazlı arındırma sonucu."""

    ticker: str
    dividend_received: Decimal
    is_gross_basis: bool
    impure_income_total: Decimal
    total_revenue: Decimal
    impure_income_ratio: Decimal
    purification_raw: Decimal
    purification_payable: Decimal


@dataclass(frozen=True)
class ZakatPositionInput:
    """Portföydeki tek bir hisse pozisyonu için zekat hesaplama girdisi."""

    ticker: str
    quantity_lots: Decimal
    spot_unit_price: Decimal
    investment_intent: InvestmentIntent
    total_shares_outstanding: Decimal
    cash_and_equivalents: Decimal = ZERO
    short_term_financial_investments: Decimal = ZERO
    trade_receivables_current: Decimal = ZERO
    inventories: Decimal = ZERO
    current_liabilities: Decimal = ZERO

    def __post_init__(self) -> None:
        qty = quantize_share_quantity(strict_decimal(self.quantity_lots))
        shares = quantize_share_quantity(strict_decimal(self.total_shares_outstanding))
        price = quantize_unit_price(strict_decimal(self.spot_unit_price))
        if qty < ZERO:
            raise ValueError(f"quantity_lots cannot be negative: {qty}")
        if shares <= ZERO:
            raise ValueError(f"total_shares_outstanding must be positive: {shares}")
        if price < ZERO:
            raise ValueError(f"spot_unit_price cannot be negative: {price}")
        object.__setattr__(self, "quantity_lots", qty)
        object.__setattr__(self, "total_shares_outstanding", shares)
        object.__setattr__(self, "spot_unit_price", price)

        for attr in (
            "cash_and_equivalents",
            "short_term_financial_investments",
            "trade_receivables_current",
            "inventories",
            "current_liabilities",
        ):
            val = quantize_amount(strict_decimal(getattr(self, attr)))
            if val < ZERO:
                raise ValueError(f"{attr} cannot be negative: {val}")
            object.__setattr__(self, attr, val)


@dataclass(frozen=True)
class ZakatPositionBreakdown:
    """Hisse bazında hesaplanan zekat dökümü."""

    ticker: str
    investment_intent: InvestmentIntent
    quantity_lots: Decimal
    market_value: Decimal
    zatable_net_assets_per_share: Decimal
    zatable_base_amount: Decimal
    zakat_due: Decimal


@dataclass(frozen=True)
class ZakatPortfolioReport:
    """Portföy geneli hisse zekatı raporu."""

    valuation_date: date
    calendar_basis: CalendarBasis
    zakat_rate: Decimal
    gold_85g_nisab_try: Decimal
    other_zakatable_cash_try: Decimal
    trading_intent_total_base: Decimal
    trading_intent_zakat: Decimal
    long_term_intent_total_base: Decimal
    long_term_intent_zakat: Decimal
    total_zakatable_wealth: Decimal
    is_above_nisab: bool
    total_zakat_due_raw: Decimal
    total_zakat_payable: Decimal
    positions: List[ZakatPositionBreakdown] = field(default_factory=list)
