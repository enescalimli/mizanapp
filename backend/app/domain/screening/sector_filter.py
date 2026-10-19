from typing import List, Tuple

from app.domain.screening.entities import ScreeningStandardConfig, SectorActivityInput


class SectorFilter:
    """Faaliyet Alanı (Sektör) ve Ana Sözleşme uygunluk filtresi."""

    @staticmethod
    def evaluate(
        sector_input: SectorActivityInput,
        standard: ScreeningStandardConfig,
    ) -> Tuple[bool, List[str]]:
        violations: List[str] = []

        if not sector_input.incorporation_articles_compliant:
            violations.append("INCORPORATION_ARTICLES_NON_COMPLIANT")

        if sector_input.has_conventional_banking and not sector_input.is_participation_institution:
            violations.append("CONVENTIONAL_BANKING_AND_INTEREST_FINANCE")

        if sector_input.has_conventional_insurance and not sector_input.is_participation_institution:
            violations.append("CONVENTIONAL_INSURANCE")

        if sector_input.has_alcohol_production_or_trade:
            violations.append("ALCOHOL_PRODUCTION_OR_TRADE")

        if sector_input.has_tobacco:
            violations.append("TOBACCO_PRODUCTS")

        if sector_input.has_gambling_or_betting:
            violations.append("GAMBLING_AND_BETTING")

        if sector_input.has_pork_products:
            violations.append("PORK_AND_DERIVATIVES")

        if sector_input.has_adult_entertainment_or_media:
            violations.append("PROHIBITED_MEDIA_OR_ENTERTAINMENT")

        if standard.exclude_defense_sector and sector_input.has_weapons_or_defense:
            violations.append("WEAPONS_AND_DEFENSE_EXCLUDED_BY_STANDARD")

        is_compliant = len(violations) == 0
        return is_compliant, violations
