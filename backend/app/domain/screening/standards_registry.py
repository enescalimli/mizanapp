from dataclasses import replace
from decimal import Decimal
from typing import Dict

from app.domain.screening.entities import DenominatorRule, ScreeningStandardConfig

BIST_KATILIM_DIB_STANDARD = ScreeningStandardConfig(
    code="BIST_KATILIM_DIB",
    name="BIST Katılım Endeksi (TKBB / DİB Standartları)",
    max_interest_debt_ratio=Decimal("0.33000000"),
    max_interest_cash_ratio=Decimal("0.33000000"),
    max_impure_income_ratio=Decimal("0.05000000"),
    debt_denominator_rule=DenominatorRule.MAX_OF_MCAP_OR_ASSETS,
    cash_denominator_rule=DenominatorRule.MAX_OF_MCAP_OR_ASSETS,
    mcap_moving_avg_months=0,
    tolerance_band_bps=150,
    grace_period_quarters=2,
    exclude_defense_sector=False,
    strict_less_than=True,
)

AAOIFI_STD_21_STANDARD = ScreeningStandardConfig(
    code="AAOIFI_STD_21",
    name="AAOIFI Shariah Standard No. 21",
    max_interest_debt_ratio=Decimal("0.30000000"),
    max_interest_cash_ratio=Decimal("0.30000000"),
    max_impure_income_ratio=Decimal("0.05000000"),
    debt_denominator_rule=DenominatorRule.MCAP_MA_24M,
    cash_denominator_rule=DenominatorRule.MCAP_MA_24M,
    mcap_moving_avg_months=24,
    tolerance_band_bps=150,
    grace_period_quarters=2,
    exclude_defense_sector=False,
    strict_less_than=True,
)

STANDARDS_REGISTRY: Dict[str, ScreeningStandardConfig] = {
    BIST_KATILIM_DIB_STANDARD.code: BIST_KATILIM_DIB_STANDARD,
    AAOIFI_STD_21_STANDARD.code: AAOIFI_STD_21_STANDARD,
}


def get_standard_config(code: str, **overrides: object) -> ScreeningStandardConfig:
    """Kayıtlı bir katılım standardını getirir ve isteğe bağlı parametrik özelleştirmeleri uygular."""
    normalized = code.strip().upper()
    if normalized not in STANDARDS_REGISTRY:
        raise KeyError(
            f"Unknown screening standard '{code}'. Available: {list(STANDARDS_REGISTRY.keys())}"
        )
    base = STANDARDS_REGISTRY[normalized]
    if overrides:
        return replace(base, **overrides)  # type: ignore[arg-type]
    return base
