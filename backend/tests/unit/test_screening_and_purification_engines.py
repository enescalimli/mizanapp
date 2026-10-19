from datetime import date
from decimal import Decimal, ROUND_CEILING, ROUND_HALF_UP
import pytest

from app.application.services.mcap_moving_average import (
    DailyPriceSharePoint,
    MarketCapMovingAverageService,
)
from app.domain.financial_parser import (
    AccountingIdentityValidator,
    BorrowingsFootnoteBreakdown,
    CashFootnoteBreakdown,
    CumulativeQuarterIncomeInput,
    ExtractionStatus,
    FinancialInvestmentsBreakdown,
    FootnoteExtractionConflictError,
    QuarterIsolator,
)
from app.domain.purification_zakat import (
    CalendarBasis,
    InvestmentIntent,
    PortfolioTransactionInput,
    PurificationEngine,
    TransactionType,
    ZakatPositionInput,
)
from app.domain.screening import (
    AAOIFI_STD_21_STANDARD,
    BIST_KATILIM_DIB_STANDARD,
    ComplianceStatus,
    DenominatorRule,
    FinancialScreeningInput,
    MarketValuationInput,
    PriorScreeningState,
    ScreeningEngine,
    SectorActivityInput,
    get_standard_config,
)


class TestScreeningEngine:
    """Modül A & B: Çoklu Standart Katılım Uygunluk Motoru ve Uç Durum Testleri."""

    def test_bist_vs_aaoifi_multi_standard_comparison(self) -> None:
        """%31.50 borç oranına sahip bir şirketin BIST Katılım (<%33) altında UYGUN,
        AAOIFI (<%30 + 150 bps tampon = %31.50 tavanı) altında UYGUN DEĞİL olduğunu doğrular.
        """
        fin = FinancialScreeningInput(
            ticker="ORNEK",
            fiscal_period="2026-Q2",
            total_assets=Decimal("100000000.0000"),
            total_shares_outstanding=Decimal("10000000.000000"),
            interest_bearing_debt=Decimal("31500000.0000"),  # %31.50
            interest_bearing_cash_and_securities=Decimal("12000000.0000"),  # %12.00
            impure_income_ttm=Decimal("1800000.0000"),  # %1.80
            total_revenue_ttm=Decimal("100000000.0000"),
            impure_income_isolated_quarter=Decimal("450000.0000"),
            zatable_current_assets=Decimal("40000000.0000"),
            current_liabilities=Decimal("25000000.0000"),
        )
        val = MarketValuationInput(
            spot_market_cap=Decimal("100000000.0000"),
            mcap_ma_24m=Decimal("100000000.0000"),
        )

        results = ScreeningEngine.evaluate_multi_standard(financials=fin, valuation=val)

        bist_res = results["BIST_KATILIM_DIB"]
        aaoifi_res = results["AAOIFI_STD_21"]

        assert bist_res.overall_status == ComplianceStatus.COMPLIANT
        assert bist_res.debt_evaluation.ratio == Decimal("0.31500000")
        assert bist_res.debt_evaluation.is_strictly_compliant is True
        assert bist_res.is_in_grace_period is False

        # AAOIFI eşiği %30.00, 150 bps tolerans tavanı %31.50 (< 0.31500000 kuralı nedeniyle aşım)
        assert aaoifi_res.overall_status == ComplianceStatus.NON_COMPLIANT
        assert aaoifi_res.debt_evaluation.ratio == Decimal("0.31500000")
        assert aaoifi_res.debt_evaluation.is_strictly_compliant is False
        assert aaoifi_res.debt_evaluation.is_within_tolerance_band is False

    def test_ec01_market_cap_flash_crash_moving_average_and_grace_period_fsm(self) -> None:
        """EC-01: Piyasa değerinin ani çöküşünde:
        1) Spot MCAP kullanıldığında şirketin %34.00 borç oranıyla GRACE_PERIOD_TOLERANCE
           durumuna geçtiğini, 2 çeyrek korunduğunu ve 3. ardışık çeyrekte NON_COMPLIANT olduğunu;
        2) 24 Aylık Hareketli Ortalama Piyasa Değeri (MA_24M) kullanıldığında ise
           rasyonun %28.33'te kalarak doğrudan COMPLIANT çıktığını doğrular.
        """
        fin = FinancialScreeningInput(
            ticker="SANAYI",
            fiscal_period="2026-Q2",
            total_assets=Decimal("80000000.0000"),
            total_shares_outstanding=Decimal("50000000.000000"),
            interest_bearing_debt=Decimal("34000000.0000"),
            interest_bearing_cash_and_securities=Decimal("10000000.0000"),
            impure_income_ttm=Decimal("1000000.0000"),
            total_revenue_ttm=Decimal("100000000.0000"),
        )
        # Piyasa değeri çöküş öncesi 24M ortalaması 120M iken anlık (spot) 100M'a düştü
        val = MarketValuationInput(
            spot_market_cap=Decimal("100000000.0000"),
            mcap_ma_24m=Decimal("120000000.0000"),
        )

        # 1. Spot MCAP (34M / 100M = %34.00 -> %33.00 ile %34.50 tampon bölgesinde)
        # 1. Çeyrek İhlali -> GRACE_PERIOD_TOLERANCE (1/2)
        res_q1 = ScreeningEngine.evaluate(
            financials=fin,
            valuation=val,
            standard=BIST_KATILIM_DIB_STANDARD,
            prior_state=PriorScreeningState(
                previous_status=ComplianceStatus.COMPLIANT,
                consecutive_breach_quarters=0,
            ),
        )
        assert res_q1.overall_status == ComplianceStatus.GRACE_PERIOD_TOLERANCE
        assert res_q1.is_in_grace_period is True
        assert res_q1.consecutive_breach_quarters == 1
        assert res_q1.debt_evaluation.ratio == Decimal("0.34000000")

        # 2. Çeyrek Ardışık İhlal -> GRACE_PERIOD_TOLERANCE (2/2)
        res_q2 = ScreeningEngine.evaluate(
            financials=fin,
            valuation=val,
            standard=BIST_KATILIM_DIB_STANDARD,
            prior_state=PriorScreeningState(
                previous_status=res_q1.overall_status,
                consecutive_breach_quarters=res_q1.consecutive_breach_quarters,
            ),
        )
        assert res_q2.overall_status == ComplianceStatus.GRACE_PERIOD_TOLERANCE
        assert res_q2.is_in_grace_period is True
        assert res_q2.consecutive_breach_quarters == 2

        # 3. Çeyrek Ardışık İhlal -> Hoşgörü süresi (2 çeyrek) doldu -> NON_COMPLIANT
        res_q3 = ScreeningEngine.evaluate(
            financials=fin,
            valuation=val,
            standard=BIST_KATILIM_DIB_STANDARD,
            prior_state=PriorScreeningState(
                previous_status=res_q2.overall_status,
                consecutive_breach_quarters=res_q2.consecutive_breach_quarters,
            ),
        )
        assert res_q3.overall_status == ComplianceStatus.NON_COMPLIANT
        assert res_q3.is_in_grace_period is False
        assert res_q3.consecutive_breach_quarters == 3

        # 2. 24 Aylık Hareketli Ortalama Piyasa Değeri opsiyonu aktif edildiğinde (34M / 120M = %28.333333)
        bist_ma24_std = get_standard_config(
            "BIST_KATILIM_DIB",
            mcap_moving_avg_months=24,
        )
        res_ma24 = ScreeningEngine.evaluate(
            financials=fin,
            valuation=val,
            standard=bist_ma24_std,
        )
        assert res_ma24.overall_status == ComplianceStatus.COMPLIANT
        assert res_ma24.denominator_value_used_for_debt == Decimal("120000000.0000")
        assert res_ma24.debt_evaluation.ratio == Decimal("0.28333333")
        assert res_ma24.is_in_grace_period is False

    def test_borderline_impure_income_4_99_percent_vs_5_00_percent(self) -> None:
        """Sınırda kalan %4.99 (ve %4.999999) uygunsuz gelirin COMPLIANT olduğunu,
        tam %5.00 (0.05000000) olduğunda ise hoşgörü uygulanmaksızın NON_COMPLIANT olduğunu doğrular.
        """
        val = MarketValuationInput(spot_market_cap=Decimal("200000000.0000"))

        # %4.99 uygunsuz gelir (4,990,000 / 100,000,000 = 0.04990000 < 0.05000000)
        fin_499 = FinancialScreeningInput(
            ticker="SINIR499",
            fiscal_period="2026-Q2",
            total_assets=Decimal("200000000.0000"),
            total_shares_outstanding=Decimal("10000000.000000"),
            interest_bearing_debt=Decimal("10000000.0000"),
            interest_bearing_cash_and_securities=Decimal("5000000.0000"),
            impure_income_ttm=Decimal("4990000.0000"),
            total_revenue_ttm=Decimal("100000000.0000"),
        )
        res_499 = ScreeningEngine.evaluate(financials=fin_499, valuation=val)
        assert res_499.income_evaluation.ratio == Decimal("0.04990000")
        assert res_499.income_evaluation.is_strictly_compliant is True
        assert res_499.overall_status == ComplianceStatus.COMPLIANT

        # %4.999999 uygunsuz gelir (baz puanın yüzde biriyle sınırın altında)
        fin_4999999 = FinancialScreeningInput(
            ticker="SINIR_HASSAS",
            fiscal_period="2026-Q2",
            total_assets=Decimal("200000000.0000"),
            total_shares_outstanding=Decimal("10000000.000000"),
            interest_bearing_debt=Decimal("10000000.0000"),
            interest_bearing_cash_and_securities=Decimal("5000000.0000"),
            impure_income_ttm=Decimal("4999999.0000"),
            total_revenue_ttm=Decimal("100000000.0000"),
        )
        res_4999999 = ScreeningEngine.evaluate(financials=fin_4999999, valuation=val)
        assert res_4999999.income_evaluation.ratio == Decimal("0.04999999")
        assert res_4999999.overall_status == ComplianceStatus.COMPLIANT

        # Tam %5.00 uygunsuz gelir -> Kesin kırmızı çizgi (< %5 şartı ihlal edildi, Grace Period yok!)
        fin_500 = FinancialScreeningInput(
            ticker="SINIR500",
            fiscal_period="2026-Q2",
            total_assets=Decimal("200000000.0000"),
            total_shares_outstanding=Decimal("10000000.000000"),
            interest_bearing_debt=Decimal("10000000.0000"),
            interest_bearing_cash_and_securities=Decimal("5000000.0000"),
            impure_income_ttm=Decimal("5000000.0000"),
            total_revenue_ttm=Decimal("100000000.0000"),
        )
        res_500 = ScreeningEngine.evaluate(financials=fin_500, valuation=val)
        assert res_500.income_evaluation.ratio == Decimal("0.05000000")
        assert res_500.income_evaluation.is_strictly_compliant is False
        assert res_500.overall_status == ComplianceStatus.NON_COMPLIANT
        assert res_500.is_in_grace_period is False

    def test_ec02_footnote_unclassified_cash_prudence_principle_and_conflict(self) -> None:
        """EC-02: Ana bilançoda 500M TL Nakit varken dipnotta sadece 300M TL vadesiz mevduat
        açıklanmışsa, kalan 200M TL belirsiz farkın İhtiyatlılık İlkesi gereği %100 faizli varlık
        sayıldığını doğrular.
        """
        cash_fn = CashFootnoteBreakdown(
            balance_sheet_total=Decimal("500000000.0000"),
            cash_on_hand=Decimal("50000000.0000"),
            demand_deposits_banks=Decimal("150000000.0000"),
            participation_accounts=Decimal("100000000.0000"),
            time_deposits_interest=Decimal("0.0000"),
        )
        debt_fn = BorrowingsFootnoteBreakdown(
            balance_sheet_total=Decimal("100000000.0000"),
            participation_bank_financings=Decimal("60000000.0000"),
            conventional_bank_loans=Decimal("40000000.0000"),
        )
        val = MarketValuationInput(spot_market_cap=Decimal("1000000000.0000"))

        res = ScreeningEngine.evaluate_with_footnotes(
            ticker="DIPNOT_TEST",
            fiscal_period="2026-Q2",
            total_assets=Decimal("1000000000.0000"),
            total_shares_outstanding=Decimal("100000000.000000"),
            cash_breakdown=cash_fn,
            investments_breakdown=None,
            borrowings_breakdown=debt_fn,
            impure_income_ttm=Decimal("5000000.0000"),
            total_revenue_ttm=Decimal("500000000.0000"),
            valuation=val,
        )

        assert res.used_conservative_fallback is True
        # 200M açıklanmayan nakit faizli varlık payına eklendi -> 200M / 1000M = %20.00
        assert res.cash_evaluation.numerator == Decimal("200000000.0000")
        assert res.cash_evaluation.ratio == Decimal("0.20000000")
        # 60M katılım finansmanı borç payına eklenmedi, sadece 40M klasik kredi eklendi -> %4.00
        assert res.debt_evaluation.numerator == Decimal("40000000.0000")
        assert res.debt_evaluation.ratio == Decimal("0.04000000")
        assert res.overall_status == ComplianceStatus.COMPLIANT

        # Alt kalem toplamı ana bilanço kalemini aşarsa (Delta < 0) FootnoteExtractionConflictError fırlatılmalı
        conflicting_cash = CashFootnoteBreakdown(
            balance_sheet_total=Decimal("100000000.0000"),
            demand_deposits_banks=Decimal("120000000.0000"),
        )
        with pytest.raises(FootnoteExtractionConflictError, match="EXTRACTION_CONFLICT"):
            AccountingIdentityValidator.verify_and_classify(cash=conflicting_cash)

    def test_ec06_zero_revenue_company_division_by_zero_guard(self) -> None:
        """EC-06: Hasılatı 0 olan bir şirketin faiz geliri > 0 olduğunda DivisionByZero
        hatası vermeden oranı 1.00000000 (%100) atayıp NON_COMPLIANT işaretlediğini doğrular.
        """
        fin = FinancialScreeningInput(
            ticker="SIFIR_HASILAT",
            fiscal_period="2026-Q1",
            total_assets=Decimal("50000000.0000"),
            total_shares_outstanding=Decimal("1000000.000000"),
            interest_bearing_debt=Decimal("0.0000"),
            interest_bearing_cash_and_securities=Decimal("0.0000"),
            impure_income_ttm=Decimal("500000.0000"),
            total_revenue_ttm=Decimal("0.0000"),
        )
        val = MarketValuationInput(spot_market_cap=Decimal("50000000.0000"))

        res = ScreeningEngine.evaluate(financials=fin, valuation=val)
        assert res.income_evaluation.ratio == Decimal("1.00000000")
        assert res.income_evaluation.is_strictly_compliant is False
        assert res.overall_status == ComplianceStatus.NON_COMPLIANT

    def test_ec07_quarter_isolator_fx_reversal_floor(self) -> None:
        """EC-07: Kümülatif Q3 tablosunda kur farkı geri dönüşü nedeniyle kümülatif tutar Q2'nin
        altına düşse bile tekil çeyrek uygunsuz gelirinin negatif olamayacağını (max(0, diff)) doğrular.
        """
        q2_cum = CumulativeQuarterIncomeInput(
            fiscal_year=2026,
            fiscal_quarter=2,
            revenue_cumulative=Decimal("200000000.0000"),
            interest_income_cumulative=Decimal("10000000.0000"),
            fx_gain_interest_bearing_cumulative=Decimal("8000000.0000"),
        )
        q3_cum = CumulativeQuarterIncomeInput(
            fiscal_year=2026,
            fiscal_quarter=3,
            revenue_cumulative=Decimal("320000000.0000"),
            interest_income_cumulative=Decimal("14000000.0000"),
            fx_gain_interest_bearing_cumulative=Decimal("5000000.0000"),  # Q2'deki 8M'dan 5M'a düştü
        )

        isolated = QuarterIsolator.isolate_quarter(current=q3_cum, previous_quarter=q2_cum)
        assert isolated.used_fx_reversal_floor is True
        assert isolated.revenue_isolated_quarter == Decimal("120000000.0000")
        assert isolated.interest_income_isolated_quarter == Decimal("4000000.0000")
        assert isolated.fx_gain_interest_bearing_isolated_quarter == Decimal("0.0000")
        assert isolated.total_impure_income_isolated_quarter == Decimal("4000000.0000")

    def test_sector_filter_and_optional_defense_exclusion(self) -> None:
        """Yasaklı sektörlerin ve parametrik savunma sanayii filtresinin davranışını doğrular."""
        fin = FinancialScreeningInput(
            ticker="SAVUNMA",
            fiscal_period="2026-Q2",
            total_assets=Decimal("500000000.0000"),
            total_shares_outstanding=Decimal("100000000.000000"),
            interest_bearing_debt=Decimal("10000000.0000"),
            interest_bearing_cash_and_securities=Decimal("10000000.0000"),
            impure_income_ttm=Decimal("1000000.0000"),
            total_revenue_ttm=Decimal("200000000.0000"),
        )
        val = MarketValuationInput(spot_market_cap=Decimal("500000000.0000"))
        defense_sector = SectorActivityInput(has_weapons_or_defense=True)

        # Varsayılan BIST Katılım standardında savunma sanayii dışlanmaz -> COMPLIANT
        res_default = ScreeningEngine.evaluate(
            financials=fin,
            valuation=val,
            standard=BIST_KATILIM_DIB_STANDARD,
            sector_input=defense_sector,
        )
        assert res_default.overall_status == ComplianceStatus.COMPLIANT

        # exclude_defense_sector=True parametresi ile -> NON_COMPLIANT
        std_no_defense = get_standard_config("AAOIFI_STD_21", exclude_defense_sector=True)
        res_excluded = ScreeningEngine.evaluate(
            financials=fin,
            valuation=val,
            standard=std_no_defense,
            sector_input=defense_sector,
        )
        assert res_excluded.overall_status == ComplianceStatus.NON_COMPLIANT
        assert "WEAPONS_AND_DEFENSE_EXCLUDED_BY_STANDARD" in res_excluded.prohibited_activities_found


class TestPurificationAndZakatEngine:
    """Modül C: Kuruşu Kuruşuna Arındırma (Purification) ve Zekat Motoru Uç Durum Testleri."""

    def test_holding_purification_with_fractional_lots_and_ec03_loss_making_company(self) -> None:
        """Küsuratlı lotlar (1234.567890 lot) ve EC-03 (Net dönem zararı açıklayan şirketin
        pozitif faiz geliri) durumunda kuruşu kuruşuna arındırma hesabını doğrular.
        """
        res_half_up = PurificationEngine.calculate_holding_purification(
            ticker="ZARARDA_AMA_FAIZLI",
            fiscal_period="2026-Q2",
            impure_income_isolated_quarter=Decimal("15000000.0000"),
            total_shares_outstanding=Decimal("100000000.000000"),
            quantity_lots=Decimal("1234.567890"),  # Küsuratlı lot
            days_held=45,
            period_total_days=90,
            net_income_isolated_quarter=Decimal("-200000000.0000"),  # EC-03: Net zarar
            payable_rounding=ROUND_HALF_UP,
        )

        # P_share = 15,000,000 / 100,000,000 = 0.15000000 TL
        # Raw = 0.15 * 1234.567890 * (45 / 90) = 92.59259175 -> 92.5926 TL
        assert res_half_up.purification_per_share == Decimal("0.15000000")
        assert res_half_up.total_purification_raw == Decimal("92.5926")
        assert res_half_up.total_purification_payable == Decimal("92.59")

        # İhtiyatlılık yuvarlaması (ROUND_CEILING) seçildiğinde bir üst kuruşa (92.60) tamamlanır
        res_ceiling = PurificationEngine.calculate_holding_purification(
            ticker="ZARARDA_AMA_FAIZLI",
            fiscal_period="2026-Q2",
            impure_income_isolated_quarter=Decimal("15000000.0000"),
            total_shares_outstanding=Decimal("100000000.000000"),
            quantity_lots=Decimal("1234.567890"),
            days_held=45,
            period_total_days=90,
            net_income_isolated_quarter=Decimal("-200000000.0000"),
            payable_rounding=ROUND_CEILING,
        )
        assert res_ceiling.total_purification_payable == Decimal("92.60")

    def test_fifo_lot_matching_and_architecture_dto_example(self) -> None:
        """ARCHITECTURE.md Bölüm 4.5.2'deki BIMAS 91 günlük çeyrek ve 46 günlük ara alım-satım
        FIFO senaryosunu kuruşu kuruşuna doğrular.
        """
        txns = [
            # 1000 lot çeyrek öncesinde alındı ve dönem sonuna kadar tutuldu (91 gün)
            PortfolioTransactionInput(
                transaction_date=date(2026, 1, 15),
                transaction_type=TransactionType.BUY,
                quantity_lots=Decimal("1000.000000"),
            ),
            # 500 lot dönem ortasında alındı (1 Mayıs)
            PortfolioTransactionInput(
                transaction_date=date(2026, 5, 1),
                transaction_type=TransactionType.BUY,
                quantity_lots=Decimal("500.000000"),
            ),
        ]
        # Eğer sadece 1000 lot tam dönem (91 gün) ve 500 lot 1 Mayıs - 15 Haziran (46 gün) tutulsaydı:
        # FIFO'da ilk giren ilk çıkar kuralını doğrulamak için 15 Ocak'ta 1500 lot alıp 15 Haziran'da 500 satalım:
        fifo_txns = [
            PortfolioTransactionInput(
                transaction_date=date(2026, 1, 15),
                transaction_type=TransactionType.BUY,
                quantity_lots=Decimal("1000.000000"),
            ),
            PortfolioTransactionInput(
                transaction_date=date(2026, 5, 1),
                transaction_type=TransactionType.BUY,
                quantity_lots=Decimal("500.000000"),
            ),
            PortfolioTransactionInput(
                transaction_date=date(2026, 6, 15),
                transaction_type=TransactionType.SELL,
                quantity_lots=Decimal("400.000000"),
            ),
        ]

        res = PurificationEngine.calculate_fifo_holding_purification(
            ticker="BIMAS",
            fiscal_period="2026-Q2",
            period_start_date=date(2026, 4, 1),
            period_end_date=date(2026, 6, 30),
            impure_income_isolated_quarter=Decimal("38904900.0000"),
            total_shares_outstanding=Decimal("100000000.000000"),
            transactions=fifo_txns,
        )

        # FIFO Dilimleri:
        # 1) 15 Ocak alımından 15 Haziran'da satılan 400 lot -> 1 Nisan..15 Haziran = 76 gün
        # 2) 15 Ocak alımından kalan 600 lot -> 1 Nisan..30 Haziran = 91 gün
        # 3) 1 Mayıs alımından açık 500 lot -> 1 Mayıs..30 Haziran = 61 gün
        assert len(res.lot_slices) == 3
        assert res.lot_slices[0].quantity_lots == Decimal("400.000000")
        assert res.lot_slices[0].days_held_in_period == 76
        assert res.lot_slices[1].quantity_lots == Decimal("600.000000")
        assert res.lot_slices[1].days_held_in_period == 91
        assert res.lot_slices[2].quantity_lots == Decimal("500.000000")
        assert res.lot_slices[2].days_held_in_period == 61

    def test_ec05_mid_quarter_bonus_issue_stock_split_invariance(self) -> None:
        """EC-05: Dönem içinde %100 bedelsiz sermaye artırımı (BONUS_ISSUE) gerçekleştiğinde
        yatırımcının küsuratlı lotlarının bölünme çarpanıyla güncellendiğini doğrular.
        """
        txns = [
            PortfolioTransactionInput(
                transaction_date=date(2026, 4, 1),
                transaction_type=TransactionType.BUY,
                quantity_lots=Decimal("100.250000"),
            ),
            PortfolioTransactionInput(
                transaction_date=date(2026, 5, 15),
                transaction_type=TransactionType.BONUS_ISSUE,
                quantity_lots=Decimal("100.250000"),  # %100 bedelsiz -> toplam 200.500000 lot
            ),
        ]

        res = PurificationEngine.calculate_fifo_holding_purification(
            ticker="BEDELSIZ_AS",
            fiscal_period="2026-Q2",
            period_start_date=date(2026, 4, 1),
            period_end_date=date(2026, 6, 30),
            impure_income_isolated_quarter=Decimal("20000000.0000"),
            total_shares_outstanding=Decimal("200000000.000000"),  # Bölünme sonrası pay sayısı
            transactions=txns,
        )

        # Hisse başı uygunsuz gelir = 20M / 200M = 0.10 TL
        # Yatırımcının bölünme düzeltmeli lotu = 200.500000 lot (91/91 tam dönem)
        # Beklenen arındırma = 200.500000 * 0.10 = 20.0500 TL
        assert len(res.lot_slices) == 1
        assert res.lot_slices[0].quantity_lots == Decimal("200.500000")
        assert res.lot_slices[0].days_held_in_period == 91
        assert res.total_purification_raw == Decimal("20.0500")
        assert res.total_purification_payable == Decimal("20.05")

    def test_dividend_purification_exact_calculation(self) -> None:
        """Temettü bazlı arındırma formülünü (ARCHITECTURE.md Bölüm 4.5.2 örneği) doğrular."""
        div_res = PurificationEngine.calculate_dividend_purification(
            ticker="BIMAS",
            dividend_received=Decimal("10000.0000"),
            impure_income_total=Decimal("945000000.0000"),
            total_revenue=Decimal("412000000000.0000"),
            is_gross_basis=True,
        )
        assert div_res.impure_income_ratio == Decimal("0.00229369")
        assert div_res.purification_raw == Decimal("22.9369")
        assert div_res.purification_payable == Decimal("22.94")

    def test_zakat_trading_vs_long_term_and_ec04_negative_net_assets(self) -> None:
        """Al-Sat (%2.5 Piyasa Değeri) ve Uzun Vadeli Temettü (%2.5 Zekata Tabi Net Dönen Varlık)
        zekat hesaplamasını ve EC-04 (Negatif net dönen varlığın diğer hisselerden mahsup edilmemesi)
        kuralını doğrular.
        """
        positions = [
            # 1. Al-Sat Niyeti: 1000 lot * 450 TL = 450,000 TL Piyasa Değeri -> Zekat = 11,250 TL
            ZakatPositionInput(
                ticker="BIMAS",
                quantity_lots=Decimal("1000.000000"),
                spot_unit_price=Decimal("450.000000"),
                investment_intent=InvestmentIntent.TRADING_SHORT_TERM,
                total_shares_outstanding=Decimal("607200000.000000"),
            ),
            # 2. Uzun Vadeli Temettü Niyeti: Net zekata tabi dönen varlık = (5M + 10M + 5M) - 8M = 12M TL
            # Hisse başı zekata tabi varlık = 12M / 1M = 12.00 TL/pay
            # 10,000 lot * 12 TL = 120,000 TL matrah -> Zekat = 3,000 TL
            ZakatPositionInput(
                ticker="ASELS",
                quantity_lots=Decimal("10000.000000"),
                spot_unit_price=Decimal("65.000000"),
                investment_intent=InvestmentIntent.LONG_TERM_DIVIDEND,
                total_shares_outstanding=Decimal("1000000.000000"),
                cash_and_equivalents=Decimal("5000000.0000"),
                trade_receivables_current=Decimal("10000000.0000"),
                inventories=Decimal("5000000.0000"),
                current_liabilities=Decimal("8000000.0000"),
            ),
            # 3. EC-04: Kısa vadeli borçları dönen varlıklarından büyük olan uzun vadeli hisse
            # (50M - 80M = -30M < 0) -> Zekat matrahı 0.0000 olmalı, diğer hisseleri düşürmemeli!
            ZakatPositionInput(
                ticker="THYAO",
                quantity_lots=Decimal("5000.000000"),
                spot_unit_price=Decimal("300.000000"),
                investment_intent=InvestmentIntent.LONG_TERM_DIVIDEND,
                total_shares_outstanding=Decimal("1380000000.000000"),
                cash_and_equivalents=Decimal("20000000.0000"),
                trade_receivables_current=Decimal("20000000.0000"),
                inventories=Decimal("10000000.0000"),
                current_liabilities=Decimal("80000000.0000"),
            ),
        ]

        report = PurificationEngine.calculate_portfolio_zakat(
            positions=positions,
            valuation_date=date(2026, 10, 19),
            gold_85g_nisab_try=Decimal("255000.0000"),
            calendar_basis=CalendarBasis.HIJRI_354,
        )

        assert report.is_above_nisab is True
        assert report.trading_intent_total_base == Decimal("450000.0000")
        assert report.trading_intent_zakat == Decimal("11250.0000")
        assert report.long_term_intent_total_base == Decimal("120000.0000")
        assert report.long_term_intent_zakat == Decimal("3000.0000")
        assert report.positions[2].zatable_base_amount == Decimal("0.0000")
        assert report.positions[2].zakat_due == Decimal("0.0000")
        assert report.total_zakat_due_raw == Decimal("14250.0000")
        assert report.total_zakat_payable == Decimal("14250.00")

    def test_moving_average_service_and_zero_float_enforcement(self) -> None:
        """Hareketli ortalama piyasa değeri servisini ve motorların float girdiyi
        TypeError ile reddettiğini doğrular.
        """
        points = [
            DailyPriceSharePoint(
                valuation_date=date(2026, 10, 1),
                close_price=Decimal("100.000000"),
                shares_outstanding=Decimal("1000000.000000"),
            ),
            DailyPriceSharePoint(
                valuation_date=date(2026, 10, 2),
                close_price=Decimal("120.000000"),
                shares_outstanding=Decimal("1000000.000000"),
            ),
        ]
        val_input = MarketCapMovingAverageService.build_valuation_from_price_series(points)
        assert val_input.spot_market_cap == Decimal("120000000.0000")
        assert val_input.mcap_ma_12m == Decimal("110000000.0000")
        assert val_input.mcap_ma_24m == Decimal("110000000.0000")

        # Float girdi kesinlikle reddedilmeli (Kural 1: Zero-Float Policy)
        with pytest.raises(TypeError, match="Zero-Float Violation"):
            MarketValuationInput(spot_market_cap=100000.50)  # type: ignore[arg-type]

        with pytest.raises(TypeError, match="Zero-Float Violation"):
            PurificationEngine.calculate_dividend_purification(
                ticker="FLOAT_TEST",
                dividend_received=1000.0,  # type: ignore[arg-type]
                impure_income_total=Decimal("10.0000"),
                total_revenue=Decimal("1000.0000"),
            )
