from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.presentation.api.deps import get_db
from app.infrastructure.database.models import ScreeningStandard, ScreeningResult, Company

router = APIRouter(prefix="/screening", tags=["Screening"])


@router.get("/standards")
async def list_standards(db: AsyncSession = Depends(get_db)):
    """List all available Katılım screening standards (BIST Katılım DİB, AAOIFI, etc.)."""
    stmt = select(ScreeningStandard).order_by(ScreeningStandard.code)
    result = await db.execute(stmt)
    standards = result.scalars().all()
    return [
        {
            "id": str(s.id),
            "code": s.code,
            "name": s.name,
            "max_interest_debt_ratio": f"{s.max_interest_debt_ratio:.8f}",
            "max_interest_cash_ratio": f"{s.max_interest_cash_ratio:.8f}",
            "max_impure_income_ratio": f"{s.max_impure_income_ratio:.8f}",
            "debt_denominator_rule": s.debt_denominator_rule,
            "cash_denominator_rule": s.cash_denominator_rule,
            "mcap_moving_avg_months": s.mcap_moving_avg_months,
            "tolerance_band_bps": s.tolerance_band_bps,
            "grace_period_quarters": s.grace_period_quarters,
            "exclude_defense_sector": s.exclude_defense_sector,
        }
        for s in standards
    ]


@router.get("/results/{ticker}")
async def get_screening_result(
    ticker: str,
    standard_code: str = Query("BIST_KATILIM_DIB", description="Standard code"),
    db: AsyncSession = Depends(get_db),
):
    """Get latest screening evaluation for a company."""
    # Find company
    comp_stmt = select(Company).where(Company.ticker == ticker.upper())
    comp_res = await db.execute(comp_stmt)
    company = comp_res.scalar_one_or_none()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company '{ticker.upper()}' not found",
        )

    # Find standard
    std_stmt = select(ScreeningStandard).where(ScreeningStandard.code == standard_code)
    std_res = await db.execute(std_stmt)
    standard = std_res.scalar_one_or_none()
    if not standard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Screening standard '{standard_code}' not found",
        )

    # Find latest screening result
    res_stmt = (
        select(ScreeningResult)
        .where(
            ScreeningResult.company_id == company.id,
            ScreeningResult.standard_id == standard.id,
        )
        .order_by(ScreeningResult.valuation_date.desc())
    )
    res = await db.execute(res_stmt)
    screening = res.scalar_one_or_none()

    if not screening:
        return {
            "ticker": company.ticker,
            "company_name": company.company_name,
            "standard_code": standard.code,
            "overall_status": "PENDING_FIRST_EVALUATION",
            "message": "No financial statement evaluated yet for this standard.",
        }

    return {
        "ticker": company.ticker,
        "company_name": company.company_name,
        "standard_code": standard.code,
        "valuation_date": screening.valuation_date.isoformat(),
        "overall_status": screening.overall_status,
        "is_sector_compliant": screening.is_sector_compliant,
        "ratios": {
            "denominator_value_try": f"{screening.denominator_value_used:.4f}",
            "interest_debt": {
                "numerator_try": f"{screening.interest_debt_numerator:.4f}",
                "ratio_decimal": f"{screening.interest_debt_ratio:.8f}",
                "is_compliant": screening.is_debt_ratio_compliant,
            },
            "interest_cash": {
                "numerator_try": f"{screening.interest_cash_numerator:.4f}",
                "ratio_decimal": f"{screening.interest_cash_ratio:.8f}",
                "is_compliant": screening.is_cash_ratio_compliant,
            },
            "impure_income": {
                "numerator_try": f"{screening.impure_income_numerator:.4f}",
                "denominator_try": f"{screening.total_revenue_denominator:.4f}",
                "ratio_decimal": f"{screening.impure_income_ratio:.8f}",
                "is_compliant": screening.is_impure_income_compliant,
            },
        },
        "purification": {
            "purification_per_share_quarter_try": f"{screening.purification_per_share_quarter:.8f}",
            "dividend_purification_ratio": f"{screening.purification_ratio_dividend:.8f}",
            "zatable_net_assets_per_share_try": f"{screening.zatable_net_assets_per_share:.8f}",
        },
    }
