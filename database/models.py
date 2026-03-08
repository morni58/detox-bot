# -*- coding: utf-8 -*-
"""
🌿 Detox Course — SQLAlchemy Models (async).
Зеркало schema.sql для использования в Python (bot + API).

Использование:
    from database.models import User, Payment, ...
    from database.models import async_engine, async_session
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    SmallInteger,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.asyncio import (
    AsyncAttrs,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
)


# ═══════════════════════════════════════════════════════════
# Base
# ═══════════════════════════════════════════════════════════

class Base(AsyncAttrs, DeclarativeBase):
    """Базовый класс для всех моделей."""
    pass


# ═══════════════════════════════════════════════════════════
# 1. Users
# ═══════════════════════════════════════════════════════════

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    telegram_id: Mapped[int] = mapped_column(BigInteger, unique=True, nullable=False)
    username: Mapped[Optional[str]] = mapped_column(String(64))
    first_name: Mapped[str] = mapped_column(String(128), default="")
    last_name: Mapped[Optional[str]] = mapped_column(String(128))
    language_code: Mapped[str] = mapped_column(String(10), default="ru")
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)

    has_paid: Mapped[bool] = mapped_column(Boolean, default=False)
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    referrer_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("users.telegram_id", ondelete="SET NULL")
    )

    quiz_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    quiz_score: Mapped[Optional[int]] = mapped_column(SmallInteger)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    last_active_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    payments: Mapped[list["Payment"]] = relationship(back_populates="user")
    quiz_answers: Mapped[list["QuizAnswer"]] = relationship(back_populates="user")


# ═══════════════════════════════════════════════════════════
# 2. Payments
# ═══════════════════════════════════════════════════════════

class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_telegram_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.telegram_id", ondelete="CASCADE"), nullable=False
    )

    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), nullable=False)

    telegram_charge_id: Mapped[str] = mapped_column(String(256), unique=True, nullable=False)
    provider_charge_id: Mapped[str] = mapped_column(String(256), default="")

    status: Mapped[str] = mapped_column(String(20), default="completed")

    refunded_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    refund_reason: Mapped[Optional[str]] = mapped_column(Text)

    payload: Mapped[str] = mapped_column(String(128), default="detox_course_21day")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="payments")


# ═══════════════════════════════════════════════════════════
# 3. Settings (KV)
# ═══════════════════════════════════════════════════════════

class Setting(Base):
    __tablename__ = "settings"

    key: Mapped[str] = mapped_column(String(128), primary_key=True)
    value: Mapped[dict] = mapped_column(JSONB, default=lambda: "")
    description: Mapped[str] = mapped_column(Text, default="")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ═══════════════════════════════════════════════════════════
# 4. Texts
# ═══════════════════════════════════════════════════════════

class TextEntry(Base):
    __tablename__ = "texts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    section: Mapped[str] = mapped_column(String(64), nullable=False)
    field: Mapped[str] = mapped_column(String(64), nullable=False)
    value: Mapped[str] = mapped_column(Text, default="")
    placeholder: Mapped[str] = mapped_column(Text, default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ═══════════════════════════════════════════════════════════
# 5. Photos
# ═══════════════════════════════════════════════════════════

class Photo(Base):
    __tablename__ = "photos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    slot: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    original_name: Mapped[str] = mapped_column(String(256), default="")
    mime_type: Mapped[str] = mapped_column(String(64), default="image/jpeg")
    width: Mapped[Optional[int]] = mapped_column(Integer)
    height: Mapped[Optional[int]] = mapped_column(Integer)
    size_bytes: Mapped[Optional[int]] = mapped_column(Integer)
    alt_text: Mapped[str] = mapped_column(String(256), default="")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ═══════════════════════════════════════════════════════════
# 6. Author Cards
# ═══════════════════════════════════════════════════════════

class AuthorCard(Base):
    __tablename__ = "author_cards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    icon: Mapped[str] = mapped_column(String(10), default="👤")
    title: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ═══════════════════════════════════════════════════════════
# 7. Method Items
# ═══════════════════════════════════════════════════════════

class MethodItem(Base):
    __tablename__ = "method_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    icon: Mapped[str] = mapped_column(String(10), default="🌿")
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ═══════════════════════════════════════════════════════════
# 8. Course Info (singleton)
# ═══════════════════════════════════════════════════════════

class CourseInfo(Base):
    __tablename__ = "course_info"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    title: Mapped[str] = mapped_column(String(256), default="21-дневный детокс-курс")
    target_audience: Mapped[str] = mapped_column(Text, default="")
    why_detox_text: Mapped[str] = mapped_column(Text, default="")
    conditions_text: Mapped[str] = mapped_column(Text, default="")
    guarantee_text: Mapped[str] = mapped_column(Text, default="")
    guarantee_days: Mapped[int] = mapped_column(Integer, default=14)

    price_stars: Mapped[int] = mapped_column(Integer, default=1500)
    price_rub: Mapped[Optional[int]] = mapped_column(Integer)
    old_price_stars: Mapped[Optional[int]] = mapped_column(Integer)

    private_chat_link: Mapped[str] = mapped_column(String(256), default="")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ═══════════════════════════════════════════════════════════
# 9. Course Days (timeline)
# ═══════════════════════════════════════════════════════════

class CourseDay(Base):
    __tablename__ = "course_days"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    day_number: Mapped[int] = mapped_column(SmallInteger, unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    short_desc: Mapped[str] = mapped_column(String(512), default="")
    full_desc: Mapped[str] = mapped_column(Text, default="")
    tasks: Mapped[list] = mapped_column(JSONB, default=list)
    icon: Mapped[str] = mapped_column(String(10), default="📅")
    # week_number — computed column, read-only in Python
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ═══════════════════════════════════════════════════════════
# 10. Course Results (infographics)
# ═══════════════════════════════════════════════════════════

class CourseResult(Base):
    __tablename__ = "course_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    icon: Mapped[str] = mapped_column(String(10), default="✅")
    metric_value: Mapped[str] = mapped_column(String(64), nullable=False)
    metric_label: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ═══════════════════════════════════════════════════════════
# 11. Cases
# ═══════════════════════════════════════════════════════════

class Case(Base):
    __tablename__ = "cases"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    client_name: Mapped[str] = mapped_column(String(128), nullable=False)
    client_age: Mapped[Optional[int]] = mapped_column(SmallInteger)
    result_text: Mapped[str] = mapped_column(String(512), default="")
    review_text: Mapped[str] = mapped_column(Text, default="")
    photo_before: Mapped[str] = mapped_column(String(512), default="")
    photo_after: Mapped[str] = mapped_column(String(512), default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ═══════════════════════════════════════════════════════════
# 12. Quiz Questions
# ═══════════════════════════════════════════════════════════

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[list] = mapped_column(JSONB, default=list)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ═══════════════════════════════════════════════════════════
# 13. Quiz Answers
# ═══════════════════════════════════════════════════════════

class QuizAnswer(Base):
    __tablename__ = "quiz_answers"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_telegram_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.telegram_id", ondelete="CASCADE"), nullable=False
    )
    answers: Mapped[dict] = mapped_column(JSONB, default=dict)
    total_score: Mapped[int] = mapped_column(SmallInteger, default=0)
    max_score: Mapped[int] = mapped_column(SmallInteger, default=10)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="quiz_answers")


# ═══════════════════════════════════════════════════════════
# 14. Blocks Visibility
# ═══════════════════════════════════════════════════════════

class BlockVisibility(Base):
    __tablename__ = "blocks_visibility"

    block_key: Mapped[str] = mapped_column(String(64), primary_key=True)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    label: Mapped[str] = mapped_column(String(128), default="")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ═══════════════════════════════════════════════════════════
# 15. Uploads
# ═══════════════════════════════════════════════════════════

class Upload(Base):
    __tablename__ = "uploads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    file_path: Mapped[str] = mapped_column(String(512), unique=True, nullable=False)
    original_name: Mapped[str] = mapped_column(String(256), default="")
    mime_type: Mapped[str] = mapped_column(String(64), default="image/jpeg")
    size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    width: Mapped[Optional[int]] = mapped_column(Integer)
    height: Mapped[Optional[int]] = mapped_column(Integer)
    uploaded_by: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("users.telegram_id", ondelete="SET NULL")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


# ═══════════════════════════════════════════════════════════
# Engine & Session Factory
# ═══════════════════════════════════════════════════════════

def create_engine(database_url: str):
    """Создаёт async engine."""
    return create_async_engine(
        database_url,
        echo=False,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
    )


def create_session_factory(engine) -> async_sessionmaker[AsyncSession]:
    """Создаёт фабрику async-сессий."""
    return async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
