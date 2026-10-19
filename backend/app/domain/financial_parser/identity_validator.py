from decimal import Decimal
from typing import Optional

from app.domain.financial_parser.entities import (
    BorrowingsFootnoteBreakdown,
    CashFootnoteBreakdown,
    ExtractionStatus,
    FinancialInvestmentsBreakdown,
    VerifiedFootnoteResult,
)
from app.domain.value_objects.money import ZERO, quantize_amount


class FootnoteExtractionConflictError(ValueError):
    """Dipnot alt kalemlerinin toplamı ana bilanço kalemini aştığında (Delta < 0) fırlatılır."""

    pass


class AccountingIdentityValidator:
    """Bilanço ana kalemleri ile dipnot alt kırılımlarının muhasebe denkliğini ve
    İslami finans İhtiyatlılık İlkesini (Shariah Prudence Principle - EC-02) denetler.
    """

    @staticmethod
    def verify_and_classify(
        cash: CashFootnoteBreakdown,
        investments: Optional[FinancialInvestmentsBreakdown] = None,
        borrowings: Optional[BorrowingsFootnoteBreakdown] = None,
    ) -> VerifiedFootnoteResult:
        inv = investments or FinancialInvestmentsBreakdown(balance_sheet_total=ZERO)
        debt = borrowings or BorrowingsFootnoteBreakdown(balance_sheet_total=ZERO)

        # 1. Nakit ve Nakit Benzerleri Denklik Kontrolü
        halal_cash = quantize_amount(
            cash.cash_on_hand + cash.demand_deposits_banks + cash.participation_accounts
        )
        explicit_impure_cash = quantize_amount(
            cash.time_deposits_interest
            + cash.reverse_repo_receivables
            + cash.money_market_funds_interest
            + cash.explicit_other_cash
        )
        documented_cash_sum = quantize_amount(halal_cash + explicit_impure_cash)
        delta_cash = quantize_amount(cash.balance_sheet_total - documented_cash_sum)

        if delta_cash < ZERO:
            raise FootnoteExtractionConflictError(
                f"EXTRACTION_CONFLICT (Cash): Footnote components sum ({documented_cash_sum}) "
                f"exceeds balance sheet total ({cash.balance_sheet_total}) by {abs(delta_cash)}."
            )

        # 2. Finansal Yatırımlar Denklik Kontrolü
        halal_inv = quantize_amount(
            inv.sukuk_and_lease_certificates + inv.compliant_equity_investments
        )
        explicit_impure_inv = quantize_amount(
            inv.government_bonds_and_tbills
            + inv.corporate_bonds_interest
            + inv.derivative_assets_speculative
        )
        documented_inv_sum = quantize_amount(halal_inv + explicit_impure_inv)
        delta_inv = quantize_amount(inv.balance_sheet_total - documented_inv_sum)

        if delta_inv < ZERO:
            raise FootnoteExtractionConflictError(
                f"EXTRACTION_CONFLICT (Investments): Footnote components sum ({documented_inv_sum}) "
                f"exceeds balance sheet total ({inv.balance_sheet_total}) by {abs(delta_inv)}."
            )

        # 3. Finansal Borçlanmalar Denklik Kontrolü
        halal_debt = quantize_amount(
            debt.participation_bank_financings
            + debt.sukuk_issued_liabilities
            + debt.operational_lease_tfrs16
        )
        explicit_impure_debt = quantize_amount(
            debt.conventional_bank_loans
            + debt.issued_bonds_and_bills_debt
            + debt.factoring_and_financial_lease_debt
        )
        documented_debt_sum = quantize_amount(halal_debt + explicit_impure_debt)
        delta_debt = quantize_amount(debt.balance_sheet_total - documented_debt_sum)

        if delta_debt < ZERO:
            raise FootnoteExtractionConflictError(
                f"EXTRACTION_CONFLICT (Borrowings): Footnote components sum ({documented_debt_sum}) "
                f"exceeds balance sheet total ({debt.balance_sheet_total}) by {abs(delta_debt)}."
            )

        # İhtiyatlılık İlkesi (EC-02): Açıklanmayan pozitif farklar ve explicit_other_cash
        # %100 faizli/uygunsuz kabul edilir.
        unclassified_cash = quantize_amount(delta_cash + cash.explicit_other_cash)
        unclassified_inv = delta_inv
        unclassified_debt = delta_debt

        used_fallback = (
            unclassified_cash > ZERO
            or unclassified_inv > ZERO
            or unclassified_debt > ZERO
        )
        is_exact_identity = (
            delta_cash == ZERO and delta_inv == ZERO and delta_debt == ZERO
        )

        total_interest_cash_and_inv = quantize_amount(
            cash.time_deposits_interest
            + cash.reverse_repo_receivables
            + cash.money_market_funds_interest
            + unclassified_cash
            + explicit_impure_inv
            + unclassified_inv
        )

        total_interest_debt = quantize_amount(explicit_impure_debt + unclassified_debt)

        status = (
            ExtractionStatus.CONSERVATIVE_FALLBACK
            if used_fallback
            else ExtractionStatus.VERIFIED
        )
        audit_msg = (
            "Accounting identity verified exact (Delta = 0.0000)."
            if not used_fallback
            else (
                f"Shariah Prudence Fallback applied: Unclassified Cash={unclassified_cash}, "
                f"Unclassified Inv={unclassified_inv}, Unclassified Debt={unclassified_debt}."
            )
        )

        return VerifiedFootnoteResult(
            status=status,
            is_accounting_identity_verified=is_exact_identity,
            used_conservative_fallback=used_fallback,
            halal_cash_total=quantize_amount(halal_cash + halal_inv),
            interest_bearing_cash_and_investments_total=total_interest_cash_and_inv,
            unclassified_cash_fallback_amount=unclassified_cash,
            unclassified_investments_fallback_amount=unclassified_inv,
            halal_debt_total=halal_debt,
            interest_bearing_debt_total=total_interest_debt,
            unclassified_debt_fallback_amount=unclassified_debt,
            audit_message=audit_msg,
        )
