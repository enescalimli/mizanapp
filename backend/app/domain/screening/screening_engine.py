from decimal import Decimal
from typing import Dict, List, Optional, Sequence, Union

from app.domain.financial_parser.entities import (
    BorrowingsFootnoteBreakdown,
    CashFootnoteBreakdown,
    FinancialInvestmentsBreakdown,
)
from app.domain.financial_parser.identity_validator import AccountingIdentityValidator
from app.domain.screening.entities import (
    ComplianceStatus,
    FinancialScreeningInput,
    MarketValuationInput,
    PriorScreeningState,
    ScreeningEvaluationResult,
    ScreeningStandardConfig,
    SectorActivityInput,
)
from app.domain.screening.grace_period_fsm import GracePeriodStateMachine
from app.domain.screening.ratio_calculator import RatioCalculator
from app.domain.screening.sector_filter import SectorFilter
from app.domain.screening.standards_registry import (
    AAOIFI_STD_21_STANDARD,
    BIST_KATILIM_DIB_STANDARD,
    get_standard_config,
)
from app.domain.value_objects.money import ZERO


class ScreeningEngine:
    """Çoklu Standart Katılım Uygunluk Motoru (BIST Katılım DİB / TKBB & AAOIFI Std 21).

    Özellikler:
    - Parametrik eşikler (%33 / %33 / %5 BIST ve %30 / %30 / %5 AAOIFI).
    - Spot Piyasa Değeri, 12/24/36 Aylık Hareketli Ortalama Piyasa Değeri ve
      max(Toplam Varlıklar, Piyasa Değeri) payda kuralları.
    - Tampon Bölge (Tolerance Band) ve Hoşgörü Süresi (Grace Period) Durum Makinesi.
    - Muhasebe denkliği ve İhtiyatlılık İlkesi (EC-02) entegrasyonu.
    - Sıfır hasılat (EC-06) DivisionByZero koruması.
    """

    @staticmethod
    def resolve_standard(
        standard: Union[str, ScreeningStandardConfig],
    ) -> ScreeningStandardConfig:
        if isinstance(standard, ScreeningStandardConfig):
            return standard
        if isinstance(standard, str):
            return get_standard_config(standard)
        raise TypeError(f"Unsupported standard type: {type(standard).__name__}")

    @classmethod
    def evaluate(
        cls,
        financials: FinancialScreeningInput,
        valuation: MarketValuationInput,
        standard: Union[str, ScreeningStandardConfig] = BIST_KATILIM_DIB_STANDARD,
        sector_input: Optional[SectorActivityInput] = None,
        prior_state: Optional[PriorScreeningState] = None,
    ) -> ScreeningEvaluationResult:
        """Şirketin finansal verilerini ve piyasa değerini seçilen katılım standardına göre denetler."""
        std = cls.resolve_standard(standard)
        sec_in = sector_input or SectorActivityInput()
        prior = prior_state or PriorScreeningState()

        # 1. Faaliyet Alanı (Sektör) Filtresi
        is_sector_ok, violations = SectorFilter.evaluate(sec_in, std)

        # 2. Payda (Denominator) Çözümlemesi (Spot / 12-24M MA / Max(MCAP, Assets))
        debt_denominator = RatioCalculator.resolve_denominator(
            rule=std.debt_denominator_rule,
            financials=financials,
            valuation=valuation,
            moving_avg_months=std.mcap_moving_avg_months,
        )
        cash_denominator = RatioCalculator.resolve_denominator(
            rule=std.cash_denominator_rule,
            financials=financials,
            valuation=valuation,
            moving_avg_months=std.mcap_moving_avg_months,
        )

        # 3. Finansal Oran (Rasyo) Hesaplamaları
        debt_eval = RatioCalculator.evaluate_balance_sheet_ratio(
            numerator=financials.interest_bearing_debt,
            denominator=debt_denominator,
            threshold=std.max_interest_debt_ratio,
            tolerance_band_bps=std.tolerance_band_bps,
            strict_less_than=std.strict_less_than,
        )

        cash_eval = RatioCalculator.evaluate_balance_sheet_ratio(
            numerator=financials.interest_bearing_cash_and_securities,
            denominator=cash_denominator,
            threshold=std.max_interest_cash_ratio,
            tolerance_band_bps=std.tolerance_band_bps,
            strict_less_than=std.strict_less_than,
        )

        income_eval = RatioCalculator.evaluate_income_ratio(
            impure_income_ttm=financials.impure_income_ttm,
            total_revenue_ttm=financials.total_revenue_ttm,
            threshold=std.max_impure_income_ratio,
            strict_less_than=std.strict_less_than,
        )

        # 4. Tampon Bölge ve Hoşgörü Süresi (Grace Period FSM) Durum Geçişi
        overall_status, breach_quarters, in_grace, audit_notes = (
            GracePeriodStateMachine.transition(
                is_sector_compliant=is_sector_ok,
                debt_eval=debt_eval,
                cash_eval=cash_eval,
                income_eval=income_eval,
                standard=std,
                prior_state=prior,
            )
        )

        if financials.used_conservative_fallback:
            audit_notes.append(
                "UNCLASSIFIED_CONSERVATIVE_FALLBACK: Unclassified cash/debt footnote gap included as interest-bearing."
            )

        # 5. Hisse Başı Arındırma ve Zekat Metrikleri
        purif_per_share, purif_div_ratio, zatable_per_share = (
            RatioCalculator.compute_per_share_metrics(financials, income_eval)
        )

        return ScreeningEvaluationResult(
            ticker=financials.ticker,
            fiscal_period=financials.fiscal_period,
            standard_code=std.code,
            overall_status=overall_status,
            is_sector_compliant=is_sector_ok,
            prohibited_activities_found=violations,
            debt_evaluation=debt_eval,
            cash_evaluation=cash_eval,
            income_evaluation=income_eval,
            denominator_value_used_for_debt=debt_denominator,
            denominator_value_used_for_cash=cash_denominator,
            consecutive_breach_quarters=breach_quarters,
            is_in_grace_period=in_grace,
            used_conservative_fallback=financials.used_conservative_fallback,
            purification_per_share_quarter=purif_per_share,
            purification_ratio_dividend=purif_div_ratio,
            zatable_net_assets_per_share=zatable_per_share,
            audit_notes=audit_notes,
        )

    @classmethod
    def evaluate_multi_standard(
        cls,
        financials: FinancialScreeningInput,
        valuation: MarketValuationInput,
        standards: Optional[Sequence[Union[str, ScreeningStandardConfig]]] = None,
        sector_input: Optional[SectorActivityInput] = None,
        prior_states_by_standard: Optional[Dict[str, PriorScreeningState]] = None,
    ) -> Dict[str, ScreeningEvaluationResult]:
        """Şirketi birden fazla katılım standardına (varsayılan: BIST Katılım ve AAOIFI) göre aynı anda tarar."""
        target_standards = standards or (
            BIST_KATILIM_DIB_STANDARD,
            AAOIFI_STD_21_STANDARD,
        )
        results: Dict[str, ScreeningEvaluationResult] = {}
        for std_item in target_standards:
            std_cfg = cls.resolve_standard(std_item)
            prior = (
                prior_states_by_standard.get(std_cfg.code)
                if prior_states_by_standard
                else None
            )
            results[std_cfg.code] = cls.evaluate(
                financials=financials,
                valuation=valuation,
                standard=std_cfg,
                sector_input=sector_input,
                prior_state=prior,
            )
        return results

    @classmethod
    def evaluate_with_footnotes(
        cls,
        ticker: str,
        fiscal_period: str,
        total_assets: Decimal,
        total_shares_outstanding: Decimal,
        cash_breakdown: CashFootnoteBreakdown,
        investments_breakdown: Optional[FinancialInvestmentsBreakdown],
        borrowings_breakdown: BorrowingsFootnoteBreakdown,
        impure_income_ttm: Decimal,
        total_revenue_ttm: Decimal,
        valuation: MarketValuationInput,
        impure_income_isolated_quarter: Decimal = ZERO,
        zatable_current_assets: Decimal = ZERO,
        current_liabilities: Decimal = ZERO,
        standard: Union[str, ScreeningStandardConfig] = BIST_KATILIM_DIB_STANDARD,
        sector_input: Optional[SectorActivityInput] = None,
        prior_state: Optional[PriorScreeningState] = None,
    ) -> ScreeningEvaluationResult:
        """Dipnot kırılımlarını muhasebe denkliği ve İhtiyatlılık İlkesi (EC-02) ile doğrulayıp tarama yapar."""
        verified = AccountingIdentityValidator.verify_and_classify(
            cash=cash_breakdown,
            investments=investments_breakdown,
            borrowings=borrowings_breakdown,
        )

        fin_input = FinancialScreeningInput(
            ticker=ticker,
            fiscal_period=fiscal_period,
            total_assets=total_assets,
            total_shares_outstanding=total_shares_outstanding,
            interest_bearing_debt=verified.interest_bearing_debt_total,
            interest_bearing_cash_and_securities=verified.interest_bearing_cash_and_investments_total,
            impure_income_ttm=impure_income_ttm,
            total_revenue_ttm=total_revenue_ttm,
            impure_income_isolated_quarter=impure_income_isolated_quarter,
            zatable_current_assets=zatable_current_assets,
            current_liabilities=current_liabilities,
            used_conservative_fallback=verified.used_conservative_fallback,
        )

        return cls.evaluate(
            financials=fin_input,
            valuation=valuation,
            standard=standard,
            sector_input=sector_input,
            prior_state=prior_state,
        )
