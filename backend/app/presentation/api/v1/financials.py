from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.presentation.api.deps import get_db
from app.infrastructure.database.models import Company, FinancialStatement, FinancialStatementFootnotes

router = APIRouter(prefix="/financials", tags=["Financials & Footnotes"])


@router.get("/{ticker}/statements")
async def get_statements(ticker: str, db: AsyncSession = Depends(get_db)):
    """List financial statement periods available for a company."""
    comp_stmt = select(Company).where(Company.ticker == ticker.upper())
    comp_res = await db.execute(comp_stmt)
    company = comp_res.scalar_one_or_none()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company '{ticker.upper()}' not found",
        )

    stmt = (
        select(FinancialStatement)
        .where(FinancialStatement.company_id == company.id)
        .order_by(FinancialStatement.fiscal_year.desc(), FinancialStatement.fiscal_quarter.desc())
    )
    result = await db.execute(stmt)
    statements = result.scalars().all()

    return [
        {
            "id": str(s.id),
            "fiscal_period": f"{s.fiscal_year}-Q{s.fiscal_quarter}",
            "period_end_date": s.period_end_date.isoformat(),
            "publication_date": s.publication_date.isoformat(),
            "is_consolidated": s.is_consolidated,
            "total_assets_try": f"{s.total_assets:.4f}",
            "revenue_ttm_try": f"{s.revenue_ttm:.4f}",
            "net_income_ttm_try": f"{s.net_income_ttm:.4f}",
        }
        for s in statements
    ]


@router.get("/statements/{statement_id}/footnotes")
async def get_statement_footnotes(statement_id: str, db: AsyncSession = Depends(get_db)):
    """Get detailed footnote breakdown and accounting identity verification for a statement."""
    stmt = (
        select(FinancialStatement)
        .options(selectinload(FinancialStatement.footnotes))
        .where(FinancialStatement.id == statement_id)
    )
    result = await db.execute(stmt)
    statement = result.scalar_one_or_none()
    if not statement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Financial statement not found",
        )

    fn = statement.footnotes
    if not fn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Footnotes not yet parsed for this statement",
        )

    return {
        "statement_id": str(statement.id),
        "period": f"{statement.fiscal_year}-Q{statement.fiscal_quarter}",
        "balance_sheet_cash_total_try": f"{statement.cash_and_cash_equivalents_total:.4f}",
        "is_accounting_identity_verified": fn.is_accounting_identity_verified,
        "used_conservative_fallback": fn.used_conservative_fallback,
        "extraction_method": fn.extraction_method,
        "cash_breakdown_try": {
            "cash_on_hand": f"{fn.cash_on_hand:.4f}",
            "demand_deposits_banks": f"{fn.demand_deposits_banks:.4f}",
            "participation_accounts": f"{fn.participation_accounts:.4f}",
            "time_deposits_interest": f"{fn.time_deposits_interest:.4f}",
            "reverse_repo_receivables": f"{fn.reverse_repo_receivables:.4f}",
            "money_market_funds_interest": f"{fn.money_market_funds_interest:.4f}",
            "other_cash_unclassified": f"{fn.other_cash_unclassified:.4f}",
        },
        "debts_breakdown_try": {
            "participation_bank_financings": f"{fn.participation_bank_financings:.4f}",
            "sukuk_issued_liabilities": f"{fn.sukuk_issued_liabilities:.4f}",
            "conventional_bank_loans": f"{fn.conventional_bank_loans:.4f}",
            "issued_bonds_and_bills_debt": f"{fn.issued_bonds_and_bills_debt:.4f}",
            "factoring_and_financial_lease_debt": f"{fn.factoring_and_financial_lease_debt:.4f}",
        },
        "income_breakdown_try": {
            "interest_income_quarter": f"{fn.interest_income_quarter:.4f}",
            "interest_income_ttm": f"{fn.interest_income_ttm:.4f}",
            "participation_profit_share_income_quarter": f"{fn.participation_profit_share_income_quarter:.4f}",
            "fx_gain_operating_quarter": f"{fn.fx_gain_operating_quarter:.4f}",
            "non_compliant_side_income_quarter": f"{fn.non_compliant_side_income_quarter:.4f}",
        },
    }
