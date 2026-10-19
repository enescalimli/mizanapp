from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.exceptions import KatilimException, ZeroFloatViolationError, ShariahComplianceViolationError
from app.presentation.api.v1.router import api_v1_router

settings = get_settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Katılım Finansmanı Uygunluk Tarama, Bilanço Analizi, Portföy Arındırma ve Piyasa Takip Platformu API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(KatilimException)
async def katilim_exception_handler(request: Request, exc: KatilimException):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error_type": exc.__class__.__name__,
            "message": exc.message,
            "details": exc.details,
        },
    )


@app.exception_handler(ZeroFloatViolationError)
async def zero_float_exception_handler(request: Request, exc: ZeroFloatViolationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error_type": "ZeroFloatViolationError",
            "message": exc.message,
            "details": "Floating point operations are strictly prohibited in Katilim platform.",
        },
    )


@app.get("/")
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "docs": "/docs",
        "api_v1": settings.API_V1_PREFIX,
        "status": "active",
    }


# Include all v1 routes
app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)
