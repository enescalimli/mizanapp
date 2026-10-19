from fastapi import APIRouter
from app.presentation.api.v1.health import router as health_router
from app.presentation.api.v1.companies import router as companies_router
from app.presentation.api.v1.screening import router as screening_router
from app.presentation.api.v1.financials import router as financials_router
from app.presentation.api.v1.portfolio import router as portfolio_router
from app.presentation.api.v1.purification_zakat import router as purification_zakat_router
from app.presentation.api.v1.smc_scanner import router as smc_scanner_router
from services.pipeline.run_pipeline import router as pipeline_router

api_v1_router = APIRouter()

api_v1_router.include_router(health_router)
api_v1_router.include_router(companies_router)
api_v1_router.include_router(screening_router)
api_v1_router.include_router(financials_router)
api_v1_router.include_router(portfolio_router)
api_v1_router.include_router(purification_zakat_router)
api_v1_router.include_router(smc_scanner_router)
api_v1_router.include_router(pipeline_router)

