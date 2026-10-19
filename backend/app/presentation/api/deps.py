from typing import AsyncGenerator
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.session import get_db

# Re-export get_db for presentation layer dependencies
__all__ = ["get_db", "AsyncSession"]
