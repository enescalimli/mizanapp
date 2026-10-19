import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.presentation.api.deps import get_db
from app.infrastructure.database.models import Portfolio, PortfolioTransaction, ScreeningStandard

router = APIRouter(prefix="/portfolios", tags=["Portfolios"])


class CreatePortfolioDTO(BaseModel):
    user_id: str
    name: str
    preferred_standard_code: str = "BIST_KATILIM_DIB"
    default_investment_intent: str = "TRADING_SHORT_TERM"


@router.get("")
async def list_portfolios(user_id: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    """List portfolios for a user."""
    stmt = select(Portfolio)
    if user_id:
        stmt = stmt.where(Portfolio.user_id == uuid.UUID(user_id))
    result = await db.execute(stmt)
    portfolios = result.scalars().all()

    return [
        {
            "id": str(p.id),
            "user_id": str(p.user_id),
            "name": p.name,
            "default_investment_intent": p.default_investment_intent,
            "created_at": p.created_at.isoformat(),
        }
        for p in portfolios
    ]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_portfolio(dto: CreatePortfolioDTO, db: AsyncSession = Depends(get_db)):
    """Create a new user portfolio."""
    std_stmt = select(ScreeningStandard).where(ScreeningStandard.code == dto.preferred_standard_code)
    std_res = await db.execute(std_stmt)
    std = std_res.scalar_one_or_none()
    if not std:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Standard '{dto.preferred_standard_code}' does not exist.",
        )

    portfolio = Portfolio(
        user_id=uuid.UUID(dto.user_id),
        name=dto.name,
        preferred_standard_id=std.id,
        default_investment_intent=dto.default_investment_intent,
    )
    db.add(portfolio)
    await db.commit()
    await db.refresh(portfolio)

    return {
        "id": str(portfolio.id),
        "name": portfolio.name,
        "preferred_standard_code": std.code,
        "default_investment_intent": portfolio.default_investment_intent,
    }
