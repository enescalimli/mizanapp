import asyncio
from decimal import Decimal
import sys
from os.path import abspath, dirname

# Ensure backend root is on sys.path
sys.path.insert(0, dirname(dirname(abspath(__file__))))

from sqlalchemy import select
from app.infrastructure.database.session import AsyncSessionFactory
from app.infrastructure.database.models import ScreeningStandard

STANDARDS_DATA = [
    {
        "code": "BIST_KATILIM_DIB",
        "name": "BIST Katılım Endeksi (TKBB / DİB Standartları)",
        "max_interest_debt_ratio": Decimal("0.33000000"),
        "max_interest_cash_ratio": Decimal("0.33000000"),
        "max_impure_income_ratio": Decimal("0.05000000"),
        "debt_denominator_rule": "MAX_OF_MCAP_OR_ASSETS",
        "cash_denominator_rule": "MAX_OF_MCAP_OR_ASSETS",
        "mcap_moving_avg_months": 0,
        "tolerance_band_bps": 150,
        "grace_period_quarters": 2,
        "exclude_defense_sector": False,
    },
    {
        "code": "AAOIFI_STD_21",
        "name": "AAOIFI Shariah Standard No. 21",
        "max_interest_debt_ratio": Decimal("0.30000000"),
        "max_interest_cash_ratio": Decimal("0.30000000"),
        "max_impure_income_ratio": Decimal("0.05000000"),
        "debt_denominator_rule": "MCAP_MA_24M",
        "cash_denominator_rule": "MCAP_MA_24M",
        "mcap_moving_avg_months": 24,
        "tolerance_band_bps": 150,
        "grace_period_quarters": 2,
        "exclude_defense_sector": False,
    },
]


async def seed_standards() -> None:
    print("Seeding Screening Standards...")
    async with AsyncSessionFactory() as session:
        for data in STANDARDS_DATA:
            stmt = select(ScreeningStandard).where(ScreeningStandard.code == data["code"])
            res = await session.execute(stmt)
            existing = res.scalar_one_or_none()
            if not existing:
                standard = ScreeningStandard(**data)
                session.add(standard)
                print(f"Added standard: {data['code']} - {data['name']}")
            else:
                print(f"Standard {data['code']} already exists. Updating parameters...")
                for key, val in data.items():
                    setattr(existing, key, val)
        await session.commit()
    print("Seeding completed successfully.")


if __name__ == "__main__":
    asyncio.run(seed_standards())
