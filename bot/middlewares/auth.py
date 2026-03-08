# -*- coding: utf-8 -*-
"""
🌿 Middleware: авторизация.

Проверяет и парсит initData из Telegram WebApp для API-запросов.
Для обычных сообщений бота — пропускает без проверки.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import time
from typing import Any, Callable, Awaitable
from urllib.parse import parse_qs, unquote

from aiogram import BaseMiddleware
from aiogram.types import TelegramObject
from loguru import logger

from bot.config import get_settings


class AuthMiddleware(BaseMiddleware):
    """
    Middleware для aiogram.
    Добавляет в data:
      • is_admin: bool — является ли пользователь админом
    """

    async def __call__(
        self,
        handler: Callable[[TelegramObject, dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: dict[str, Any],
    ) -> Any:
        settings = get_settings()
        user = data.get("event_from_user")

        # Определяем admin-статус
        data["is_admin"] = (
            user is not None and settings.is_admin(user.id)
        )

        return await handler(event, data)


def validate_webapp_init_data(
    init_data: str,
    bot_token: str,
    *,
    max_age_seconds: int = 86400,
) -> dict[str, Any] | None:
    """
    Валидация initData от Telegram Mini App (для FastAPI).

    Алгоритм (Telegram Bot API 9.4):
      1. Парсим query string
      2. Извлекаем hash
      3. Сортируем остальные параметры
      4. HMAC-SHA256(WebAppData, sorted_params) == hash

    Args:
        init_data: Raw initData string от Telegram.
        bot_token: Токен бота.
        max_age_seconds: Максимальный возраст данных (по умолчанию 24ч).

    Returns:
        Распарсенные данные или None, если невалидно.
    """
    try:
        parsed = parse_qs(init_data, keep_blank_values=True)

        # Извлекаем hash
        received_hash = parsed.pop("hash", [None])[0]
        if not received_hash:
            return None

        # Проверяем время (auth_date)
        auth_date_str = parsed.get("auth_date", [None])[0]
        if auth_date_str:
            auth_date = int(auth_date_str)
            if time.time() - auth_date > max_age_seconds:
                logger.debug("initData expired: auth_date={}", auth_date)
                return None

        # Собираем data-check-string
        # Каждый параметр: key=value, отсортированные по key
        data_check_parts = []
        for key in sorted(parsed.keys()):
            values = parsed[key]
            value = values[0] if values else ""
            data_check_parts.append(f"{key}={value}")

        data_check_string = "\n".join(data_check_parts)

        # HMAC: secret_key = HMAC_SHA256("WebAppData", bot_token)
        secret_key = hmac.new(
            b"WebAppData",
            bot_token.encode("utf-8"),
            hashlib.sha256,
        ).digest()

        # Вычисляем хеш
        computed_hash = hmac.new(
            secret_key,
            data_check_string.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(computed_hash, received_hash):
            logger.debug("initData hash mismatch")
            return None

        # Парсим user JSON
        result: dict[str, Any] = {}
        for key, values in parsed.items():
            value = values[0] if values else ""
            if key == "user":
                result[key] = json.loads(unquote(value))
            else:
                result[key] = value

        result["hash"] = received_hash
        return result

    except Exception:
        logger.opt(exception=True).debug("initData validation failed")
        return None
