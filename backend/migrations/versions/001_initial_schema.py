"""initial_katilim_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-19 02:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. screening_standards
    op.create_table(
        'screening_standards',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('code', sa.String(length=32), nullable=False, unique=True),
        sa.Column('name', sa.String(length=128), nullable=False),
        sa.Column('max_interest_debt_ratio', sa.Numeric(precision=12, scale=8), nullable=False),
        sa.Column('max_interest_cash_ratio', sa.Numeric(precision=12, scale=8), nullable=False),
        sa.Column('max_impure_income_ratio', sa.Numeric(precision=12, scale=8), nullable=False),
        sa.Column('debt_denominator_rule', sa.String(length=32), nullable=False),
        sa.Column('cash_denominator_rule', sa.String(length=32), nullable=False),
        sa.Column('mcap_moving_avg_months', sa.SmallInteger(), nullable=False, server_default='0'),
        sa.Column('tolerance_band_bps', sa.Integer(), nullable=False, server_default='150'),
        sa.Column('grace_period_quarters', sa.SmallInteger(), nullable=False, server_default='2'),
        sa.Column('exclude_defense_sector', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('idx_standards_code', 'screening_standards', ['code'])

    # 2. companies
    op.create_table(
        'companies',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('ticker', sa.String(length=16), nullable=False, unique=True),
        sa.Column('company_name', sa.String(length=255), nullable=False),
        sa.Column('kap_member_id', sa.String(length=64), nullable=True, unique=True),
        sa.Column('sector_code', sa.String(length=64), nullable=False),
        sa.Column('sub_sector_code', sa.String(length=64), nullable=False),
        sa.Column('is_financial_institution', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_participation_institution', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('incorporation_articles_compliant', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('idx_companies_ticker', 'companies', ['ticker'])
    op.create_index('idx_companies_sector', 'companies', ['sector_code'])

    # 3. company_sector_assessments
    op.create_table(
        'company_sector_assessments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('company_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('companies.id', ondelete='CASCADE'), nullable=False),
        sa.Column('standard_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('screening_standards.id'), nullable=False),
        sa.Column('effective_date', sa.Date(), nullable=False),
        sa.Column('has_conventional_banking', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('has_conventional_insurance', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('has_alcohol_production_or_trade', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('has_tobacco', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('has_gambling_or_betting', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('has_pork_products', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('has_weapons_or_defense', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('has_adult_entertainment_or_media', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('sector_status', sa.String(length=32), nullable=False),
        sa.Column('auditor_notes', sa.Text(), nullable=True),
        sa.UniqueConstraint('company_id', 'standard_id', 'effective_date', name='uq_company_standard_assessment_date'),
    )

    # 4. financial_statements
    op.create_table(
        'financial_statements',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('company_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('companies.id', ondelete='CASCADE'), nullable=False),
        sa.Column('fiscal_year', sa.SmallInteger(), nullable=False),
        sa.Column('fiscal_quarter', sa.SmallInteger(), nullable=False),
        sa.Column('period_start_date', sa.Date(), nullable=False),
        sa.Column('period_end_date', sa.Date(), nullable=False),
        sa.Column('publication_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_consolidated', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('reporting_currency', sa.String(length=3), nullable=False, server_default='TRY'),
        sa.Column('total_shares_outstanding', sa.Numeric(precision=20, scale=6), nullable=False),
        # Balance Sheet Totals
        sa.Column('total_assets', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('current_assets', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('cash_and_cash_equivalents_total', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('short_term_financial_investments_total', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('long_term_financial_investments_total', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('trade_receivables_current', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('inventories', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('current_liabilities', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('short_term_borrowings_total', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('long_term_borrowings_total', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('lease_liabilities_total', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        sa.Column('total_equity', sa.Numeric(precision=24, scale=4), nullable=False),
        # Income Statement Totals
        sa.Column('revenue_cumulative', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('revenue_isolated_quarter', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('revenue_ttm', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('net_income_cumulative', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('net_income_isolated_quarter', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('net_income_ttm', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.UniqueConstraint('company_id', 'fiscal_year', 'fiscal_quarter', 'is_consolidated', name='uq_financial_stmt_period'),
    )
    op.create_index('idx_fin_stmt_pub_date', 'financial_statements', ['company_id', 'publication_date'])

    # 5. financial_statement_footnotes
    op.create_table(
        'financial_statement_footnotes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('financial_statement_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('financial_statements.id', ondelete='CASCADE'), nullable=False, unique=True),
        # Cash breakdown
        sa.Column('cash_on_hand', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        sa.Column('demand_deposits_banks', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        sa.Column('participation_accounts', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        sa.Column('time_deposits_interest', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        sa.Column('reverse_repo_receivables', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        sa.Column('money_market_funds_interest', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        sa.Column('other_cash_unclassified', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        # Financial investments breakdown
        sa.Column('sukuk_and_lease_certificates', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        sa.Column('compliant_equity_investments', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        sa.Column('government_bonds_and_tbills', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        sa.Column('corporate_bonds_interest', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        sa.Column('derivative_assets_speculative', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        # Financial debts breakdown
        sa.Column('participation_bank_financings', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        sa.Column('sukuk_issued_liabilities', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        sa.Column('operational_lease_tfrs16', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        sa.Column('conventional_bank_loans', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        sa.Column('issued_bonds_and_bills_debt', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        sa.Column('factoring_and_financial_lease_debt', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        # Income breakdown
        sa.Column('interest_income_quarter', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        sa.Column('interest_income_ttm', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        sa.Column('participation_profit_share_income_quarter', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        sa.Column('participation_profit_share_income_ttm', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        sa.Column('fx_gain_operating_quarter', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        sa.Column('fx_gain_interest_bearing_quarter', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        sa.Column('non_compliant_side_income_quarter', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        sa.Column('non_compliant_side_income_ttm', sa.Numeric(precision=24, scale=4), nullable=False, server_default='0'),
        # Metadata
        sa.Column('cash_footnote_refs', postgresql.JSONB(), nullable=False, server_default='{}'),
        sa.Column('debt_footnote_refs', postgresql.JSONB(), nullable=False, server_default='{}'),
        sa.Column('income_footnote_refs', postgresql.JSONB(), nullable=False, server_default='{}'),
        sa.Column('is_accounting_identity_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('used_conservative_fallback', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('extraction_method', sa.String(length=32), nullable=False, server_default='KAP_XBRL_STRUCTURED'),
    )

    # 6. market_valuations
    op.create_table(
        'market_valuations',
        sa.Column('company_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('companies.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('valuation_date', sa.Date(), primary_key=True),
        sa.Column('close_price', sa.Numeric(precision=18, scale=6), nullable=False),
        sa.Column('shares_outstanding', sa.Numeric(precision=20, scale=6), nullable=False),
        sa.Column('spot_market_cap', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('mcap_ma_12m', sa.Numeric(precision=24, scale=4), nullable=True),
        sa.Column('mcap_ma_24m', sa.Numeric(precision=24, scale=4), nullable=True),
        sa.Column('mcap_ma_36m', sa.Numeric(precision=24, scale=4), nullable=True),
    )

    # 7. screening_results
    op.create_table(
        'screening_results',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('company_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('companies.id', ondelete='CASCADE'), nullable=False),
        sa.Column('financial_statement_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('financial_statements.id'), nullable=False),
        sa.Column('standard_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('screening_standards.id'), nullable=False),
        sa.Column('valuation_date', sa.Date(), nullable=False),
        sa.Column('denominator_value_used', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('interest_debt_numerator', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('interest_debt_ratio', sa.Numeric(precision=12, scale=8), nullable=False),
        sa.Column('is_debt_ratio_compliant', sa.Boolean(), nullable=False),
        sa.Column('interest_cash_numerator', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('interest_cash_ratio', sa.Numeric(precision=12, scale=8), nullable=False),
        sa.Column('is_cash_ratio_compliant', sa.Boolean(), nullable=False),
        sa.Column('impure_income_numerator', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('total_revenue_denominator', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('impure_income_ratio', sa.Numeric(precision=12, scale=8), nullable=False),
        sa.Column('is_impure_income_compliant', sa.Boolean(), nullable=False),
        sa.Column('is_sector_compliant', sa.Boolean(), nullable=False),
        sa.Column('overall_status', sa.String(length=32), nullable=False),
        sa.Column('consecutive_breach_quarters', sa.SmallInteger(), nullable=False, server_default='0'),
        sa.Column('purification_per_share_quarter', sa.Numeric(precision=18, scale=8), nullable=False, server_default='0'),
        sa.Column('purification_ratio_dividend', sa.Numeric(precision=12, scale=8), nullable=False, server_default='0'),
        sa.Column('zatable_net_assets_per_share', sa.Numeric(precision=18, scale=8), nullable=False, server_default='0'),
        sa.Column('calculated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('idx_screening_lookup', 'screening_results', ['company_id', 'standard_id', 'valuation_date'])
    op.create_index('idx_screening_status_pool', 'screening_results', ['standard_id', 'overall_status'])

    # 8. portfolios
    op.create_table(
        'portfolios',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=128), nullable=False),
        sa.Column('preferred_standard_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('screening_standards.id'), nullable=False),
        sa.Column('default_investment_intent', sa.String(length=32), nullable=False, server_default='TRADING_SHORT_TERM'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('idx_portfolios_user', 'portfolios', ['user_id'])

    # 9. portfolio_transactions
    op.create_table(
        'portfolio_transactions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('portfolio_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('portfolios.id', ondelete='CASCADE'), nullable=False),
        sa.Column('company_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('companies.id'), nullable=False),
        sa.Column('transaction_type', sa.String(length=16), nullable=False),
        sa.Column('transaction_date', sa.Date(), nullable=False),
        sa.Column('quantity_lots', sa.Numeric(precision=20, scale=6), nullable=False),
        sa.Column('unit_price', sa.Numeric(precision=18, scale=6), nullable=False),
        sa.Column('investment_intent_override', sa.String(length=32), nullable=True),
    )
    op.create_index('idx_txn_portfolio_company_date', 'portfolio_transactions', ['portfolio_id', 'company_id', 'transaction_date'])

    # 10. dividend_distributions
    op.create_table(
        'dividend_distributions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('company_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('companies.id', ondelete='CASCADE'), nullable=False),
        sa.Column('ex_dividend_date', sa.Date(), nullable=False),
        sa.Column('source_fiscal_year', sa.SmallInteger(), nullable=False),
        sa.Column('gross_dividend_per_share', sa.Numeric(precision=18, scale=6), nullable=False),
        sa.Column('net_dividend_per_share', sa.Numeric(precision=18, scale=6), nullable=False),
    )
    op.create_index('idx_dividends_company_date', 'dividend_distributions', ['company_id', 'ex_dividend_date'])

    # 11. purification_records
    op.create_table(
        'purification_records',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('portfolio_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('portfolios.id', ondelete='CASCADE'), nullable=False),
        sa.Column('company_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('companies.id'), nullable=False),
        sa.Column('screening_result_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('screening_results.id'), nullable=False),
        sa.Column('method', sa.String(length=32), nullable=False),
        sa.Column('period_days', sa.SmallInteger(), nullable=False),
        sa.Column('weighted_held_days', sa.Numeric(precision=10, scale=4), nullable=False),
        sa.Column('effective_quantity_lots', sa.Numeric(precision=20, scale=6), nullable=False),
        sa.Column('calculated_purification_amount', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('is_donated', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('calculated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 12. zakat_calculations
    op.create_table(
        'zakat_calculations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('portfolio_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('portfolios.id', ondelete='CASCADE'), nullable=False),
        sa.Column('zakat_valuation_date', sa.Date(), nullable=False),
        sa.Column('calendar_basis', sa.String(length=16), nullable=False, server_default='HIJRI_354'),
        sa.Column('gold_85g_nisab_try', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('total_trading_intent_value', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('total_long_term_zatable_value', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('total_zakat_due', sa.Numeric(precision=24, scale=4), nullable=False),
        sa.Column('breakdown_json', postgresql.JSONB(), nullable=False, server_default='{}'),
        sa.Column('calculated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 13. ohlcv_candles
    op.create_table(
        'ohlcv_candles',
        sa.Column('company_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('companies.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('timeframe', sa.String(length=8), primary_key=True),
        sa.Column('bucket_time', sa.DateTime(timezone=True), primary_key=True),
        sa.Column('open', sa.Numeric(precision=18, scale=6), nullable=False),
        sa.Column('high', sa.Numeric(precision=18, scale=6), nullable=False),
        sa.Column('low', sa.Numeric(precision=18, scale=6), nullable=False),
        sa.Column('close', sa.Numeric(precision=18, scale=6), nullable=False),
        sa.Column('volume', sa.Numeric(precision=24, scale=4), nullable=False),
    )

    # 14. smc_signals
    op.create_table(
        'smc_signals',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('company_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('companies.id', ondelete='CASCADE'), nullable=False),
        sa.Column('screening_result_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('screening_results.id'), nullable=False),
        sa.Column('timeframe', sa.String(length=8), nullable=False),
        sa.Column('signal_type', sa.String(length=32), nullable=False),
        sa.Column('signal_timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('zone_upper_bound', sa.Numeric(precision=18, scale=6), nullable=False),
        sa.Column('zone_lower_bound', sa.Numeric(precision=18, scale=6), nullable=False),
        sa.Column('reference_swing_price', sa.Numeric(precision=18, scale=6), nullable=True),
        sa.Column('is_mitigated', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('mitigated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('metadata_json', postgresql.JSONB(), nullable=False, server_default='{}'),
    )
    op.create_index('idx_smc_ticker_timeframe', 'smc_signals', ['company_id', 'timeframe', 'signal_timestamp'])


def downgrade() -> None:
    op.drop_table('smc_signals')
    op.drop_table('ohlcv_candles')
    op.drop_table('zakat_calculations')
    op.drop_table('purification_records')
    op.drop_table('dividend_distributions')
    op.drop_table('portfolio_transactions')
    op.drop_table('portfolios')
    op.drop_table('screening_results')
    op.drop_table('market_valuations')
    op.drop_table('financial_statement_footnotes')
    op.drop_table('financial_statements')
    op.drop_table('company_sector_assessments')
    op.drop_table('companies')
    op.drop_table('screening_standards')
