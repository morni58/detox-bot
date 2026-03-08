# -*- coding: utf-8 -*-
"""
🌿 Inline-клавиатуры бота.

Все кнопки используют callback_data с префиксами:
  • start_*   — стартовый флоу
  • course_*  — информация о курсе
  • buy_*     — покупка
  • admin_*   — админ-панель
  • nav_*     — навигация
"""

from __future__ import annotations

from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder

from bot.config import get_settings


# ═══════════════════════════════════════════════════════════
# 🚀 /start — Главная клавиатура
# ═══════════════════════════════════════════════════════════

def get_start_keyboard() -> InlineKeyboardMarkup:
    """
    Клавиатура приветственного сообщения /start.

    Кнопки:
      1. ✨ Открыть детокс-курс   → WebApp (Mini App)
      2. 📋 О курсе               → callback: course_info
      3. 💬 Задать вопрос          → callback: start_question
      4. 👩‍⚕️ Об авторе              → callback: start_about
    """
    settings = get_settings()
    builder = InlineKeyboardBuilder()

    # Ряд 1: главная CTA — открывает Mini App (полноэкранное)
    builder.row(
        InlineKeyboardButton(
            text="✨ Открыть детокс-курс",
            web_app=WebAppInfo(url=settings.webapp_url),
        )
    )

    # Ряд 2: информация о курсе
    builder.row(
        InlineKeyboardButton(
            text="📋 О курсе",
            callback_data="course_info",
        )
    )

    # Ряд 3: две кнопки в строку
    builder.row(
        InlineKeyboardButton(
            text="💬 Задать вопрос",
            callback_data="start_question",
        ),
        InlineKeyboardButton(
            text="👩‍⚕️ Об авторе",
            callback_data="start_about",
        ),
    )

    return builder.as_markup()


# ═══════════════════════════════════════════════════════════
# 📋 Информация о курсе
# ═══════════════════════════════════════════════════════════

def get_course_info_keyboard() -> InlineKeyboardMarkup:
    """
    Клавиатура блока «О курсе».

    Кнопки:
      1. 🌿 Программа 21 дня   → callback: course_program
      2. 📸 Результаты клиенток → callback: course_results
      3. 💰 Стоимость и условия → callback: course_price
      4. ✨ Купить курс          → WebApp (Mini App с якорем #buy)
      5. ← Назад               → callback: nav_back_start
    """
    settings = get_settings()
    builder = InlineKeyboardBuilder()

    builder.row(
        InlineKeyboardButton(
            text="🌿 Программа 21 дня",
            callback_data="course_program",
        )
    )
    builder.row(
        InlineKeyboardButton(
            text="📸 Результаты клиенток",
            callback_data="course_results",
        ),
    )
    builder.row(
        InlineKeyboardButton(
            text="💰 Стоимость и условия",
            callback_data="course_price",
        ),
    )
    builder.row(
        InlineKeyboardButton(
            text="✨ Купить курс",
            web_app=WebAppInfo(url=f"{settings.webapp_url}#buy"),
        ),
    )
    builder.row(
        InlineKeyboardButton(
            text="← Назад",
            callback_data="nav_back_start",
        ),
    )

    return builder.as_markup()


# ═══════════════════════════════════════════════════════════
# 💰 Покупка курса
# ═══════════════════════════════════════════════════════════

def get_buy_keyboard() -> InlineKeyboardMarkup:
    """
    Клавиатура покупки (показывается после описания цены).

    Кнопки:
      1. ⭐ Оплатить {N} Stars        → callback: buy_stars
      2. 💳 Оплатить картой            → callback: buy_card
      3. ← Назад                       → callback: nav_back_course
    """
    settings = get_settings()
    builder = InlineKeyboardBuilder()

    builder.row(
        InlineKeyboardButton(
            text=f"⭐ Оплатить {settings.course_price_stars} Stars",
            callback_data="buy_stars",
        )
    )
    builder.row(
        InlineKeyboardButton(
            text="💳 Оплатить картой",
            callback_data="buy_card",
        )
    )
    builder.row(
        InlineKeyboardButton(
            text="← Назад",
            callback_data="nav_back_course",
        )
    )

    return builder.as_markup()


def get_confirm_payment_keyboard() -> InlineKeyboardMarkup:
    """
    Подтверждение перед оплатой Stars.

    Кнопки:
      1. ✅ Подтвердить оплату → callback: buy_confirm_stars
      2. ✖ Отмена              → callback: nav_back_course
    """
    builder = InlineKeyboardBuilder()

    builder.row(
        InlineKeyboardButton(
            text="✅ Подтвердить оплату",
            callback_data="buy_confirm_stars",
        )
    )
    builder.row(
        InlineKeyboardButton(
            text="✖ Отмена",
            callback_data="nav_back_course",
        )
    )

    return builder.as_markup()


def get_success_keyboard() -> InlineKeyboardMarkup:
    """
    Клавиатура после успешной оплаты.

    Кнопки:
      1. 🎉 Перейти в закрытый чат → url (invite link)
      2. 🌿 Открыть курс            → WebApp
    """
    settings = get_settings()
    builder = InlineKeyboardBuilder()

    if settings.private_chat_invite_link:
        builder.row(
            InlineKeyboardButton(
                text="🎉 Перейти в закрытый чат",
                url=settings.private_chat_invite_link,
            )
        )

    builder.row(
        InlineKeyboardButton(
            text="🌿 Открыть курс",
            web_app=WebAppInfo(url=f"{settings.webapp_url}#course"),
        )
    )

    return builder.as_markup()


# ═══════════════════════════════════════════════════════════
# 🔧 Админ-панель
# ═══════════════════════════════════════════════════════════

def get_admin_keyboard() -> InlineKeyboardMarkup:
    """
    Главная клавиатура админки (бот-часть).

    Кнопки:
      1. 📊 Статистика         → callback: admin_stats
      2. 👥 Пользователи       → callback: admin_users
      3. 💰 Платежи            → callback: admin_payments
      4. 📢 Рассылка           → callback: admin_broadcast
      5. ⚙️ Открыть админку     → WebApp (Mini App #admin)
    """
    settings = get_settings()
    builder = InlineKeyboardBuilder()

    builder.row(
        InlineKeyboardButton(
            text="📊 Статистика",
            callback_data="admin_stats",
        ),
        InlineKeyboardButton(
            text="👥 Пользователи",
            callback_data="admin_users",
        ),
    )
    builder.row(
        InlineKeyboardButton(
            text="💰 Платежи",
            callback_data="admin_payments",
        ),
        InlineKeyboardButton(
            text="📢 Рассылка",
            callback_data="admin_broadcast",
        ),
    )
    builder.row(
        InlineKeyboardButton(
            text="⚙️ Открыть админку",
            web_app=WebAppInfo(url=f"{settings.webapp_url}#admin"),
        )
    )

    return builder.as_markup()


# ═══════════════════════════════════════════════════════════
# 🧭 Навигация (переиспользуемые)
# ═══════════════════════════════════════════════════════════

def get_back_keyboard(callback_data: str = "nav_back_start") -> InlineKeyboardMarkup:
    """Универсальная кнопка «Назад»."""
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(text="← Назад", callback_data=callback_data)
    )
    return builder.as_markup()
