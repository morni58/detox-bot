# -*- coding: utf-8 -*-
"""
🌿 Handlers: Админ-панель.

Доступ: только для user_id == ADMIN_ID.

Обрабатывает:
  • /admin             — главная панель
  • admin_stats        — статистика
  • admin_users        — список пользователей
  • admin_payments     — история платежей
  • admin_broadcast    — рассылка
  • /refund <charge>   — возврат Stars
"""

from __future__ import annotations

from datetime import datetime, timezone

from aiogram import Router, F, Bot
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery
from loguru import logger

from bot.config import get_settings
from bot.keyboards.inline import (
    get_admin_keyboard,
    get_back_keyboard,
)
from bot.handlers.payment import refund_stars

router = Router(name="admin")


# ═══════════════════════════════════════════════════════════
# 🔒 Фильтр: только администратор
# ═══════════════════════════════════════════════════════════

class AdminFilter:
    """Пропускает только сообщения/callback от администратора."""

    async def __call__(self, event: Message | CallbackQuery) -> bool:
        settings = get_settings()
        user = event.from_user
        return user is not None and settings.is_admin(user.id)


# Применяем фильтр ко всему роутеру
router.message.filter(AdminFilter())
router.callback_query.filter(AdminFilter())


# ═══════════════════════════════════════════════════════════
# /admin — Главная панель
# ═══════════════════════════════════════════════════════════

@router.message(Command("admin"))
async def cmd_admin(message: Message) -> None:
    """Главное меню админки (через бота)."""
    now = datetime.now(timezone.utc).strftime("%d.%m.%Y %H:%M UTC")

    await message.answer(
        f"⚙️ <b>Панель администратора</b>\n\n"
        f"🕐 Сервер: {now}\n\n"
        f"Выбери раздел:",
        parse_mode="HTML",
        reply_markup=get_admin_keyboard(),
    )


# ═══════════════════════════════════════════════════════════
# 📊 Статистика
# ═══════════════════════════════════════════════════════════

@router.callback_query(F.data == "admin_stats")
async def cb_admin_stats(callback: CallbackQuery) -> None:
    """
    Показывает статистику бота.
    TODO: реальные данные из БД.
    """
    # TODO: заменить заглушки на реальные запросы к БД
    # users_total = await user_service.count_all()
    # users_today = await user_service.count_today()
    # payments_total = await payment_service.count_all()
    # revenue_total = await payment_service.sum_revenue()

    stats_text = (
        "📊 <b>Статистика</b>\n\n"
        "👥 <b>Пользователи:</b>\n"
        "  Всего: <code>—</code>\n"
        "  Сегодня: <code>—</code>\n"
        "  За неделю: <code>—</code>\n\n"
        "💰 <b>Платежи:</b>\n"
        "  Всего оплат: <code>—</code>\n"
        "  Выручка: <code>— Stars</code>\n"
        "  Возвратов: <code>—</code>\n\n"
        "📱 <b>Mini App:</b>\n"
        "  Открытий: <code>—</code>\n"
        "  Квиз пройден: <code>—</code>\n\n"
        "<i>Данные обновятся после подключения БД</i>"
    )

    await callback.message.edit_text(
        stats_text,
        parse_mode="HTML",
        reply_markup=get_back_keyboard("admin_back_main"),
    )
    await callback.answer()


# ═══════════════════════════════════════════════════════════
# 👥 Пользователи
# ═══════════════════════════════════════════════════════════

@router.callback_query(F.data == "admin_users")
async def cb_admin_users(callback: CallbackQuery) -> None:
    """
    Список последних пользователей.
    TODO: пагинация + реальные данные.
    """
    # TODO: реальный запрос
    # users = await user_service.get_recent(limit=10)

    text = (
        "👥 <b>Пользователи</b>\n\n"
        "<i>Последние 10 пользователей будут "
        "показаны после подключения БД.</i>\n\n"
        "Для полного управления пользователями "
        "откройте админку в Mini App ⚙️"
    )

    await callback.message.edit_text(
        text,
        parse_mode="HTML",
        reply_markup=get_back_keyboard("admin_back_main"),
    )
    await callback.answer()


# ═══════════════════════════════════════════════════════════
# 💰 Платежи
# ═══════════════════════════════════════════════════════════

@router.callback_query(F.data == "admin_payments")
async def cb_admin_payments(callback: CallbackQuery) -> None:
    """
    Последние платежи.
    TODO: реальные данные.
    """
    text = (
        "💰 <b>Платежи</b>\n\n"
        "<i>История платежей будет доступна "
        "после подключения БД.</i>\n\n"
        "Для управления платежами и возвратами "
        "откройте админку в Mini App ⚙️\n\n"
        "Для возврата Stars используйте команду:\n"
        "<code>/refund CHARGE_ID USER_ID</code>"
    )

    await callback.message.edit_text(
        text,
        parse_mode="HTML",
        reply_markup=get_back_keyboard("admin_back_main"),
    )
    await callback.answer()


# ═══════════════════════════════════════════════════════════
# 📢 Рассылка
# ═══════════════════════════════════════════════════════════

@router.callback_query(F.data == "admin_broadcast")
async def cb_admin_broadcast(callback: CallbackQuery) -> None:
    """
    Рассылка сообщений пользователям.
    Пока — инструкция. Полная реализация — через FSM.
    """
    text = (
        "📢 <b>Рассылка</b>\n\n"
        "Для массовой рассылки используйте команду:\n\n"
        "<code>/broadcast</code>\n\n"
        "После этого отправьте сообщение "
        "(текст, фото или видео), которое "
        "будет разослано всем пользователям.\n\n"
        "⚠️ <b>Внимание:</b> рассылка необратима!"
    )

    await callback.message.edit_text(
        text,
        parse_mode="HTML",
        reply_markup=get_back_keyboard("admin_back_main"),
    )
    await callback.answer()


# ═══════════════════════════════════════════════════════════
# 🔄 Возврат Stars
# ═══════════════════════════════════════════════════════════

@router.message(Command("refund"))
async def cmd_refund(message: Message, bot: Bot) -> None:
    """
    Возврат Stars.

    Формат: /refund <telegram_payment_charge_id> <user_id>

    Пример:
      /refund abc123charge456 987654321
    """
    parts = message.text.split()

    if len(parts) != 3:
        await message.answer(
            "❌ <b>Неверный формат</b>\n\n"
            "Используй:\n"
            "<code>/refund CHARGE_ID USER_ID</code>\n\n"
            "Пример:\n"
            "<code>/refund abc123charge456 987654321</code>",
            parse_mode="HTML",
        )
        return

    charge_id = parts[1]
    try:
        user_id = int(parts[2])
    except ValueError:
        await message.answer(
            "❌ USER_ID должен быть числом.",
            parse_mode="HTML",
        )
        return

    await message.answer("⏳ Выполняю возврат...")

    success = await refund_stars(bot, user_id, charge_id)

    if success:
        await message.answer(
            f"✅ <b>Возврат выполнен</b>\n\n"
            f"User ID: <code>{user_id}</code>\n"
            f"Charge ID: <code>{charge_id}</code>",
            parse_mode="HTML",
        )
    else:
        await message.answer(
            f"❌ <b>Ошибка возврата</b>\n\n"
            f"Проверь charge_id и user_id.\n"
            f"Подробности в логах.",
            parse_mode="HTML",
        )


# ═══════════════════════════════════════════════════════════
# 🧭 Навигация — назад в админку
# ═══════════════════════════════════════════════════════════

@router.callback_query(F.data == "admin_back_main")
async def cb_admin_back(callback: CallbackQuery) -> None:
    """Возврат к главной панели админки."""
    now = datetime.now(timezone.utc).strftime("%d.%m.%Y %H:%M UTC")

    await callback.message.edit_text(
        f"⚙️ <b>Панель администратора</b>\n\n"
        f"🕐 Сервер: {now}\n\n"
        f"Выбери раздел:",
        parse_mode="HTML",
        reply_markup=get_admin_keyboard(),
    )
    await callback.answer()
