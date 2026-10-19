from dataclasses import dataclass
from decimal import Decimal
from enum import Enum
from typing import Optional

from app.domain.value_objects.money import (
    ZERO,
    strict_decimal,
    quantize_amount,
)


class ExtractionStatus(str, Enum):
    VERIFIED = "VERIFIED"
    CONSERVATIVE_FALLBACK = "CONSERVATIVE_FALLBACK"
    EXTRACTION_CONFLICT = "EXTRACTION_CONFLICT"


@dataclass(frozen=True)
class CashFootnoteBreakdown:
    """Nakit ve Nakit Benzerleri dipnot kırılımı."""

    balance_sheet_total: Decimal
    cash_on_hand: Decimal = ZERO
    demand_deposits_banks: Decimal = ZERO
    participation_accounts: Decimal = ZERO
    time_deposits_interest: Decimal = ZERO
    reverse_repo_receivables: Decimal = ZERO
    money_market_funds_interest: Decimal = ZERO
    explicit_other_cash: Decimal = ZERO

    def __post_init__(self) -> None:
        for field_name in (
            "balance_sheet_total",
            "cash_on_hand",
            "demand_deposits_banks",
            "participation_accounts",
            "time_deposits_interest",
            "reverse_repo_receivables",
            "money_market_funds_interest",
            "explicit_other_cash",
        ):
            val = quantize_amount(strict_decimal(getattr(self, field_name)))
            if val < ZERO:
                raise ValueError(f"{field_name} cannot be negative: {val}")
            object.__setattr__(self, field_name, val)


@dataclass(frozen=True)
class FinancialInvestmentsBreakdown:
    """Kısa ve Uzun Vadeli Finansal Yatırımlar dipnot kırılımı."""

    balance_sheet_total: Decimal
    sukuk_and_lease_certificates: Decimal = ZERO
    compliant_equity_investments: Decimal = ZERO
    government_bonds_and_tbills: Decimal = ZERO
    corporate_bonds_interest: Decimal = ZERO
    derivative_assets_speculative: Decimal = ZERO

    def __post_init__(self) -> None:
        for field_name in (
            "balance_sheet_total",
            "sukuk_and_lease_certificates",
            "compliant_equity_investments",
            "government_bonds_and_tbills",
            "corporate_bonds_interest",
            "derivative_assets_speculative",
        ):
            val = quantize_amount(strict_decimal(getattr(self, field_name)))
            if val < ZERO:
                raise ValueError(f"{field_name} cannot be negative: {val}")
            object.__setattr__(self, field_name, val)


@dataclass(frozen=True)
class BorrowingsFootnoteBreakdown:
    """Finansal Borçlanmalar dipnot kırılımı."""

    balance_sheet_total: Decimal
    participation_bank_financings: Decimal = ZERO
    sukuk_issued_liabilities: Decimal = ZERO
    operational_lease_tfrs16: Decimal = ZERO
    conventional_bank_loans: Decimal = ZERO
    issued_bonds_and_bills_debt: Decimal = ZERO
    factoring_and_financial_lease_debt: Decimal = ZERO

    def __post_init__(self) -> None:
        for field_name in (
            "balance_sheet_total",
            "participation_bank_financings",
            "sukuk_issued_liabilities",
            "operational_lease_tfrs16",
            "conventional_bank_loans",
            "issued_bonds_and_bills_debt",
            "factoring_and_financial_lease_debt",
        ):
            val = quantize_amount(strict_decimal(getattr(self, field_name)))
            if val < ZERO:
                raise ValueError(f"{field_name} cannot be negative: {val}")
            object.__setattr__(self, field_name, val)


@dataclass(frozen=True)
class VerifiedFootnoteResult:
    """Muhasebe denkliği ve İhtiyatlılık İlkesi uygulanmış dipnot sonucu."""

    status: ExtractionStatus
    is_accounting_identity_verified: bool
    used_conservative_fallback: bool
    halal_cash_total: Decimal
    interest_bearing_cash_and_investments_total: Decimal
    unclassified_cash_fallback_amount: Decimal
    unclassified_investments_fallback_amount: Decimal
    halal_debt_total: Decimal
    interest_bearing_debt_total: Decimal
    unclassified_debt_fallback_amount: Decimal
    audit_message: str


@dataclass(frozen=True)
class CumulativeQuarterIncomeInput:
    """KAP kümülatif gelir tablosu dönem verisi (Q1=3A, Q2=6A, Q3=9A, Q4=12A)."""

    fiscal_year: int
    fiscal_quarter: int
    revenue_cumulative: Decimal
    interest_income_cumulative: Decimal
    non_compliant_side_income_cumulative: Decimal = ZERO
    fx_gain_interest_bearing_cumulative: Decimal = ZERO
    net_income_cumulative: Decimal = ZERO

    def __post_init__(self) -> None:
        if not (1 <= self.fiscal_quarter <= 4):
            raise ValueError(f"fiscal_quarter must be 1..4, got {self.fiscal_quarter}")
        for field_name in (
            "revenue_cumulative",
            "interest_income_cumulative",
            "non_compliant_side_income_cumulative",
            "fx_gain_interest_bearing_cumulative",
            "net_income_cumulative",
        ):
            val = quantize_amount(strict_decimal(getattr(self, field_name)))
            object.__setattr__(self, field_name, val)


@dataclass(frozen=True)
class IsolatedQuarterIncomeResult:
    """Tekil çeyrek (3 aylık) ve TTM (Son 12 Ay) ayrıştırılmış gelir verisi."""

    fiscal_year: int
    fiscal_quarter: int
    revenue_isolated_quarter: Decimal
    interest_income_isolated_quarter: Decimal
    non_compliant_side_income_isolated_quarter: Decimal
    fx_gain_interest_bearing_isolated_quarter: Decimal
    total_impure_income_isolated_quarter: Decimal
    net_income_isolated_quarter: Decimal
    revenue_ttm: Optional[Decimal] = None
    total_impure_income_ttm: Optional[Decimal] = None
    used_fx_reversal_floor: bool = False
