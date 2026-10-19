from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Sequence

from app.domain.purification_zakat.entities import (
    ZAKAT_RATE_GREGORIAN,
    ZAKAT_RATE_HIJRI,
    CalendarBasis,
    InvestmentIntent,
    ZakatPortfolioReport,
    ZakatPositionBreakdown,
    ZakatPositionInput,
)
from app.domain.value_objects.money import (
    ZERO,
    quantize_amount,
    quantize_purification_currence,
    quantize_ratio,
    strict_decimal,
)


class ZakatCalculator:
    """Hisse Zekatı Hesaplayıcı (Al-Sat Ticari Emtia %2.5 vs. Uzun Vadeli Zekata Tabi Dönen Varlıklar %2.5).

    EC-04 Kuralı: Uzun vadeli yatırımda şirketin Kısa Vadeli Yükümlülükleri, Zekata Tabi Dönen
    Varlıklarından fazlaysa (A_zatable < 0), zekat matrahı 0.0000 kabul edilir; diğer hisselerin
    matrahından mahsup edilmez.
    """

    @staticmethod
    def resolve_zakat_rate(calendar_basis: CalendarBasis) -> Decimal:
        if calendar_basis == CalendarBasis.HIJRI_354:
            return ZAKAT_RATE_HIJRI
        if calendar_basis == CalendarBasis.GREGORIAN_365:
            return ZAKAT_RATE_GREGORIAN
        raise ValueError(f"Unsupported calendar_basis: {calendar_basis}")

    @classmethod
    def evaluate_position(
        cls,
        position: ZakatPositionInput,
        zakat_rate: Decimal,
    ) -> ZakatPositionBreakdown:
        rate = quantize_ratio(strict_decimal(zakat_rate))
        market_value = quantize_amount(
            position.quantity_lots * position.spot_unit_price,
            rounding=ROUND_HALF_UP,
        )

        gross_zatable_assets = (
            position.cash_and_equivalents
            + position.short_term_financial_investments
            + position.trade_receivables_current
            + position.inventories
        )
        # EC-04: Negatif net dönen varlık sıfıra sabitlenir (max(0, net))
        net_zatable_company_assets = max(
            ZERO, gross_zatable_assets - position.current_liabilities
        )
        zatable_per_share = quantize_ratio(
            net_zatable_company_assets / position.total_shares_outstanding,
            rounding=ROUND_HALF_UP,
        )

        if position.investment_intent == InvestmentIntent.TRADING_SHORT_TERM:
            base_amount = market_value
        elif position.investment_intent == InvestmentIntent.LONG_TERM_DIVIDEND:
            base_amount = quantize_amount(
                zatable_per_share * position.quantity_lots,
                rounding=ROUND_HALF_UP,
            )
        else:
            raise ValueError(f"Unsupported investment_intent: {position.investment_intent}")

        zakat_due = quantize_amount(base_amount * rate, rounding=ROUND_HALF_UP)

        return ZakatPositionBreakdown(
            ticker=position.ticker,
            investment_intent=position.investment_intent,
            quantity_lots=position.quantity_lots,
            market_value=market_value,
            zatable_net_assets_per_share=zatable_per_share,
            zatable_base_amount=base_amount,
            zakat_due=zakat_due,
        )

    @classmethod
    def calculate_portfolio_zakat(
        cls,
        positions: Sequence[ZakatPositionInput],
        valuation_date: date,
        gold_85g_nisab_try: Decimal = ZERO,
        other_zakatable_cash_try: Decimal = ZERO,
        calendar_basis: CalendarBasis = CalendarBasis.HIJRI_354,
        enforce_nisab: bool = True,
        payable_rounding: str = ROUND_HALF_UP,
    ) -> ZakatPortfolioReport:
        nisab = quantize_amount(strict_decimal(gold_85g_nisab_try))
        other_cash = quantize_amount(strict_decimal(other_zakatable_cash_try))
        if nisab < ZERO or other_cash < ZERO:
            raise ValueError("Nisab and other_zakatable_cash_try cannot be negative")

        rate = cls.resolve_zakat_rate(calendar_basis)
        breakdowns: List[ZakatPositionBreakdown] = []

        trading_base = ZERO
        trading_zakat = ZERO
        long_term_base = ZERO
        long_term_zakat = ZERO

        for pos in positions:
            bd = cls.evaluate_position(pos, rate)
            breakdowns.append(bd)
            if pos.investment_intent == InvestmentIntent.TRADING_SHORT_TERM:
                trading_base = quantize_amount(trading_base + bd.zatable_base_amount)
                trading_zakat = quantize_amount(trading_zakat + bd.zakat_due)
            else:
                long_term_base = quantize_amount(long_term_base + bd.zatable_base_amount)
                long_term_zakat = quantize_amount(long_term_zakat + bd.zakat_due)

        total_wealth = quantize_amount(trading_base + long_term_base + other_cash)
        is_above_nisab = total_wealth >= nisab

        other_cash_zakat = quantize_amount(other_cash * rate, rounding=ROUND_HALF_UP)
        raw_total_zakat = quantize_amount(
            trading_zakat + long_term_zakat + other_cash_zakat,
            rounding=ROUND_HALF_UP,
        )

        if enforce_nisab and not is_above_nisab:
            effective_raw = ZERO
            payable = quantize_purification_currence(ZERO, rounding=payable_rounding)
        else:
            effective_raw = raw_total_zakat
            payable = quantize_purification_currence(
                effective_raw, rounding=payable_rounding
            )

        return ZakatPortfolioReport(
            valuation_date=valuation_date,
            calendar_basis=calendar_basis,
            zakat_rate=rate,
            gold_85g_nisab_try=nisab,
            other_zakatable_cash_try=other_cash,
            trading_intent_total_base=trading_base,
            trading_intent_zakat=trading_zakat,
            long_term_intent_total_base=long_term_base,
            long_term_intent_zakat=long_term_zakat,
            total_zakatable_wealth=total_wealth,
            is_above_nisab=is_above_nisab,
            total_zakat_due_raw=effective_raw,
            total_zakat_payable=payable,
            positions=breakdowns,
        )
