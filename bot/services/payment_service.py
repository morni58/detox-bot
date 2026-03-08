# -*- coding: utf-8 -*-
"""
🌿 PaymentService — полная реализация с SQLAlchemy async.

Методы:
  • save_payment         — записать успешный платёж
  • get_by_charge_id     — найти платёж по charge_id
  • get_by_user          — все платежи пользователя
  • has_active_payment   — проверка оплаты
  • mark_user_paid       — отметить пользователя оплатившим
  • mark_refunded        — пометить как возвращённый
  • count_all / sum_revenue / stats  — статистика
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger


class PaymentDTO:
    """Лёгкий объект платежа (без ORM-зависимости)."""

    __slots__ = (
        "id", "user_telegram_id", "amount", "currency",
        "telegram_charge_id", "provider_charge_id",
        "status", "payload", "refunded_at", "refund_reason",
        "created_at",
    )

    def __init__(
        self,
        *,
        id: int,
        user_telegram_id: int,
        amount: int,
        currency: str,
        telegram_charge_id: str,
        provider_charge_id: str = "",
        status: str = "completed",
        payload: str = "detox_course_21day",
        refunded_at: Optional[datetime] = None,
        refund_reason: Optional[str] = None,
        created_at: Optional[datetime] = None,
    ):
        self.id = id
        self.user_telegram_id = user_telegram_id
        self.amount = amount
        self.currency = currency
        self.telegram_charge_id = telegram_charge_id
        self.provider_charge_id = provider_charge_id
        self.status = status
        self.payload = payload
        self.refunded_at = refunded_at
        self.refund_reason = refund_reason
        self.created_at = created_at or datetime.now(timezone.utc)


class PaymentService:
    """Сервис платежей (per-request: каждый вызов = отдельная сессия)."""

    def __init__(self, session: AsyncSession):
        self._s = session

    # ── Lazy import моделей ──────────────────────────────
    @staticmethod
    def _model():
        from database.models import Payment
        return Payment

    @staticmethod
    def _user_model():
        from database.models import User
        return User

    # ── ORM → DTO ────────────────────────────────────────
    @classmethod
    def _to_dto(cls, row) -> PaymentDTO:
        return PaymentDTO(
            id=row.id,
            user_telegram_id=row.user_telegram_id,
            amount=row.amount,
            currency=row.currency,
            telegram_charge_id=row.telegram_charge_id,
            provider_charge_id=row.provider_charge_id or "",
            status=row.status,
            payload=row.payload or "detox_course_21day",
            refunded_at=row.refunded_at,
            refund_reason=row.refund_reason,
            created_at=row.created_at,
        )

    # ═════════════════════════════════════════════════════
    # CREATE
    # ═════════════════════════════════════════════════════

    async def save_payment(
        self,
        *,
        user_telegram_id: int,
        amount: int,
        currency: str,
        telegram_charge_id: str,
        provider_charge_id: str = "",
        payload: str = "detox_course_21day",
    ) -> PaymentDTO:
        """
        Сохраняет платёж в БД.
        Идемпотентный: при дубликате charge_id — возвращает существующий.
        """
        Payment = self._model()

        # Защита от дублирования (Telegram может повторить webhook)
        existing = await self.get_by_charge_id(telegram_charge_id)
        if existing:
            logger.warning(
                "Duplicate payment ignored: charge_id={}",
                telegram_charge_id,
            )
            return existing

        row = Payment(
            user_telegram_id=user_telegram_id,
            amount=amount,
            currency=currency,
            telegram_charge_id=telegram_charge_id,
            provider_charge_id=provider_charge_id,
            status="completed",
            payload=payload,
        )

        self._s.add(row)
        await self._s.flush()
        await self._s.refresh(row)

        logger.info(
            "Payment saved: id={}, user={}, amount={} {}, charge={}",
            row.id, user_telegram_id, amount, currency, telegram_charge_id,
        )
        return self._to_dto(row)

    # ═════════════════════════════════════════════════════
    # READ
    # ═════════════════════════════════════════════════════

    async def get_by_charge_id(self, charge_id: str) -> Optional[PaymentDTO]:
        """Найти платёж по telegram_charge_id."""
        Payment = self._model()
        result = await self._s.execute(
            select(Payment).where(Payment.telegram_charge_id == charge_id)
        )
        row = result.scalar_one_or_none()
        return self._to_dto(row) if row else None

    async def get_by_user(self, telegram_id: int) -> list[PaymentDTO]:
        """Все платежи пользователя (новейшие первые)."""
        Payment = self._model()
        result = await self._s.execute(
            select(Payment)
            .where(Payment.user_telegram_id == telegram_id)
            .order_by(Payment.created_at.desc())
        )
        return [self._to_dto(r) for r in result.scalars().all()]

    async def has_active_payment(self, telegram_id: int) -> bool:
        """Есть ли хотя бы один completed (не refunded) платёж."""
        Payment = self._model()
        result = await self._s.execute(
            select(func.count(Payment.id)).where(
                Payment.user_telegram_id == telegram_id,
                Payment.status == "completed",
            )
        )
        return (result.scalar() or 0) > 0

    async def get_latest_completed(self, telegram_id: int) -> Optional[PaymentDTO]:
        """Последний completed платёж пользователя."""
        Payment = self._model()
        result = await self._s.execute(
            select(Payment)
            .where(
                Payment.user_telegram_id == telegram_id,
                Payment.status == "completed",
            )
            .order_by(Payment.created_at.desc())
            .limit(1)
        )
        row = result.scalar_one_or_none()
        return self._to_dto(row) if row else None

    # ═════════════════════════════════════════════════════
    # UPDATE user → paid
    # ═════════════════════════════════════════════════════

    async def mark_user_paid(self, telegram_id: int) -> None:
        """Ставит has_paid=True, paid_at=now() в таблице users."""
        User = self._user_model()
        await self._s.execute(
            update(User)
            .where(User.telegram_id == telegram_id)
            .values(
                has_paid=True,
                paid_at=datetime.now(timezone.utc),
            )
        )
        logger.info("User marked as paid: telegram_id={}", telegram_id)

    # ═════════════════════════════════════════════════════
    # REFUND
    # ═════════════════════════════════════════════════════

    async def mark_refunded(
        self,
        charge_id: str,
        reason: str = "",
    ) -> Optional[int]:
        """
        Помечает платёж как возвращённый.
        Returns: user_telegram_id или None если не найден.
        """
        Payment = self._model()

        result = await self._s.execute(
            update(Payment)
            .where(
                Payment.telegram_charge_id == charge_id,
                Payment.status == "completed",
            )
            .values(
                status="refunded",
                refunded_at=datetime.now(timezone.utc),
                refund_reason=reason or None,
            )
            .returning(Payment.user_telegram_id)
        )
        row = result.first()

        if not row:
            logger.warning(
                "Refund target not found: charge_id={}", charge_id,
            )
            return None

        user_telegram_id = row[0]

        # Если у пользователя больше нет completed платежей — снимаем has_paid
        still_has = await self.has_active_payment(user_telegram_id)
        if not still_has:
            User = self._user_model()
            await self._s.execute(
                update(User)
                .where(User.telegram_id == user_telegram_id)
                .values(has_paid=False)
            )
            logger.info(
                "User unpaid after refund: telegram_id={}", user_telegram_id,
            )

        logger.info("Payment refunded: charge_id={}", charge_id)
        return user_telegram_id

    # ═════════════════════════════════════════════════════
    # STATS
    # ═════════════════════════════════════════════════════

    async def count_all(self) -> int:
        Payment = self._model()
        r = await self._s.execute(
            select(func.count(Payment.id)).where(Payment.status == "completed")
        )
        return r.scalar() or 0

    async def count_refunded(self) -> int:
        Payment = self._model()
        r = await self._s.execute(
            select(func.count(Payment.id)).where(Payment.status == "refunded")
        )
        return r.scalar() or 0

    async def sum_revenue(self) -> int:
        """Сумма completed Stars."""
        Payment = self._model()
        r = await self._s.execute(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(
                Payment.status == "completed",
                Payment.currency == "XTR",
            )
        )
        return r.scalar() or 0

    async def count_today(self) -> int:
        Payment = self._model()
        today_start = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0,
        )
        r = await self._s.execute(
            select(func.count(Payment.id)).where(
                Payment.status == "completed",
                Payment.created_at >= today_start,
            )
        )
        return r.scalar() or 0

    async def get_stats(self) -> dict:
        """Полная статистика для админки."""
        return {
            "total_payments": await self.count_all(),
            "total_refunded": await self.count_refunded(),
            "total_revenue_stars": await self.sum_revenue(),
            "today_payments": await self.count_today(),
        }
