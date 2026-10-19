from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.presentation.api.deps import get_db
from app.infrastructure.database.models import SMCSignal, Company, ScreeningResult

router = APIRouter(prefix="/scanner", tags=["Halal Universe SMC Scanner"])


@router.get("/signals")
async def list_halal_smc_signals(
    timeframe: Optional[str] = Query(None, description="Timeframe e.g. 15m, 1h, 4h, 1d"),
    signal_type: Optional[str] = Query(None, description="Signal type e.g. BULLISH_FVG, BULLISH_BOS"),
    unmitigated_only: bool = Query(True, description="Only unmitigated zones"),
    db: AsyncSession = Depends(get_db),
):
    """List active SMC Price Action signals for Katılım compliant companies only."""
    stmt = (
        select(SMCSignal)
        .join(SMCSignal.screening_result)
        .join(SMCSignal.company)
        .where(
            ScreeningResult.overall_status.in_(["COMPLIANT", "GRACE_PERIOD_TOLERANCE"])
        )
    )

    if timeframe:
        stmt = stmt.where(SMCSignal.timeframe == timeframe)
    if signal_type:
        stmt = stmt.where(SMCSignal.signal_type == signal_type)
    if unmitigated_only:
        stmt = stmt.where(SMCSignal.is_mitigated == False)

    stmt = stmt.order_by(SMCSignal.signal_timestamp.desc())

    result = await db.execute(stmt)
    signals = result.scalars().all()

    return [
        {
            "id": str(s.id),
            "ticker": s.company.ticker,
            "company_name": s.company.company_name,
            "timeframe": s.timeframe,
            "signal_type": s.signal_type,
            "signal_timestamp": s.signal_timestamp.isoformat(),
            "zone_upper_bound": f"{s.zone_upper_bound:.6f}",
            "zone_lower_bound": f"{s.zone_lower_bound:.6f}",
            "reference_swing_price": f"{s.reference_swing_price:.6f}" if s.reference_swing_price else None,
            "is_mitigated": s.is_mitigated,
            "metadata": s.metadata_json,
        }
        for s in signals
    ]
