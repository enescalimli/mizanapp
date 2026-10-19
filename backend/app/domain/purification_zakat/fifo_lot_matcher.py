from dataclasses import dataclass
from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional, Sequence

from app.domain.purification_zakat.entities import (
    FIFOLotSlice,
    PortfolioTransactionInput,
    TransactionType,
)
from app.domain.value_objects.money import (
    ZERO,
    quantize_amount,
    quantize_ratio,
    quantize_share_quantity,
)


@dataclass
class _MutableLotRecord:
    buy_date: date
    sell_date: Optional[date]
    quantity_lots: Decimal


class FIFOLotMatcher:
    """Alım, satım ve bedelsiz sermaye artırımı (EC-05) işlemlerini FIFO kuyruğu ile eşleştirir
    ve ilgili bilanço çeyreğindeki gün bazlı (pro-rata) lot dilimlerini üretir.
    """

    @staticmethod
    def match_and_slice_for_period(
        transactions: Sequence[PortfolioTransactionInput],
        period_start_date: date,
        period_end_date: date,
        purification_per_share: Decimal,
    ) -> List[FIFOLotSlice]:
        if period_end_date < period_start_date:
            raise ValueError(
                f"period_end_date ({period_end_date}) cannot be earlier than period_start_date ({period_start_date})"
            )

        period_total_days = (period_end_date - period_start_date).days + 1

        # Sadece dönem sonuna kadar olan işlemleri kronolojik sırala
        # Aynı gün içinde alım/bedelsiz işlemleri satım işlemlerinden önce işlenir
        priority = {
            TransactionType.BUY: 1,
            TransactionType.RIGHTS_ISSUE: 2,
            TransactionType.BONUS_ISSUE: 3,
            TransactionType.SELL: 4,
        }
        relevant_txns = sorted(
            (t for t in transactions if t.transaction_date <= period_end_date),
            key=lambda x: (x.transaction_date, priority.get(x.transaction_type, 99)),
        )

        open_queue: List[_MutableLotRecord] = []
        closed_records: List[_MutableLotRecord] = []

        for txn in relevant_txns:
            if txn.transaction_type in (
                TransactionType.BUY,
                TransactionType.RIGHTS_ISSUE,
            ):
                open_queue.append(
                    _MutableLotRecord(
                        buy_date=txn.transaction_date,
                        sell_date=None,
                        quantity_lots=txn.quantity_lots,
                    )
                )

            elif txn.transaction_type == TransactionType.BONUS_ISSUE:
                # EC-05: Dönem içi bedelsiz sermaye artırımı (Stock Split)
                # Mevcut açık lotlar, eklenen bedelsiz pay oranında (split_factor) ölçeklenir;
                # böylece dönem sonu bölünmüş toplam pay sayısı (N_shares) ile tam senkron kalır.
                total_open = sum((lot.quantity_lots for lot in open_queue), ZERO)
                if total_open <= ZERO:
                    # Açık pozisyon yokken doğrudan BONUS_ISSUE girildiyse yeni lot olarak ekle
                    open_queue.append(
                        _MutableLotRecord(
                            buy_date=txn.transaction_date,
                            sell_date=None,
                            quantity_lots=txn.quantity_lots,
                        )
                    )
                else:
                    split_factor = (total_open + txn.quantity_lots) / total_open
                    for lot in open_queue:
                        lot.quantity_lots = quantize_share_quantity(
                            lot.quantity_lots * split_factor,
                            rounding=ROUND_HALF_UP,
                        )
                    # Bölünme tarihinden önce aynı çeyrek içinde kapatılmış lotlar varsa
                    # onların da dönem sonu paydasına göre eşdeğer pay adedini düzelt
                    for closed in closed_records:
                        if (
                            closed.sell_date is not None
                            and closed.sell_date >= period_start_date
                        ):
                            closed.quantity_lots = quantize_share_quantity(
                                closed.quantity_lots * split_factor,
                                rounding=ROUND_HALF_UP,
                            )

            elif txn.transaction_type == TransactionType.SELL:
                remaining_to_sell = txn.quantity_lots
                while remaining_to_sell > ZERO:
                    if not open_queue:
                        raise ValueError(
                            f"FIFO Sell Error on {txn.transaction_date}: "
                            f"Attempted to sell {remaining_to_sell} more lots than available in open holdings."
                        )
                    oldest = open_queue[0]
                    if oldest.quantity_lots <= remaining_to_sell:
                        sold_qty = oldest.quantity_lots
                        open_queue.pop(0)
                        closed_records.append(
                            _MutableLotRecord(
                                buy_date=oldest.buy_date,
                                sell_date=txn.transaction_date,
                                quantity_lots=sold_qty,
                            )
                        )
                        remaining_to_sell = quantize_share_quantity(
                            remaining_to_sell - sold_qty
                        )
                    else:
                        # Lot dilimini ikiye böl: satılan kısım kapanır, kalan kısım açık kuyrukta kalır
                        closed_records.append(
                            _MutableLotRecord(
                                buy_date=oldest.buy_date,
                                sell_date=txn.transaction_date,
                                quantity_lots=remaining_to_sell,
                            )
                        )
                        oldest.quantity_lots = quantize_share_quantity(
                            oldest.quantity_lots - remaining_to_sell
                        )
                        remaining_to_sell = ZERO

        all_records = closed_records + open_queue
        slices: List[FIFOLotSlice] = []
        dec_period_days = Decimal(period_total_days)

        for rec in all_records:
            if rec.sell_date is not None and rec.sell_date < period_start_date:
                continue
            if rec.buy_date > period_end_date:
                continue

            eff_start = max(rec.buy_date, period_start_date)
            eff_end = (
                min(rec.sell_date, period_end_date)
                if rec.sell_date is not None
                else period_end_date
            )

            if eff_end < eff_start:
                continue

            days_held = (eff_end - eff_start).days + 1
            pro_rata = quantize_ratio(
                Decimal(days_held) / dec_period_days,
                rounding=ROUND_HALF_UP,
            )
            # P_slice = P_share * Q_lots * (D_held / D_period)
            slice_purif = quantize_amount(
                purification_per_share
                * rec.quantity_lots
                * (Decimal(days_held) / dec_period_days),
                rounding=ROUND_HALF_UP,
            )

            slices.append(
                FIFOLotSlice(
                    buy_date=rec.buy_date,
                    sell_date=rec.sell_date,
                    effective_start_date=eff_start,
                    effective_end_date=eff_end,
                    quantity_lots=rec.quantity_lots,
                    days_held_in_period=days_held,
                    period_total_days=period_total_days,
                    pro_rata_factor=pro_rata,
                    purification_amount=slice_purif,
                )
            )

        return slices
