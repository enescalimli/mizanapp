from decimal import Decimal
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.presentation.api.deps import get_db
from app.infrastructure.database.models import Portfolio, PurificationRecord, ZakatCalculation

router = APIRouter(prefix="/purification-zakat", tags=["Purification & Zakat"])


@router.get("/portfolio/{portfolio_id}/summary")
async def get_portfolio_purification_zakat_summary(
    portfolio_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get calculated purification and zakat summary for a portfolio."""
    # Check portfolio exists
    port_stmt = select(Portfolio).where(Portfolio.id == portfolio_id)
    port_res = await db.execute(port_stmt)
    portfolio = port_res.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Portfolio '{portfolio_id}' not found",
        )

    # Fetch purification records
    purif_stmt = (
        select(PurificationRecord)
        .where(PurificationRecord.portfolio_id == portfolio.id)
        .order_by(PurificationRecord.calculated_at.desc())
    )
    purif_res = await db.execute(purif_stmt)
    records = purif_res.scalars().all()

    # Fetch latest zakat calculation
    zakat_stmt = (
        select(ZakatCalculation)
        .where(ZakatCalculation.portfolio_id == portfolio.id)
        .order_by(ZakatCalculation.calculated_at.desc())
    )
    zakat_res = await db.execute(zakat_stmt)
    zakat = zakat_res.scalar_one_or_none()

    total_purification_try = sum((r.calculated_purification_amount for r in records), Decimal("0.0000")) if records else Decimal("0.0000")

    return {
        "portfolio_id": str(portfolio.id),
        "portfolio_name": portfolio.name,
        "total_purification_due_try": f"{total_purification_try:.4f}",
        "purification_records_count": len(records),
        "latest_zakat": {
            "zakat_due_try": f"{zakat.total_zakat_due:.4f}" if zakat else "0.0000",
            "gold_85g_nisab_try": f"{zakat.gold_85g_nisab_try:.4f}" if zakat else "0.0000",
            "calendar_basis": zakat.calendar_basis if zakat else "HIJRI_354",
        } if zakat else None,
    }
