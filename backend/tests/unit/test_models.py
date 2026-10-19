from sqlalchemy import Numeric
from app.infrastructure.database.session import Base
import app.infrastructure.database.models  # load all models


def test_database_models_metadata_tables():
    """Verify all 14 tables defined in ARCHITECTURE.md are registered in Base.metadata."""
    table_names = set(Base.metadata.tables.keys())
    expected_tables = {
        "screening_standards",
        "companies",
        "company_sector_assessments",
        "financial_statements",
        "financial_statement_footnotes",
        "market_valuations",
        "screening_results",
        "portfolios",
        "portfolio_transactions",
        "dividend_distributions",
        "purification_records",
        "zakat_calculations",
        "ohlcv_candles",
        "smc_signals",
    }
    missing = expected_tables - table_names
    assert not missing, f"Missing tables in metadata: {missing}"


def test_zero_float_database_columns():
    """Verify that no column in any table uses Float, Double or Real, and that all numeric columns have exact scale/precision."""
    for table_name, table in Base.metadata.tables.items():
        for column in table.columns:
            col_type = column.type
            type_str = str(col_type).upper()

            # Strictly forbidden database types
            assert "FLOAT" not in type_str, f"Float type found in {table_name}.{column.name}: {type_str}"
            assert "REAL" not in type_str, f"Real type found in {table_name}.{column.name}: {type_str}"
            assert "DOUBLE" not in type_str, f"Double type found in {table_name}.{column.name}: {type_str}"

            # Numeric columns must specify precision and scale
            if isinstance(col_type, Numeric):
                assert col_type.precision is not None, f"Precision missing in {table_name}.{column.name}"
                assert col_type.scale is not None, f"Scale missing in {table_name}.{column.name}"


def test_financial_statement_precision():
    """Verify specific financial columns have expected precision/scale."""
    fs_table = Base.metadata.tables["financial_statements"]
    assert fs_table.c.total_assets.type.precision == 24
    assert fs_table.c.total_assets.type.scale == 4
    assert fs_table.c.total_shares_outstanding.type.precision == 20
    assert fs_table.c.total_shares_outstanding.type.scale == 6

    sr_table = Base.metadata.tables["screening_results"]
    assert sr_table.c.interest_debt_ratio.type.precision == 12
    assert sr_table.c.interest_debt_ratio.type.scale == 8
    assert sr_table.c.purification_per_share_quarter.type.precision == 18
    assert sr_table.c.purification_per_share_quarter.type.scale == 8
