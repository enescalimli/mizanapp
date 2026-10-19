from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.presentation.api.deps import get_db
from app.infrastructure.database.models import Company

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.get("")
async def list_companies(
    sector: Optional[str] = Query(None, description="Filter by sector code"),
    active_only: bool = Query(True, description="Only active companies"),
    db: AsyncSession = Depends(get_db),
):
    """List companies with optional sector filtering."""
    stmt = select(Company)
    if active_only:
        stmt = stmt.where(Company.is_active == True)
    if sector:
        stmt = stmt.where(Company.sector_code == sector)
    stmt = stmt.order_by(Company.ticker)

    result = await db.execute(stmt)
    companies = result.scalars().all()

    return [
        {
            "id": str(c.id),
            "ticker": c.ticker,
            "company_name": c.company_name,
            "sector_code": c.sector_code,
            "sub_sector_code": c.sub_sector_code,
            "is_financial_institution": c.is_financial_institution,
            "is_participation_institution": c.is_participation_institution,
            "incorporation_articles_compliant": c.incorporation_articles_compliant,
        }
        for c in companies
    ]


@router.get("/{ticker}")
async def get_company_detail(ticker: str, db: AsyncSession = Depends(get_db)):
    """Get company profile by ticker."""
    stmt = select(Company).where(Company.ticker == ticker.upper())
    result = await db.execute(stmt)
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with ticker '{ticker.upper()}' not found",
        )
    return {
        "id": str(company.id),
        "ticker": company.ticker,
        "company_name": company.company_name,
        "sector_code": company.sector_code,
        "sub_sector_code": company.sub_sector_code,
        "is_financial_institution": company.is_financial_institution,
        "is_participation_institution": company.is_participation_institution,
        "incorporation_articles_compliant": company.incorporation_articles_compliant,
    }
