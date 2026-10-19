import uuid
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List, Dict, Any

from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    SmallInteger,
    Date,
    DateTime,
    Numeric,
    ForeignKey,
    UniqueConstraint,
    Index,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.infrastructure.database.session import Base


class ScreeningStandard(Base):
    """Katılım Uygunluk Standartları ve Eşikleri (BIST Katılım DİB / TKBB & AAOIFI Std 21)."""

    __tablename__ = "screening_standards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(32), unique=True, nullable=False, index=True)
    name = Column(String(128), nullable=False)

    max_interest_debt_ratio = Column(Numeric(12, 8), nullable=False)  # 0.33000000 or 0.30000000
    max_interest_cash_ratio = Column(Numeric(12, 8), nullable=False)  # 0.33000000 or 0.30000000
    max_impure_income_ratio = Column(Numeric(12, 8), nullable=False)  # 0.05000000 (5%)

    debt_denominator_rule = Column(String(32), nullable=False, default="MAX_OF_MCAP_OR_ASSETS")
    cash_denominator_rule = Column(String(32), nullable=False, default="MAX_OF_MCAP_OR_ASSETS")
    mcap_moving_avg_months = Column(SmallInteger, nullable=False, default=0)  # 0, 12, 24, 36
    tolerance_band_bps = Column(Integer, nullable=False, default=150)  # 150 bps = 1.5%
    grace_period_quarters = Column(SmallInteger, nullable=False, default=2)  # 2 çeyrek hoşgörü
    exclude_defense_sector = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    sector_assessments = relationship("CompanySectorAssessment", back_populates="standard")
    screening_results = relationship("ScreeningResult", back_populates="standard")
    portfolios = relationship("Portfolio", back_populates="preferred_standard")


class Company(Base):
    """BIST Şirket Ana Kartı."""

    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticker = Column(String(16), unique=True, nullable=False, index=True)  # Örn: THYAO, BIMAS
    company_name = Column(String(255), nullable=False)
    kap_member_id = Column(String(64), unique=True, nullable=True)
    sector_code = Column(String(64), nullable=False, index=True)
    sub_sector_code = Column(String(64), nullable=False)

    is_financial_institution = Column(Boolean, nullable=False, default=False)
    is_participation_institution = Column(Boolean, nullable=False, default=False)
    incorporation_articles_compliant = Column(Boolean, nullable=False, default=True)
    is_active = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    sector_assessments = relationship("CompanySectorAssessment", back_populates="company", cascade="all, delete-orphan")
    financial_statements = relationship("FinancialStatement", back_populates="company", cascade="all, delete-orphan")
    market_valuations = relationship("MarketValuation", back_populates="company", cascade="all, delete-orphan")
    screening_results = relationship("ScreeningResult", back_populates="company", cascade="all, delete-orphan")
    dividend_distributions = relationship("DividendDistribution", back_populates="company", cascade="all, delete-orphan")
    candles = relationship("OHLCVCandle", back_populates="company", cascade="all, delete-orphan")
    smc_signals = relationship("SMCSignal", back_populates="company", cascade="all, delete-orphan")


class CompanySectorAssessment(Base):
    """Faaliyet Alanı ve Sektör Uygunluk Denetimi."""

    __tablename__ = "company_sector_assessments"
    __table_args__ = (
        UniqueConstraint("company_id", "standard_id", "effective_date", name="uq_company_standard_assessment_date"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    standard_id = Column(UUID(as_uuid=True), ForeignKey("screening_standards.id"), nullable=False)
    effective_date = Column(Date, nullable=False)

    has_conventional_banking = Column(Boolean, nullable=False, default=False)
    has_conventional_insurance = Column(Boolean, nullable=False, default=False)
    has_alcohol_production_or_trade = Column(Boolean, nullable=False, default=False)
    has_tobacco = Column(Boolean, nullable=False, default=False)
    has_gambling_or_betting = Column(Boolean, nullable=False, default=False)
    has_pork_products = Column(Boolean, nullable=False, default=False)
    has_weapons_or_defense = Column(Boolean, nullable=False, default=False)
    has_adult_entertainment_or_media = Column(Boolean, nullable=False, default=False)

    sector_status = Column(String(32), nullable=False)  # 'COMPLIANT', 'NON_COMPLIANT'
    auditor_notes = Column(Text, nullable=True)

    company = relationship("Company", back_populates="sector_assessments")
    standard = relationship("ScreeningStandard", back_populates="sector_assessments")


class FinancialStatement(Base):
    """Ana Bilanço ve Gelir Tablosu Kalemleri."""

    __tablename__ = "financial_statements"
    __table_args__ = (
        UniqueConstraint("company_id", "fiscal_year", "fiscal_quarter", "is_consolidated", name="uq_financial_stmt_period"),
        Index("idx_fin_stmt_pub_date", "company_id", "publication_date"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    fiscal_year = Column(SmallInteger, nullable=False)
    fiscal_quarter = Column(SmallInteger, nullable=False)  # 1, 2, 3, 4
    period_start_date = Column(Date, nullable=False)
    period_end_date = Column(Date, nullable=False)
    publication_date = Column(DateTime(timezone=True), nullable=False)
    is_consolidated = Column(Boolean, nullable=False, default=True)
    reporting_currency = Column(String(3), nullable=False, default="TRY")
    total_shares_outstanding = Column(Numeric(20, 6), nullable=False)

    # Balance Sheet Totals (NUMERIC(24, 4))
    total_assets = Column(Numeric(24, 4), nullable=False)
    current_assets = Column(Numeric(24, 4), nullable=False)
    cash_and_cash_equivalents_total = Column(Numeric(24, 4), nullable=False)
    short_term_financial_investments_total = Column(Numeric(24, 4), nullable=False)
    long_term_financial_investments_total = Column(Numeric(24, 4), nullable=False)
    trade_receivables_current = Column(Numeric(24, 4), nullable=False)
    inventories = Column(Numeric(24, 4), nullable=False)
    current_liabilities = Column(Numeric(24, 4), nullable=False)
    short_term_borrowings_total = Column(Numeric(24, 4), nullable=False)
    long_term_borrowings_total = Column(Numeric(24, 4), nullable=False)
    lease_liabilities_total = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))
    total_equity = Column(Numeric(24, 4), nullable=False)

    # Income Statement Totals (NUMERIC(24, 4))
    revenue_cumulative = Column(Numeric(24, 4), nullable=False)
    revenue_isolated_quarter = Column(Numeric(24, 4), nullable=False)
    revenue_ttm = Column(Numeric(24, 4), nullable=False)
    net_income_cumulative = Column(Numeric(24, 4), nullable=False)
    net_income_isolated_quarter = Column(Numeric(24, 4), nullable=False)
    net_income_ttm = Column(Numeric(24, 4), nullable=False)

    # Relationships
    company = relationship("Company", back_populates="financial_statements")
    footnotes = relationship("FinancialStatementFootnotes", back_populates="financial_statement", uselist=False, cascade="all, delete-orphan")
    screening_results = relationship("ScreeningResult", back_populates="financial_statement")


class FinancialStatementFootnotes(Base):
    """MODÜL B: Bilanço ve Gelir Tablosu Dipnot Ayrıştırma Tablosu."""

    __tablename__ = "financial_statement_footnotes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    financial_statement_id = Column(UUID(as_uuid=True), ForeignKey("financial_statements.id", ondelete="CASCADE"), unique=True, nullable=False)

    # 1. Nakit ve Nakit Benzerleri Dipnot Kırılımı
    cash_on_hand = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))
    demand_deposits_banks = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))
    participation_accounts = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))
    time_deposits_interest = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))  # Faizli Vadeli
    reverse_repo_receivables = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))
    money_market_funds_interest = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))
    other_cash_unclassified = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))  # İhtiyatlılık payı

    # 2. Finansal Yatırımlar Dipnot Kırılımı
    sukuk_and_lease_certificates = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))
    compliant_equity_investments = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))
    government_bonds_and_tbills = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))
    corporate_bonds_interest = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))
    derivative_assets_speculative = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))

    # 3. Finansal Borçlar Dipnot Kırılımı
    participation_bank_financings = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))
    sukuk_issued_liabilities = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))
    operational_lease_tfrs16 = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))
    conventional_bank_loans = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))
    issued_bonds_and_bills_debt = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))
    factoring_and_financial_lease_debt = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))

    # 4. Gelir Tablosu Dipnot Kırılımı
    interest_income_quarter = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))
    interest_income_ttm = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))
    participation_profit_share_income_quarter = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))
    participation_profit_share_income_ttm = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))
    fx_gain_operating_quarter = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))
    fx_gain_interest_bearing_quarter = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))
    non_compliant_side_income_quarter = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))
    non_compliant_side_income_ttm = Column(Numeric(24, 4), nullable=False, default=Decimal("0.0000"))

    # 5. Denetim & Doğrulama Meta Verileri
    cash_footnote_refs = Column(JSONB, nullable=False, default=dict)
    debt_footnote_refs = Column(JSONB, nullable=False, default=dict)
    income_footnote_refs = Column(JSONB, nullable=False, default=dict)
    is_accounting_identity_verified = Column(Boolean, nullable=False, default=False)
    used_conservative_fallback = Column(Boolean, nullable=False, default=False)
    extraction_method = Column(String(32), nullable=False, default="KAP_XBRL_STRUCTURED")

    financial_statement = relationship("FinancialStatement", back_populates="footnotes")


class MarketValuation(Base):
    """Piyasa Değeri ve Hareketli Ortalama Serisi."""

    __tablename__ = "market_valuations"

    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), primary_key=True)
    valuation_date = Column(Date, primary_key=True)

    close_price = Column(Numeric(18, 6), nullable=False)
    shares_outstanding = Column(Numeric(20, 6), nullable=False)
    spot_market_cap = Column(Numeric(24, 4), nullable=False)
    mcap_ma_12m = Column(Numeric(24, 4), nullable=True)
    mcap_ma_24m = Column(Numeric(24, 4), nullable=True)
    mcap_ma_36m = Column(Numeric(24, 4), nullable=True)

    company = relationship("Company", back_populates="market_valuations")


class ScreeningResult(Base):
    """Şirket Katılım Tarama ve Uygunluk Çıktıları."""

    __tablename__ = "screening_results"
    __table_args__ = (
        Index("idx_screening_lookup", "company_id", "standard_id", "valuation_date"),
        Index("idx_screening_status_pool", "standard_id", "overall_status"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    financial_statement_id = Column(UUID(as_uuid=True), ForeignKey("financial_statements.id"), nullable=False)
    standard_id = Column(UUID(as_uuid=True), ForeignKey("screening_standards.id"), nullable=False)
    valuation_date = Column(Date, nullable=False)

    denominator_value_used = Column(Numeric(24, 4), nullable=False)

    interest_debt_numerator = Column(Numeric(24, 4), nullable=False)
    interest_debt_ratio = Column(Numeric(12, 8), nullable=False)
    is_debt_ratio_compliant = Column(Boolean, nullable=False)

    interest_cash_numerator = Column(Numeric(24, 4), nullable=False)
    interest_cash_ratio = Column(Numeric(12, 8), nullable=False)
    is_cash_ratio_compliant = Column(Boolean, nullable=False)

    impure_income_numerator = Column(Numeric(24, 4), nullable=False)
    total_revenue_denominator = Column(Numeric(24, 4), nullable=False)
    impure_income_ratio = Column(Numeric(12, 8), nullable=False)
    is_impure_income_compliant = Column(Boolean, nullable=False)

    is_sector_compliant = Column(Boolean, nullable=False)
    overall_status = Column(String(32), nullable=False)  # 'COMPLIANT', 'GRACE_PERIOD_TOLERANCE', 'NON_COMPLIANT'
    consecutive_breach_quarters = Column(SmallInteger, nullable=False, default=0)

    purification_per_share_quarter = Column(Numeric(18, 8), nullable=False, default=Decimal("0.00000000"))
    purification_ratio_dividend = Column(Numeric(12, 8), nullable=False, default=Decimal("0.00000000"))
    zatable_net_assets_per_share = Column(Numeric(18, 8), nullable=False, default=Decimal("0.00000000"))

    calculated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    company = relationship("Company", back_populates="screening_results")
    financial_statement = relationship("FinancialStatement", back_populates="screening_results")
    standard = relationship("ScreeningStandard", back_populates="screening_results")
    smc_signals = relationship("SMCSignal", back_populates="screening_result")
    purification_records = relationship("PurificationRecord", back_populates="screening_result")


class Portfolio(Base):
    """Kullanıcı Portföyü."""

    __tablename__ = "portfolios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    preferred_standard_id = Column(UUID(as_uuid=True), ForeignKey("screening_standards.id"), nullable=False)
    default_investment_intent = Column(String(32), nullable=False, default="TRADING_SHORT_TERM")  # or 'LONG_TERM_DIVIDEND'

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    preferred_standard = relationship("ScreeningStandard", back_populates="portfolios")
    transactions = relationship("PortfolioTransaction", back_populates="portfolio", cascade="all, delete-orphan")
    purification_records = relationship("PurificationRecord", back_populates="portfolio", cascade="all, delete-orphan")
    zakat_calculations = relationship("ZakatCalculation", back_populates="portfolio", cascade="all, delete-orphan")


class PortfolioTransaction(Base):
    """Portföy Alım-Satım ve Bedelsiz/Bölünme İşlemleri (FIFO Defteri)."""

    __tablename__ = "portfolio_transactions"
    __table_args__ = (
        Index("idx_txn_portfolio_company_date", "portfolio_id", "company_id", "transaction_date"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)

    transaction_type = Column(String(16), nullable=False)  # 'BUY', 'SELL', 'BONUS_ISSUE'
    transaction_date = Column(Date, nullable=False)
    quantity_lots = Column(Numeric(20, 6), nullable=False)
    unit_price = Column(Numeric(18, 6), nullable=False)
    investment_intent_override = Column(String(32), nullable=True)  # 'TRADING_SHORT_TERM' / 'LONG_TERM_DIVIDEND'

    portfolio = relationship("Portfolio", back_populates="transactions")
    company = relationship("Company")


class DividendDistribution(Base):
    """Şirket Temettü Dağıtımları."""

    __tablename__ = "dividend_distributions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    ex_dividend_date = Column(Date, nullable=False, index=True)
    source_fiscal_year = Column(SmallInteger, nullable=False)
    gross_dividend_per_share = Column(Numeric(18, 6), nullable=False)
    net_dividend_per_share = Column(Numeric(18, 6), nullable=False)

    company = relationship("Company", back_populates="dividend_distributions")


class PurificationRecord(Base):
    """Yatırımcı Portföy Arındırma Kayıtları."""

    __tablename__ = "purification_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    screening_result_id = Column(UUID(as_uuid=True), ForeignKey("screening_results.id"), nullable=False)

    method = Column(String(32), nullable=False)  # 'HOLDING_PERIOD_PRO_RATA', 'DIVIDEND_BASED'
    period_days = Column(SmallInteger, nullable=False)
    weighted_held_days = Column(Numeric(10, 4), nullable=False)
    effective_quantity_lots = Column(Numeric(20, 6), nullable=False)
    calculated_purification_amount = Column(Numeric(24, 4), nullable=False)
    is_donated = Column(Boolean, nullable=False, default=False)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    portfolio = relationship("Portfolio", back_populates="purification_records")
    company = relationship("Company")
    screening_result = relationship("ScreeningResult", back_populates="purification_records")


class ZakatCalculation(Base):
    """Yatırımcı Portföy Zekat Raporu ve Hesaplamaları."""

    __tablename__ = "zakat_calculations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    zakat_valuation_date = Column(Date, nullable=False)
    calendar_basis = Column(String(16), nullable=False, default="HIJRI_354")  # 'HIJRI_354' or 'GREGORIAN_365'

    gold_85g_nisab_try = Column(Numeric(24, 4), nullable=False)
    total_trading_intent_value = Column(Numeric(24, 4), nullable=False)
    total_long_term_zatable_value = Column(Numeric(24, 4), nullable=False)
    total_zakat_due = Column(Numeric(24, 4), nullable=False)
    breakdown_json = Column(JSONB, nullable=False, default=dict)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    portfolio = relationship("Portfolio", back_populates="zakat_calculations")


class OHLCVCandle(Base):
    """Zaman Serisi Fiyat Mumları (TimescaleDB Hypertable)."""

    __tablename__ = "ohlcv_candles"

    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), primary_key=True)
    timeframe = Column(String(8), primary_key=True)  # '15m', '1h', '4h', '1d', '1w'
    bucket_time = Column(DateTime(timezone=True), primary_key=True)

    open = Column(Numeric(18, 6), nullable=False)
    high = Column(Numeric(18, 6), nullable=False)
    low = Column(Numeric(18, 6), nullable=False)
    close = Column(Numeric(18, 6), nullable=False)
    volume = Column(Numeric(24, 4), nullable=False)

    company = relationship("Company", back_populates="candles")


class SMCSignal(Base):
    """Katılım Onaylı Hisseler İçin Price Action / SMC Sinyalleri."""

    __tablename__ = "smc_signals"
    __table_args__ = (
        Index("idx_smc_ticker_timeframe", "company_id", "timeframe", "signal_timestamp"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    screening_result_id = Column(UUID(as_uuid=True), ForeignKey("screening_results.id"), nullable=False)  # ZORUNLU FK!

    timeframe = Column(String(8), nullable=False)
    signal_type = Column(String(32), nullable=False)  # 'BULLISH_FVG', 'BULLISH_BOS', 'BULLISH_CHOCH', 'SSL_LIQUIDITY_SWEEP'
    signal_timestamp = Column(DateTime(timezone=True), nullable=False)

    zone_upper_bound = Column(Numeric(18, 6), nullable=False)
    zone_lower_bound = Column(Numeric(18, 6), nullable=False)
    reference_swing_price = Column(Numeric(18, 6), nullable=True)

    is_mitigated = Column(Boolean, nullable=False, default=False)
    mitigated_at = Column(DateTime(timezone=True), nullable=True)
    metadata_json = Column(JSONB, nullable=False, default=dict)

    company = relationship("Company", back_populates="smc_signals")
    screening_result = relationship("ScreeningResult", back_populates="smc_signals")
