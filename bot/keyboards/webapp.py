# -*- coding: utf-8 -*-
"""
🌿 WebApp-клавиатуры.

Включают Menu Button (кнопка слева от поля ввода)
и reply-клавиатуру с WebApp-кнопкой.
"""

from __future__ import annotations

from aiogram.types import (
    MenuButtonWebApp,
    WebAppInfo,
    ReplyKeyboardMarkup,
    KeyboardButton,
)

from bot.config import get_settings


def get_webapp_menu_button() -> MenuButtonWebApp:
    """
    Menu Button — кнопка «☰» слева от поля ввода.
    Открывает Mini App в полноэкранном режиме.

    Настраивается один раз при старте бота через:
      await bot.set_chat_menu_button(menu_button=get_webapp_menu_button())
    """
    settings = get_settings()

    return MenuButtonWebApp(
        text="🌿 Детокс-курс",
        web_app=WebAppInfo(url=settings.webapp_url),
    )


def get_webapp_keyboard() -> ReplyKeyboardMarkup:
    """
    Reply-клавиатура с кнопкой открытия Mini App.
    Используется как альтернатива для пользователей,
    которые не видят inline-кнопки.

    Кнопка:
      🌿 Открыть детокс-курс → WebApp
    """
    settings = get_settings()

    return ReplyKeyboardMarkup(
        keyboard=[
            [
                KeyboardButton(
                    text="🌿 Открыть детокс-курс",
                    web_app=WebAppInfo(url=settings.webapp_url),
                )
            ]
        ],
        resize_keyboard=True,
        one_time_keyboard=False,
        input_field_placeholder="Нажмите кнопку ниже ↓",
    )
