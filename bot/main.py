# -*- coding: utf-8 -*-
"""
🌿 Detox Course Bot — Точка входа.

Запуск:
  python -m main          (из директории bot/)
  python bot/main.py      (из корня проекта)

Что происходит при старте:
  1. Загружаются настройки из .env
  2. Настраивается логирование (loguru)
  3. Создаётся бот (aiogram Bot) + диспетчер (Dispatcher)
  4. Регистрируются middleware (auth, throttle)
  5. Подключаются все роутеры (handlers)
  6. Устанавливаются команды бота и Menu Button
  7. Уведомляется администратор о запуске
  8. Бот стартует в режиме polling
"""

from __future__ import annotations

import asyncio
import sys

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from loguru import logger

from bot.config import get_settings
from bot.handlers import get_all_routers
from bot.middlewares import AuthMiddleware, ThrottleMiddleware
from bot.utils.telegram import set_bot_commands, set_menu_button, notify_admin


def setup_logging() -> None:
    """Настройка loguru: формат, уровень, ротация."""
    settings = get_settings()

    # Убираем стандартный handler
    logger.remove()

    # Консольный вывод с цветами
    logger.add(
        sys.stderr,
        level=settings.log_level,
        format=(
            "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
            "<level>{message}</level>"
        ),
        colorize=True,
    )

    # Файловый лог с ротацией (в Docker пишется в stdout, но на всякий случай)
    logger.add(
        "logs/bot_{time:YYYY-MM-DD}.log",
        level="DEBUG",
        rotation="1 day",
        retention="30 days",
        compression="gz",
        encoding="utf-8",
    )


def create_bot() -> Bot:
    """Создаёт экземпляр aiogram Bot."""
    settings = get_settings()

    return Bot(
        token=settings.bot_token,
        default=DefaultBotProperties(
            parse_mode=ParseMode.HTML,
            link_preview_is_disabled=True,
        ),
    )


def create_dispatcher() -> Dispatcher:
    """
    Создаёт Dispatcher и подключает:
      - Middleware (auth, throttle)
      - Все роутеры (handlers)
    """
    dp = Dispatcher()

    # ── Middleware ────────────────────────────────────────
    # Порядок: throttle → auth → handler
    dp.message.middleware(ThrottleMiddleware(rate_limit=0.5))
    dp.callback_query.middleware(ThrottleMiddleware(rate_limit=0.3))
    dp.message.middleware(AuthMiddleware())
    dp.callback_query.middleware(AuthMiddleware())

    # ── Роутеры ──────────────────────────────────────────
    root_router = get_all_routers()
    dp.include_router(root_router)

    return dp


async def on_startup(bot: Bot) -> None:
    """
    Вызывается при запуске бота.
    Устанавливает команды, меню и уведомляет админа.
    """
    settings = get_settings()

    # Устанавливаем команды бота
    await set_bot_commands(bot)

    # Устанавливаем Menu Button (WebApp)
    await set_menu_button(bot)

    # Получаем информацию о боте
    bot_info = await bot.get_me()

    logger.info(
        "🌿 Bot started: @{} (id={})",
        bot_info.username,
        bot_info.id,
    )

    # Уведомляем админа
    if settings.notify_admin_on_error:
        await notify_admin(
            bot,
            (
                f"🟢 <b>Бот запущен!</b>\n\n"
                f"Бот: @{bot_info.username}\n"
                f"ID: <code>{bot_info.id}</code>\n"
                f"Mini App: {settings.webapp_url}"
            ),
        )


async def on_shutdown(bot: Bot) -> None:
    """Вызывается при остановке бота."""
    settings = get_settings()

    logger.info("🔴 Bot shutting down...")

    if settings.notify_admin_on_error:
        await notify_admin(bot, "🔴 <b>Бот остановлен.</b>")


async def main() -> None:
    """Главная async-функция запуска."""
    # Логирование
    setup_logging()

    # Проверяем конфигурацию
    settings = get_settings()
    logger.info("Config loaded: admin_id={}", settings.admin_id)

    # Создаём бот и диспетчер
    bot = create_bot()
    dp = create_dispatcher()

    # Lifecycle hooks
    dp.startup.register(on_startup)
    dp.shutdown.register(on_shutdown)

    # Создаём папку для логов
    import os
    os.makedirs("logs", exist_ok=True)

    # Запускаем polling
    logger.info("Starting polling...")
    try:
        await dp.start_polling(
            bot,
            # Пропускаем накопившиеся апдейты при перезапуске
            allowed_updates=[
                "message",
                "callback_query",
                "pre_checkout_query",
                "my_chat_member",
            ],
        )
    finally:
        await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
