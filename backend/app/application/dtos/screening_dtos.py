from decimal import Decimal
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
from app.core.decimal_utils import (
    StringifiedDecimal4,
    StringifiedDecimal6,
    StringifiedDecimal8,
    StringifiedDecimal2,
)


class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)


class StandardInfoDTO(BaseSchema):
    code: str
    name: str
    max_interest_debt_ratio: StringifiedDecimal8
    max_interest_cash_ratio: StringifiedDecimal8
    max_impure_income_ratio: StringifiedDecimal8


class RatioDetailDTO(BaseSchema):
    numerator_try: StringifiedDecimal4
    ratio_decimal: StringifiedDecimal8
    ratio_percentage: str
    threshold_decimal: StringifiedDecimal8
    is_compliant: bool


class ScreeningEvaluationDTO(BaseSchema):
    ticker: str
    company_name: str
    fiscal_period: str
    standard_code: str
    valuation_date: str
    overall_status: str  # COMPLIANT, GRACE_PERIOD_TOLERANCE, NON_COMPLIANT
    grace_period_info: Dict[str, Any]
    sector_assessment: Dict[str, Any]
    ratios: Dict[str, Any]
    footnote_verification: Dict[str, Any]
    purification_and_zakat_metrics: Dict[str, Any]
