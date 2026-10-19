from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.presentation.api.deps import get_db
from app.core.config import get_settings

router = APIRouter(prefix="/health", tags=["Health"])
settings = get_settings()


@router.get("")
async def check_health(db: AsyncSession = Depends(get_db)):
    """Health check endpoint checking application and database connection."""
    db_status = "ok"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "zero_float_policy": "STRICT_ACTIVE",
    }
