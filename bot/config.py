# -*- coding: utf-8 -*-
"""
🌿 Detox Course Bot — Конфигурация.
Все настройки загружаются из .env через pydantic-settings.
"""

from __future__ import annotations

from pathlib import Path
from functools import lru_cache

from pydantic import Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Главный конфиг приложения. Источник — .env / переменные окружения."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── Telegram Bot ─────────────────────────────────────────
    bot_token: str = Field(..., description="Токен от @BotFather")
    admin_id: int = Field(..., description="Telegram ID администратора")
    webapp_url: str = Field("https://localhost:5173", description="URL Mini App")

    # ── Database ─────────────────────────────────────────────
    database_url: str = Field(
        "postgresql+asyncpg://detox_admin:password@localhost:5432/detox_course",
        description="Async DSN для SQLAlchemy",
    )

    # ── Redis ────────────────────────────────────────────────
    redis_url: str = Field(
        "redis://localhost:6379/0",
        description="URL Redis для FSM + кеша",
    )

    # ── Оплата ───────────────────────────────────────────────
    payment_provider_token: str = Field("", description="Токен платёжного провайдера")
    course_price_stars: int = Field(1500, description="Цена курса в Telegram Stars")

    # ── Закрытый чат ─────────────────────────────────────────
    private_chat_invite_link: str = Field("", description="Invite-ссылка")
    private_chat_id: int = Field(0, description="ID закрытого чата")

    # ── Файлы ────────────────────────────────────────────────
    upload_dir: Path = Field(Path("/app/uploads"), description="Директория загрузок")
    max_upload_size_mb: int = Field(10)

    # ── Безопасность ─────────────────────────────────────────
    secret_key: str = Field("dev-secret-change-me")
    cors_origins: str = Field("https://web.telegram.org")

    # ── Логирование ──────────────────────────────────────────
    log_level: str = Field("INFO")
    notify_admin_on_error: bool = Field(True)

    # ── Helpers ──────────────────────────────────────────────
    @computed_field
    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    def is_admin(self, user_id: int) -> bool:
        return user_id == self.admin_id


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Singleton-фабрика (кешируется навсегда)."""
    return Settings()  # type: ignore[call-arg]
