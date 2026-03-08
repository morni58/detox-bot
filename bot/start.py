# -*- coding: utf-8 -*-
"""
🌿 Handlers: /start и навигация.

Обрабатывает:
  • /start           — приветствие + главная клавиатура
  • /start <payload>  — deep links (buy, quiz, ref_*)
  • course_info       — подробности о курсе
  • course_program    — программа 21 дня
  • course_results    — результаты клиенток
  • course_price      — стоимость
  • start_about       — об авторе
  • start_question    — форма вопроса
  • nav_back_*        — навигация назад
"""

from __future__ import annotations

from aiogram import Router, F, Bot
from aiogram.filters import CommandStart, CommandObject
from aiogram.types import Message, CallbackQuery
from loguru import logger

from bot.config import get_settings
from bot.keyboards.inline import (
    get_start_keyboard,
    get_course_info_keyboard,
    get_buy_keyboard,
    get_back_keyboard,
)
from bot.keyboards.webapp import get_webapp_keyboard

router = Router(name="start")


# ═══════════════════════════════════════════════════════════
# /start — Приветствие
# ═══════════════════════════════════════════════════════════

WELCOME_TEXT = """🌿 <b>Добро пожаловать в Детокс-курс!</b>

Привет{name}! Рада видеть тебя здесь 💚

Я помогу тебе пройти <b>21-дневный детокс-курс</b>, который вернёт:

✨ Чистую и сияющую кожу
⚡ Энергию и лёгкость в теле
🏃‍♀️ Комфортный вес без голодания
💆‍♀️ Внутренний баланс и спокойствие

<i>Курс создан специально для женщин 35+, которые хотят выглядеть и чувствовать себя великолепно.</i>

👇 <b>Выбери, что тебя интересует:</b>"""


WELCOME_TEXT_RETURNING = """🌿 <b>С возвращением!</b>

Привет{name}! Рада видеть тебя снова 💚

👇 <b>Чем могу помочь?</b>"""


@router.message(CommandStart(deep_link=True))
async def cmd_start_deep_link(
    message: Message,
    command: CommandObject,
    bot: Bot,
) -> None:
    """
    /start с deep link параметром.

    Поддерживаемые payload'ы:
      • buy       — сразу к покупке
      • quiz      — открыть квиз
      • ref_{id}  — реферальная ссылка
    """
    payload = command.args or ""
    user = message.from_user
    settings = get_settings()

    logger.info(
        "Deep link /start: user_id={}, payload={}",
        user.id if user else "?",
        payload,
    )

    # ── ref_* — реферальная ссылка ───────────────────────
    if payload.startswith("ref_"):
        referrer_id = payload.removeprefix("ref_")
        logger.info("Referral from user_id={}", referrer_id)
        # TODO: сохранить реферала в БД

    # ── buy — сразу показать покупку ─────────────────────
    if payload == "buy":
        await _show_course_price(message)
        return

    # ── quiz — отправить в Mini App на квиз ──────────────
    if payload == "quiz":
        await message.answer(
            "🧩 <b>Пройди мини-квиз!</b>\n\n"
            "5 быстрых вопросов — и ты узнаешь, "
            "насколько тебе нужен детокс.\n\n"
            "👇 Нажми кнопку ниже:",
            parse_mode="HTML",
            reply_markup=get_back_keyboard("nav_back_start"),
        )
        return

    # ── Обычный /start с unknown payload ─────────────────
    await _send_welcome(message, is_returning=False)


@router.message(CommandStart(deep_link=False))
async def cmd_start(message: Message, bot: Bot) -> None:
    """
    /start без параметров — стандартное приветствие.
    Устанавливает Menu Button при первом вызове.
    """
    user = message.from_user
    logger.info("Start: user_id={}, username={}", user.id, user.username)

    # TODO: проверить, есть ли юзер в БД → returning / new
    is_returning = False

    await _send_welcome(message, is_returning=is_returning)


async def _send_welcome(message: Message, *, is_returning: bool) -> None:
    """Отправляет приветственное сообщение с клавиатурой."""
    user = message.from_user
    name = f", {user.first_name}" if user and user.first_name else ""

    template = WELCOME_TEXT_RETURNING if is_returning else WELCOME_TEXT
    text = template.format(name=name)

    # Отправляем inline-клавиатуру (основная навигация)
    await message.answer(
        text,
        parse_mode="HTML",
        reply_markup=get_start_keyboard(),
    )

    # Дополнительно: reply-клавиатура с WebApp-кнопкой
    # (всегда видна внизу экрана)
    await message.answer(
        "☝️ Или нажми кнопку внизу, чтобы открыть курс:",
        reply_markup=get_webapp_keyboard(),
    )


# ═══════════════════════════════════════════════════════════
# 📋 О курсе
# ═══════════════════════════════════════════════════════════

COURSE_INFO_TEXT = """📋 <b>21-дневный детокс-курс</b>

🎯 <b>Для кого:</b>
Женщины 35+, которые столкнулись с проблемами кожи (высыпания, тусклость, отёки) и лишним весом, несмотря на попытки диет.

🔬 <b>Почему детокс важен:</b>
После 35 лет организм замедляет процессы очищения. Токсины накапливаются, отражаясь на коже и весе. Детокс перезапускает эти процессы.

📦 <b>Что входит:</b>
• Пошаговая программа на 21 день
• Ежедневные рекомендации по питанию
• Уход за кожей изнутри и снаружи
• Закрытый чат с поддержкой
• Персональная обратная связь

🛡 <b>Гарантия:</b> 14 дней возврата, если курс не подошёл.

👇 <b>Узнай подробнее:</b>"""


@router.callback_query(F.data == "course_info")
async def cb_course_info(callback: CallbackQuery) -> None:
    """Показывает подробную информацию о курсе."""
    await callback.message.edit_text(
        COURSE_INFO_TEXT,
        parse_mode="HTML",
        reply_markup=get_course_info_keyboard(),
    )
    await callback.answer()


# ═══════════════════════════════════════════════════════════
# 🌿 Программа 21 дня
# ═══════════════════════════════════════════════════════════

COURSE_PROGRAM_TEXT = """🌿 <b>Программа курса: 21 день</b>

<b>Неделя 1 — Мягкий старт</b>
Дни 1–7: Подготовка организма. Убираем пищевой мусор, вводим детокс-привычки, начинаем утренние ритуалы.

<b>Неделя 2 — Глубокое очищение</b>
Дни 8–14: Активный детокс. Специальное меню, лимфодренаж, уход за кожей, работа с отёками.

<b>Неделя 3 — Закрепление</b>
Дни 15–21: Фиксируем результат. Выход из детокса, формируем привычки, которые останутся навсегда.

📲 <i>Полную интерактивную программу с описанием каждого дня смотри в приложении!</i>"""


@router.callback_query(F.data == "course_program")
async def cb_course_program(callback: CallbackQuery) -> None:
    """Программа 21 дня — краткое описание."""
    await callback.message.edit_text(
        COURSE_PROGRAM_TEXT,
        parse_mode="HTML",
        reply_markup=get_back_keyboard("nav_back_course"),
    )
    await callback.answer()


# ═══════════════════════════════════════════════════════════
# 📸 Результаты клиенток
# ═══════════════════════════════════════════════════════════

COURSE_RESULTS_TEXT = """📸 <b>Результаты клиенток</b>

🌟 <b>Марина, 38 лет:</b>
«Минус 6 кг за 21 день. Кожа стала чистой впервые за 3 года!»

🌟 <b>Елена, 42 года:</b>
«Ушли отёки с лица, подруги спрашивают, что я сделала»

🌟 <b>Анна, 36 лет:</b>
«Энергии столько, что я снова начала бегать по утрам»

🌟 <b>Ольга, 45 лет:</b>
«Наконец-то нашла метод, который работает без голодания»

📲 <i>Больше историй с фото До/После — в приложении!</i>"""


@router.callback_query(F.data == "course_results")
async def cb_course_results(callback: CallbackQuery) -> None:
    """Кейсы клиенток — краткие отзывы."""
    await callback.message.edit_text(
        COURSE_RESULTS_TEXT,
        parse_mode="HTML",
        reply_markup=get_back_keyboard("nav_back_course"),
    )
    await callback.answer()


# ═══════════════════════════════════════════════════════════
# 💰 Стоимость
# ═══════════════════════════════════════════════════════════

async def _show_course_price(
    target: Message | CallbackQuery,
) -> None:
    """Показывает стоимость курса + кнопки оплаты."""
    settings = get_settings()

    text = f"""💰 <b>Стоимость курса</b>

🌿 <b>21-дневный детокс-курс</b>

Цена: <b>{settings.course_price_stars} ⭐ Stars</b>

<b>Что включено:</b>
✅ Полная программа на 21 день
✅ Ежедневные рекомендации
✅ Закрытый чат с поддержкой
✅ Персональная обратная связь от автора
✅ Бонусные материалы по уходу за кожей

🛡 <b>Гарантия 14 дней</b> — если курс не подойдёт, вернём Stars без вопросов.

👇 <b>Выбери способ оплаты:</b>"""

    if isinstance(target, CallbackQuery):
        await target.message.edit_text(
            text,
            parse_mode="HTML",
            reply_markup=get_buy_keyboard(),
        )
        await target.answer()
    else:
        await target.answer(
            text,
            parse_mode="HTML",
            reply_markup=get_buy_keyboard(),
        )


@router.callback_query(F.data == "course_price")
async def cb_course_price(callback: CallbackQuery) -> None:
    """Стоимость и условия."""
    await _show_course_price(callback)


# ═══════════════════════════════════════════════════════════
# 👩‍⚕️ Об авторе
# ═══════════════════════════════════════════════════════════

ABOUT_AUTHOR_TEXT = """👩‍⚕️ <b>Об авторе</b>

👋 Привет! Я — автор этого детокс-курса.

🎓 <b>Образование:</b>
Высшее медицинское образование, специализация в нутрициологии и превентивной медицине.

📊 <b>Опыт:</b>
Более 10 лет практики в области детоксикации и восстановления здоровья. Провела 500+ консультаций.

🔬 <b>Чем занимаюсь:</b>
Помогаю женщинам 35+ вернуть здоровье кожи, нормализовать вес и почувствовать прилив энергии — без жёстких диет и изнуряющих тренировок.

💚 <b>Мой подход:</b>
Мягкий, научно обоснованный детокс, который подходит для повседневной жизни. Никаких голодовок — только забота о себе.

📲 <i>Подробнее обо мне — в приложении!</i>"""


@router.callback_query(F.data == "start_about")
async def cb_about_author(callback: CallbackQuery) -> None:
    """Информация об авторе."""
    await callback.message.edit_text(
        ABOUT_AUTHOR_TEXT,
        parse_mode="HTML",
        reply_markup=get_back_keyboard("nav_back_start"),
    )
    await callback.answer()


# ═══════════════════════════════════════════════════════════
# 💬 Задать вопрос
# ═══════════════════════════════════════════════════════════

@router.callback_query(F.data == "start_question")
async def cb_question(callback: CallbackQuery) -> None:
    """Предлагает пользователю задать вопрос (свободный ввод)."""
    await callback.message.edit_text(
        "💬 <b>Задай свой вопрос!</b>\n\n"
        "Напиши его прямо сюда в чат, "
        "и я передам его автору курса.\n\n"
        "<i>Обычно отвечаем в течение нескольких часов.</i>",
        parse_mode="HTML",
        reply_markup=get_back_keyboard("nav_back_start"),
    )
    await callback.answer()


# ═══════════════════════════════════════════════════════════
# 🧭 Навигация — кнопки «Назад»
# ═══════════════════════════════════════════════════════════

@router.callback_query(F.data == "nav_back_start")
async def cb_back_to_start(callback: CallbackQuery) -> None:
    """Возврат к главному меню."""
    user = callback.from_user
    name = f", {user.first_name}" if user and user.first_name else ""

    await callback.message.edit_text(
        WELCOME_TEXT.format(name=name),
        parse_mode="HTML",
        reply_markup=get_start_keyboard(),
    )
    await callback.answer()


@router.callback_query(F.data == "nav_back_course")
async def cb_back_to_course(callback: CallbackQuery) -> None:
    """Возврат к информации о курсе."""
    await callback.message.edit_text(
        COURSE_INFO_TEXT,
        parse_mode="HTML",
        reply_markup=get_course_info_keyboard(),
    )
    await callback.answer()


# ═══════════════════════════════════════════════════════════
# 📩 Обработка свободных сообщений (вопросы)
# ═══════════════════════════════════════════════════════════

@router.message(F.text & ~F.text.startswith("/"))
async def handle_free_text(message: Message, bot: Bot) -> None:
    """
    Перехватывает текстовые сообщения (не команды).
    Пересылает вопрос администратору.
    """
    settings = get_settings()
    user = message.from_user

    # Пересылаем админу
    try:
        await bot.send_message(
            chat_id=settings.admin_id,
            text=(
                f"💬 <b>Новый вопрос</b>\n\n"
                f"От: {user.full_name} (@{user.username or '—'})\n"
                f"ID: <code>{user.id}</code>\n\n"
                f"<blockquote>{message.text}</blockquote>"
            ),
            parse_mode="HTML",
        )
    except Exception:
        logger.opt(exception=True).warning("Failed to forward question to admin")

    await message.answer(
        "✅ <b>Вопрос отправлен!</b>\n\n"
        "Автор курса получила твоё сообщение "
        "и ответит в ближайшее время.\n\n"
        "А пока — загляни в детокс-курс! 👇",
        parse_mode="HTML",
        reply_markup=get_start_keyboard(),
    )
