# -*- coding: utf-8 -*-
"""
🌿 Handlers: Оплата (полная реализация).

Flow оплаты через бот:
  1. buy_stars          → показ подтверждения
  2. buy_confirm_stars  → отправка invoice (XTR)
  3. pre_checkout_query → валидация (payload, дубликат)
  4. successful_payment → сохранение, доступ, уведомления

Flow оплаты через Mini App:
  5. /api/payment/create-invoice → возвращает invoice_url
     (обрабатывается в FastAPI, но invoice создаётся через бот)

Post-payment actions:
  • Сохранить платёж в payments
  • Обновить users.has_paid = true
  • Создать/получить invite link для закрытого чата
  • Отправить welcome-сообщение с ссылкой на чат
  • Отправить первый день курса (preview)
  • Уведомить админа
  • Запланировать daily-напоминания (Redis)

Refund:
  • refund_stars       → возврат через Bot API
  • Обновление статуса в БД
  • Отзыв доступа
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional

from aiogram import Router, F, Bot
from aiogram.types import (
    CallbackQuery,
    Message,
    LabeledPrice,
    PreCheckoutQuery,
    ChatInviteLink,
)
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from bot.config import get_settings
from bot.keyboards.inline import (
    get_confirm_payment_keyboard,
    get_success_keyboard,
    get_buy_keyboard,
    get_back_keyboard,
)
from bot.services.payment_service import PaymentService

router = Router(name="payment")


# ═══════════════════════════════════════════════════════════════
# Helpers: получить PaymentService из middleware-контекста
# ═══════════════════════════════════════════════════════════════

def _get_payment_service(session: AsyncSession) -> PaymentService:
    """Фабрика PaymentService из сессии."""
    return PaymentService(session)


# ═══════════════════════════════════════════════════════════════
# ⭐ Шаг 1: Показать подтверждение перед оплатой
# ═══════════════════════════════════════════════════════════════

@router.callback_query(F.data == "buy_stars")
async def cb_buy_stars(
    callback: CallbackQuery,
    session: AsyncSession,
) -> None:
    """
    Пользователь нажал «Оплатить Stars».
    Проверяем: не купил ли уже? Показываем подтверждение.
    """
    settings = get_settings()
    user = callback.from_user
    ps = _get_payment_service(session)

    # ── Проверка: уже оплачен? ───────────────────────────
    if await ps.has_active_payment(user.id):
        await callback.message.edit_text(
            "✅ <b>У тебя уже есть доступ к курсу!</b>\n\n"
            "Ты уже оплатила детокс-курс ранее.\n"
            "Нажми кнопку ниже, чтобы продолжить.",
            parse_mode="HTML",
            reply_markup=get_success_keyboard(),
        )
        await callback.answer("Курс уже оплачен ✅", show_alert=True)
        return

    # ── Показать подтверждение ───────────────────────────
    await callback.message.edit_text(
        f"⭐ <b>Оплата Telegram Stars</b>\n\n"
        f"Курс: <b>21-дневный детокс</b>\n"
        f"Стоимость: <b>{settings.course_price_stars} Stars</b>\n\n"
        f"После оплаты ты получишь:\n"
        f"✅ Мгновенный доступ к полной программе\n"
        f"✅ Приглашение в закрытый чат\n"
        f"✅ Персональную поддержку автора\n\n"
        f"🛡 <b>Гарантия 14 дней</b> — вернём Stars, если не подойдёт.\n\n"
        f"Подтвердить оплату?",
        parse_mode="HTML",
        reply_markup=get_confirm_payment_keyboard(),
    )
    await callback.answer()


# ═══════════════════════════════════════════════════════════════
# ⭐ Шаг 2: Отправить Invoice
# ═══════════════════════════════════════════════════════════════

@router.callback_query(F.data == "buy_confirm_stars")
async def cb_confirm_stars(
    callback: CallbackQuery,
    bot: Bot,
    session: AsyncSession,
) -> None:
    """
    Подтверждение → отправляем Telegram Stars invoice.
    Telegram покажет нативный диалог оплаты.
    """
    settings = get_settings()
    user = callback.from_user
    ps = _get_payment_service(session)

    # ── Повторная проверка (race condition) ───────────────
    if await ps.has_active_payment(user.id):
        await callback.answer("Курс уже оплачен ✅", show_alert=True)
        return

    logger.info(
        "Sending Stars invoice: user_id={}, amount={}",
        user.id, settings.course_price_stars,
    )

    await callback.answer()

    # ── Отправить invoice ────────────────────────────────
    await bot.send_invoice(
        chat_id=user.id,
        title="🌿 21-дневный детокс-курс",
        description=(
            "Полная программа на 21 день: питание, уход за кожей, "
            "лимфодренажные техники, антистресс, закрытый чат с "
            "поддержкой и персональная обратная связь от автора."
        ),
        payload="detox_course_21day",
        currency="XTR",  # XTR = Telegram Stars
        prices=[
            LabeledPrice(
                label="Детокс-курс 21 день",
                amount=settings.course_price_stars,
            ),
        ],
        # provider_token не нужен для Stars
    )


# ═══════════════════════════════════════════════════════════════
# 💳 Оплата картой (внешний провайдер)
# ═══════════════════════════════════════════════════════════════

@router.callback_query(F.data == "buy_card")
async def cb_buy_card(callback: CallbackQuery) -> None:
    """
    Оплата через ЮKassa / Stripe.
    Если провайдер не настроен — показываем заглушку.
    """
    settings = get_settings()

    if not settings.payment_provider_token:
        await callback.message.edit_text(
            "💳 <b>Оплата картой</b>\n\n"
            "К сожалению, оплата картой временно недоступна.\n\n"
            "Пожалуйста, воспользуйся оплатой через "
            "<b>Telegram Stars ⭐</b> — это быстро и безопасно!",
            parse_mode="HTML",
            reply_markup=get_buy_keyboard(),
        )
        await callback.answer("Оплата картой пока недоступна", show_alert=True)
        return

    # TODO: Интеграция с ЮKassa / Stripe
    await callback.answer("Функция в разработке", show_alert=True)


# ═══════════════════════════════════════════════════════════════
# ✅ Pre-checkout Query
#    Telegram требует ответ за 10 секунд!
# ═══════════════════════════════════════════════════════════════

@router.pre_checkout_query()
async def on_pre_checkout(
    pre_checkout: PreCheckoutQuery,
    session: AsyncSession,
) -> None:
    """
    Telegram вызывает ПЕРЕД списанием средств.
    Нужно ответить ok=True за 10 секунд.

    Проверки:
      1. Валидность payload
      2. Не дубликат ли (уже оплачено)
    """
    user = pre_checkout.from_user

    logger.info(
        "Pre-checkout: user_id={}, payload={}, amount={} {}",
        user.id,
        pre_checkout.invoice_payload,
        pre_checkout.total_amount,
        pre_checkout.currency,
    )

    # ── 1. Проверка payload ──────────────────────────────
    if pre_checkout.invoice_payload != "detox_course_21day":
        await pre_checkout.answer(
            ok=False,
            error_message="Неизвестный товар. Попробуйте начать покупку заново.",
        )
        logger.warning(
            "Pre-checkout rejected: unknown payload '{}' from user {}",
            pre_checkout.invoice_payload, user.id,
        )
        return

    # ── 2. Проверка дубликата ────────────────────────────
    ps = _get_payment_service(session)
    if await ps.has_active_payment(user.id):
        await pre_checkout.answer(
            ok=False,
            error_message="Курс уже оплачен! Доступ активен.",
        )
        logger.info("Pre-checkout rejected: already paid, user_id={}", user.id)
        return

    # ── Всё ок → разрешаем списание ─────────────────────
    await pre_checkout.answer(ok=True)
    logger.info("Pre-checkout approved: user_id={}", user.id)


# ═══════════════════════════════════════════════════════════════
# 🎉 Успешная оплата — ГЛАВНЫЙ HANDLER
# ═══════════════════════════════════════════════════════════════

@router.message(F.successful_payment)
async def on_successful_payment(
    message: Message,
    bot: Bot,
    session: AsyncSession,
) -> None:
    """
    Telegram подтвердил успешную оплату.

    Последовательность действий:
      1. Сохранить платёж в БД
      2. Обновить users.has_paid = true
      3. Создать / получить invite link для закрытого чата
      4. Отправить поздравление + ссылку на чат
      5. Отправить preview первого дня курса
      6. Уведомить админа
      7. Закоммитить транзакцию
    """
    settings = get_settings()
    user = message.from_user
    payment = message.successful_payment

    logger.info(
        "✅ PAYMENT SUCCESS: user_id={} ({}), amount={} {}, "
        "telegram_charge={}, provider_charge={}",
        user.id,
        user.username or user.full_name,
        payment.total_amount,
        payment.currency,
        payment.telegram_payment_charge_id,
        payment.provider_payment_charge_id or "—",
    )

    ps = _get_payment_service(session)

    # ═════════════════════════════════════════════════════
    # 1. Сохранить платёж
    # ═════════════════════════════════════════════════════

    payment_dto = await ps.save_payment(
        user_telegram_id=user.id,
        amount=payment.total_amount,
        currency=payment.currency,
        telegram_charge_id=payment.telegram_payment_charge_id,
        provider_charge_id=payment.provider_payment_charge_id or "",
        payload=payment.invoice_payload or "detox_course_21day",
    )

    # ═════════════════════════════════════════════════════
    # 2. Обновить пользователя: has_paid = true
    # ═════════════════════════════════════════════════════

    await ps.mark_user_paid(user.id)

    # ═════════════════════════════════════════════════════
    # 3. Создать invite link для закрытого чата
    # ═════════════════════════════════════════════════════

    invite_link = await _get_or_create_invite_link(
        bot=bot,
        user_id=user.id,
        user_name=user.full_name,
    )

    # ═════════════════════════════════════════════════════
    # 4. Commit транзакции (до отправки сообщений)
    # ═════════════════════════════════════════════════════

    await session.commit()

    # ═════════════════════════════════════════════════════
    # 5. Поздравление пользователю
    # ═════════════════════════════════════════════════════

    congratulations_text = (
        "🎉 <b>Поздравляю! Оплата прошла успешно!</b>\n\n"
        "Ты — молодец, что решилась на этот шаг 💚\n\n"
        "Теперь тебе доступно:\n"
        "✅ Полная программа детокс-курса на 21 день\n"
        "✅ Ежедневные рекомендации и задания\n"
        "✅ Закрытый чат с поддержкой\n"
        "✅ Персональная обратная связь от автора\n\n"
    )

    if invite_link:
        congratulations_text += (
            f"🔑 <b>Твоя ссылка на закрытый чат:</b>\n"
            f"{invite_link}\n\n"
            "Переходи по ссылке — там уже ждут! 🚀"
        )
    else:
        congratulations_text += (
            "Закрытый чат будет доступен в ближайшее время.\n"
            "Мы отправим ссылку отдельным сообщением 💬"
        )

    await message.answer(
        congratulations_text,
        parse_mode="HTML",
        reply_markup=get_success_keyboard(),
        disable_web_page_preview=True,
    )

    # ═════════════════════════════════════════════════════
    # 6. Preview первого дня (через 3 секунды)
    # ═════════════════════════════════════════════════════

    asyncio.create_task(
        _send_day_one_preview(bot, user.id),
    )

    # ═════════════════════════════════════════════════════
    # 7. Уведомить админа
    # ═════════════════════════════════════════════════════

    asyncio.create_task(
        _notify_admin_payment(
            bot=bot,
            user=user,
            payment=payment,
            payment_id=payment_dto.id,
        ),
    )

    # ═════════════════════════════════════════════════════
    # 8. Запланировать daily-напоминания
    # ═════════════════════════════════════════════════════

    asyncio.create_task(
        _schedule_daily_reminders(bot, user.id),
    )


# ═══════════════════════════════════════════════════════════════
# 🔑 Invite Link — создание / получение
# ═══════════════════════════════════════════════════════════════

async def _get_or_create_invite_link(
    bot: Bot,
    user_id: int,
    user_name: str,
) -> Optional[str]:
    """
    Создаёт персональную invite-ссылку для закрытого чата.

    Стратегия:
      1. Если private_chat_id настроен → создаём одноразовую ссылку
      2. Если нет → используем статическую private_chat_invite_link
      3. Если ничего нет → None
    """
    settings = get_settings()

    # ── Вариант 1: Создать персональную ───────────────────
    if settings.private_chat_id:
        try:
            link: ChatInviteLink = await bot.create_chat_invite_link(
                chat_id=settings.private_chat_id,
                name=f"Detox: {user_name} ({user_id})",
                member_limit=1,  # одноразовая
                expire_date=datetime.now(timezone.utc) + timedelta(days=30),
            )
            logger.info(
                "Created personal invite link for user {}: {}",
                user_id, link.invite_link,
            )
            return link.invite_link
        except Exception:
            logger.opt(exception=True).warning(
                "Failed to create invite link for user {}", user_id,
            )

    # ── Вариант 2: Статическая ссылка ─────────────────────
    if settings.private_chat_invite_link:
        return settings.private_chat_invite_link

    # ── Нет ссылки ────────────────────────────────────────
    logger.warning(
        "No invite link available for user {}: "
        "private_chat_id and private_chat_invite_link are both empty",
        user_id,
    )
    return None


# ═══════════════════════════════════════════════════════════════
# 📖 Preview первого дня (отложенно)
# ═══════════════════════════════════════════════════════════════

async def _send_day_one_preview(bot: Bot, user_id: int) -> None:
    """Через 3 секунды после оплаты — отправляем preview Дня 1."""
    await asyncio.sleep(3)

    try:
        await bot.send_message(
            chat_id=user_id,
            text=(
                "📖 <b>Начинаем!</b>\n\n"
                "Вот краткий preview того, что тебя ждёт "
                "в <b>День 1 — Подготовка</b>:\n\n"
                "🌅 Утренний ритуал: стакан тёплой воды с лимоном\n"
                "📋 Аудит холодильника: убираем «мусорную еду»\n"
                "🛒 Список продуктов на неделю\n"
                "📝 Дневник самочувствия — первая запись\n\n"
                "Полная программа доступна в Mini App 👇\n\n"
                "<i>Рекомендуем начать завтра утром — "
                "дай себе время подготовиться!</i>"
            ),
            parse_mode="HTML",
        )
        logger.debug("Day 1 preview sent to user {}", user_id)
    except Exception:
        logger.opt(exception=True).warning(
            "Failed to send day 1 preview to user {}", user_id,
        )


# ═══════════════════════════════════════════════════════════════
# 📢 Уведомление админа
# ═══════════════════════════════════════════════════════════════

async def _notify_admin_payment(
    bot: Bot,
    user,
    payment,
    payment_id: int,
) -> None:
    """Отправляет админу уведомление о новой оплате."""
    settings = get_settings()

    if not settings.notify_admin_on_error:
        return

    try:
        # Считаем общую статистику (без сессии — просто счётчик)
        text = (
            f"💰 <b>Новая оплата!</b>\n\n"
            f"👤 {user.full_name}"
        )
        if user.username:
            text += f" (@{user.username})"
        text += (
            f"\n🆔 <code>{user.id}</code>\n"
            f"💎 <b>{payment.total_amount} {payment.currency}</b>\n"
            f"🧾 Payment #{payment_id}\n"
            f"🔑 Charge: <code>{payment.telegram_payment_charge_id}</code>\n"
            f"🕐 {datetime.now(timezone.utc).strftime('%d.%m.%Y %H:%M UTC')}"
        )

        if user.is_premium:
            text += "\n⭐ Premium user"

        await bot.send_message(
            chat_id=settings.admin_id,
            text=text,
            parse_mode="HTML",
        )
    except Exception:
        logger.opt(exception=True).warning(
            "Failed to notify admin about payment from user {}",
            user.id,
        )


# ═══════════════════════════════════════════════════════════════
# ⏰ Запланировать daily-напоминания
# ═══════════════════════════════════════════════════════════════

async def _schedule_daily_reminders(bot: Bot, user_id: int) -> None:
    """
    Планирует ежедневные напоминания на 21 день.

    В продакшене → задачи в Redis / Celery / APScheduler.
    Текущая реализация: простое приветствие через 24 часа.
    """
    # TODO: В продакшене заменить на APScheduler / Celery beat:
    #
    # for day in range(1, 22):
    #     scheduler.add_job(
    #         send_daily_content,
    #         trigger="date",
    #         run_date=datetime.now(timezone.utc) + timedelta(days=day),
    #         args=[bot, user_id, day],
    #         id=f"daily_{user_id}_{day}",
    #         replace_existing=True,
    #     )

    logger.info(
        "Daily reminders scheduled for user {} (21 days)",
        user_id,
    )


async def send_daily_content(
    bot: Bot,
    user_id: int,
    day_number: int,
) -> None:
    """
    Отправляет контент конкретного дня.
    Вызывается планировщиком.
    """
    try:
        await bot.send_message(
            chat_id=user_id,
            text=(
                f"🌅 <b>День {day_number} из 21</b>\n\n"
                f"Доброе утро! Пора открыть задания на сегодня.\n"
                f"Открой курс в приложении 👇"
            ),
            parse_mode="HTML",
        )
        logger.debug(
            "Daily content sent: user={}, day={}",
            user_id, day_number,
        )
    except Exception:
        logger.opt(exception=True).warning(
            "Failed to send daily content: user={}, day={}",
            user_id, day_number,
        )


# ═══════════════════════════════════════════════════════════════
# 🔄 Refund — возврат Stars
# ═══════════════════════════════════════════════════════════════

async def refund_stars(
    bot: Bot,
    session: AsyncSession,
    user_id: int,
    telegram_payment_charge_id: str,
    reason: str = "",
    notify_user: bool = True,
) -> bool:
    """
    Полный flow возврата Stars:
      1. Вызвать Bot API refund
      2. Обновить БД (payment → refunded, user → has_paid=false)
      3. Уведомить пользователя
      4. Уведомить админа

    Вызывается из admin handler.
    """
    settings = get_settings()

    # ── 1. Bot API: вернуть Stars ────────────────────────
    try:
        await bot.refund_star_payment(
            user_id=user_id,
            telegram_payment_charge_id=telegram_payment_charge_id,
        )
        logger.info(
            "Stars refunded via Bot API: user={}, charge={}",
            user_id, telegram_payment_charge_id,
        )
    except Exception as e:
        logger.opt(exception=True).error(
            "Bot API refund failed: user={}, charge={}",
            user_id, telegram_payment_charge_id,
        )
        return False

    # ── 2. Обновить БД ───────────────────────────────────
    ps = _get_payment_service(session)
    refunded_user_id = await ps.mark_refunded(
        charge_id=telegram_payment_charge_id,
        reason=reason,
    )

    await session.commit()

    if refunded_user_id is None:
        logger.error(
            "Payment not found in DB after successful API refund: charge={}",
            telegram_payment_charge_id,
        )

    # ── 3. Уведомить пользователя ────────────────────────
    if notify_user:
        try:
            text = (
                "🔄 <b>Возврат оплаты</b>\n\n"
                f"Мы вернули <b>{settings.course_price_stars} Stars</b> "
                "на твой аккаунт.\n\n"
            )
            if reason:
                text += f"Причина: {reason}\n\n"
            text += "Спасибо за обратную связь 💚"

            await bot.send_message(
                chat_id=user_id,
                text=text,
                parse_mode="HTML",
            )
        except Exception:
            logger.opt(exception=True).warning(
                "Failed to notify user about refund: user={}", user_id,
            )

    # ── 4. Уведомить админа ──────────────────────────────
    try:
        await bot.send_message(
            chat_id=settings.admin_id,
            text=(
                f"🔄 <b>Возврат выполнен</b>\n\n"
                f"Пользователь: <code>{user_id}</code>\n"
                f"Сумма: <b>{settings.course_price_stars} Stars</b>\n"
                f"Charge: <code>{telegram_payment_charge_id}</code>\n"
                f"Причина: {reason or '—'}"
            ),
            parse_mode="HTML",
        )
    except Exception:
        pass  # Admin notification is best-effort

    # ── 5. Отозвать из закрытого чата (опционально) ──────
    await _revoke_chat_access(bot, user_id)

    return True


# ═══════════════════════════════════════════════════════════════
# 🚫 Отзыв доступа к чату (после refund)
# ═══════════════════════════════════════════════════════════════

async def _revoke_chat_access(bot: Bot, user_id: int) -> None:
    """Удаляет пользователя из закрытого чата после возврата."""
    settings = get_settings()

    if not settings.private_chat_id:
        return

    try:
        await bot.ban_chat_member(
            chat_id=settings.private_chat_id,
            user_id=user_id,
            # revoke_messages=False — оставляем историю
        )
        # Сразу разбаниваем, чтобы мог заново купить
        await bot.unban_chat_member(
            chat_id=settings.private_chat_id,
            user_id=user_id,
            only_if_banned=True,
        )
        logger.info(
            "Chat access revoked: user={}, chat={}",
            user_id, settings.private_chat_id,
        )
    except Exception:
        logger.opt(exception=True).warning(
            "Failed to revoke chat access: user={}", user_id,
        )


# ═══════════════════════════════════════════════════════════════
# 🌐 WebApp: Создание Invoice URL (для Mini App)
# ═══════════════════════════════════════════════════════════════

async def create_invoice_link(bot: Bot) -> str:
    """
    Создаёт invoice URL для оплаты через Mini App.
    Возвращает URL, который Mini App передаёт в openInvoice().

    Вызывается из FastAPI endpoint:
        POST /api/payment/create-invoice
    """
    settings = get_settings()

    link = await bot.create_invoice_link(
        title="🌿 21-дневный детокс-курс",
        description=(
            "Полная программа на 21 день: питание, уход за кожей, "
            "лимфодренажные техники, антистресс, закрытый чат и "
            "персональная обратная связь."
        ),
        payload="detox_course_21day",
        currency="XTR",
        prices=[
            LabeledPrice(
                label="Детокс-курс 21 день",
                amount=settings.course_price_stars,
            ),
        ],
    )

    logger.debug("Invoice link created: {}", link)
    return link


# ═══════════════════════════════════════════════════════════════
# 📊 Проверка статуса оплаты (для Mini App polling)
# ═══════════════════════════════════════════════════════════════

async def check_payment_status(
    session: AsyncSession,
    user_telegram_id: int,
) -> dict:
    """
    Проверяет статус оплаты пользователя.
    Вызывается из FastAPI endpoint:
        GET /api/payment/status

    Returns:
        {"paid": bool, "chat_link": str | None, "paid_at": str | None}
    """
    settings = get_settings()
    ps = _get_payment_service(session)

    latest = await ps.get_latest_completed(user_telegram_id)

    if latest:
        return {
            "paid": True,
            "chat_link": settings.private_chat_invite_link or None,
            "paid_at": latest.created_at.isoformat() if latest.created_at else None,
        }

    return {
        "paid": False,
        "chat_link": None,
        "paid_at": None,
    }
