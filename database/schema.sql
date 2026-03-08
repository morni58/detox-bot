-- ============================================================
-- 🌿 Detox Course — Database Schema (PostgreSQL 17)
-- ============================================================
-- Запуск: psql -U detox_admin -d detox_course -f schema.sql
-- Docker: автоматически при первом запуске (docker-entrypoint-initdb.d)
--
-- Таблицы:
--   1.  users              — пользователи Telegram
--   2.  payments            — история платежей
--   3.  settings            — общие настройки (KV-хранилище)
--   4.  texts               — все тексты лендинга
--   5.  photos              — фото (автор, инфографика, фоны)
--   6.  author_cards        — 5 карточек «Об авторе»
--   7.  method_items        — пункты «Метод работы»
--   8.  course_info         — мета-данные курса (ЦА, описание, гарантия)
--   9.  course_days         — программа 21 дня (timeline)
--   10. course_results      — инфографика «Почему важен детокс»
--   11. cases               — кейсы клиенток (до/после)
--   12. quiz_questions      — вопросы мини-квиза
--   13. quiz_answers        — ответы пользователей на квиз
--   14. blocks_visibility   — вкл/выкл блоков лендинга
--   15. uploads             — реестр загруженных файлов
-- ============================================================

-- Расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";


-- ============================================================
-- 1. USERS — пользователи Telegram
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL       PRIMARY KEY,
    telegram_id     BIGINT          NOT NULL UNIQUE,
    username        VARCHAR(64),
    first_name      VARCHAR(128)    NOT NULL DEFAULT '',
    last_name       VARCHAR(128),
    language_code   VARCHAR(10)     DEFAULT 'ru',
    is_premium      BOOLEAN         NOT NULL DEFAULT FALSE,
    is_admin        BOOLEAN         NOT NULL DEFAULT FALSE,

    -- Статус оплаты
    has_paid        BOOLEAN         NOT NULL DEFAULT FALSE,
    paid_at         TIMESTAMPTZ,

    -- Реферальная система
    referrer_id     BIGINT          REFERENCES users(telegram_id)
                                    ON DELETE SET NULL,

    -- Квиз
    quiz_completed  BOOLEAN         NOT NULL DEFAULT FALSE,
    quiz_score      SMALLINT,

    -- Мета
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    last_active_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_has_paid    ON users(has_paid);
CREATE INDEX IF NOT EXISTS idx_users_created_at  ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_referrer    ON users(referrer_id);


-- ============================================================
-- 2. PAYMENTS — история платежей
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    id                      BIGSERIAL       PRIMARY KEY,
    user_telegram_id        BIGINT          NOT NULL
                                            REFERENCES users(telegram_id)
                                            ON DELETE CASCADE,

    -- Суммы
    amount                  INTEGER         NOT NULL,
    currency                VARCHAR(10)     NOT NULL,

    -- Telegram Payment
    telegram_charge_id      VARCHAR(256)    NOT NULL UNIQUE,
    provider_charge_id      VARCHAR(256)    DEFAULT '',

    -- Статус
    status                  VARCHAR(20)     NOT NULL DEFAULT 'completed'
                            CHECK (status IN ('pending', 'completed', 'refunded')),

    -- Возврат
    refunded_at             TIMESTAMPTZ,
    refund_reason           TEXT,

    -- Мета
    payload                 VARCHAR(128)    DEFAULT 'detox_course_21day',
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user     ON payments(user_telegram_id);
CREATE INDEX IF NOT EXISTS idx_payments_status   ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created  ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_charge   ON payments(telegram_charge_id);


-- ============================================================
-- 3. SETTINGS — общие настройки (KV-хранилище)
-- ============================================================
-- primary_color, logo_url, loading_text, course_price …
CREATE TABLE IF NOT EXISTS settings (
    key             VARCHAR(128)    PRIMARY KEY,
    value           JSONB           NOT NULL DEFAULT '""',
    description     TEXT            DEFAULT '',
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 4. TEXTS — все тексты лендинга
-- ============================================================
-- section : hero | author | method | course | cases | quiz | final_cta | loading
-- field   : title | subtitle | description | button_text | …
CREATE TABLE IF NOT EXISTS texts (
    id              SERIAL          PRIMARY KEY,
    section         VARCHAR(64)     NOT NULL,
    field           VARCHAR(64)     NOT NULL,
    value           TEXT            NOT NULL DEFAULT '',
    placeholder     TEXT            DEFAULT '',
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    UNIQUE(section, field)
);

CREATE INDEX IF NOT EXISTS idx_texts_section ON texts(section);


-- ============================================================
-- 5. PHOTOS — фотографии
-- ============================================================
-- slot : hero_bg | author_avatar | author_full | infographic_1..4 | loading_logo
CREATE TABLE IF NOT EXISTS photos (
    id              SERIAL          PRIMARY KEY,
    slot            VARCHAR(64)     NOT NULL UNIQUE,
    file_path       VARCHAR(512)    NOT NULL,
    original_name   VARCHAR(256)    DEFAULT '',
    mime_type       VARCHAR(64)     DEFAULT 'image/jpeg',
    width           INTEGER,
    height          INTEGER,
    size_bytes      INTEGER,
    alt_text        VARCHAR(256)    DEFAULT '',
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 6. AUTHOR_CARDS — 5 карточек «Об авторе»
-- ============================================================
CREATE TABLE IF NOT EXISTS author_cards (
    id              SERIAL          PRIMARY KEY,
    icon            VARCHAR(10)     NOT NULL DEFAULT '👤',
    title           VARCHAR(128)    NOT NULL,
    description     TEXT            NOT NULL DEFAULT '',
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    is_visible      BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 7. METHOD_ITEMS — пункты «Метод работы» (4–6 шт.)
-- ============================================================
CREATE TABLE IF NOT EXISTS method_items (
    id              SERIAL          PRIMARY KEY,
    icon            VARCHAR(10)     NOT NULL DEFAULT '🌿',
    title           VARCHAR(256)    NOT NULL,
    description     TEXT            NOT NULL DEFAULT '',
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    is_visible      BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 8. COURSE_INFO — мета-данные курса (singleton)
-- ============================================================
CREATE TABLE IF NOT EXISTS course_info (
    id              INTEGER         PRIMARY KEY DEFAULT 1
                                    CHECK (id = 1),
    title           VARCHAR(256)    NOT NULL DEFAULT '21-дневный детокс-курс',
    target_audience TEXT            NOT NULL DEFAULT 'Для женщин 35+ с проблемами кожи и лишним весом',
    why_detox_text  TEXT            NOT NULL DEFAULT '',
    conditions_text TEXT            NOT NULL DEFAULT '',
    guarantee_text  TEXT            NOT NULL DEFAULT 'Гарантия 14 дней — вернём деньги без вопросов',
    guarantee_days  INTEGER         NOT NULL DEFAULT 14,

    -- Цена
    price_stars     INTEGER         NOT NULL DEFAULT 1500,
    price_rub       INTEGER,
    old_price_stars INTEGER,

    -- Ссылки
    private_chat_link VARCHAR(256)  DEFAULT '',

    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 9. COURSE_DAYS — программа 21 дня (timeline)
-- ============================================================
CREATE TABLE IF NOT EXISTS course_days (
    id              SERIAL          PRIMARY KEY,
    day_number      SMALLINT        NOT NULL UNIQUE
                                    CHECK (day_number BETWEEN 1 AND 21),
    title           VARCHAR(256)    NOT NULL,
    short_desc      VARCHAR(512)    NOT NULL DEFAULT '',
    full_desc       TEXT            NOT NULL DEFAULT '',
    tasks           JSONB           NOT NULL DEFAULT '[]',
    icon            VARCHAR(10)     DEFAULT '📅',
    week_number     SMALLINT        GENERATED ALWAYS AS (
                        CASE
                            WHEN day_number <= 7  THEN 1
                            WHEN day_number <= 14 THEN 2
                            ELSE 3
                        END
                    ) STORED,

    is_visible      BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_days_num ON course_days(day_number);


-- ============================================================
-- 10. COURSE_RESULTS — инфографика «Почему важен детокс»
-- ============================================================
CREATE TABLE IF NOT EXISTS course_results (
    id              SERIAL          PRIMARY KEY,
    icon            VARCHAR(10)     NOT NULL DEFAULT '✅',
    metric_value    VARCHAR(64)     NOT NULL,
    metric_label    VARCHAR(256)    NOT NULL,
    description     TEXT            DEFAULT '',
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    is_visible      BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 11. CASES — кейсы клиенток (до/после)
-- ============================================================
CREATE TABLE IF NOT EXISTS cases (
    id              SERIAL          PRIMARY KEY,
    client_name     VARCHAR(128)    NOT NULL,
    client_age      SMALLINT,
    result_text     VARCHAR(512)    NOT NULL DEFAULT '',
    review_text     TEXT            NOT NULL DEFAULT '',
    photo_before    VARCHAR(512)    NOT NULL DEFAULT '',
    photo_after     VARCHAR(512)    NOT NULL DEFAULT '',
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    is_visible      BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cases_sort ON cases(sort_order);


-- ============================================================
-- 12. QUIZ_QUESTIONS — вопросы мини-квиза (5 шт.)
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_questions (
    id              SERIAL          PRIMARY KEY,
    question_text   TEXT            NOT NULL,
    options         JSONB           NOT NULL DEFAULT '[]',
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    is_visible      BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 13. QUIZ_ANSWERS — ответы пользователей
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_answers (
    id                  BIGSERIAL   PRIMARY KEY,
    user_telegram_id    BIGINT      NOT NULL
                                    REFERENCES users(telegram_id)
                                    ON DELETE CASCADE,
    answers             JSONB       NOT NULL DEFAULT '{}',
    total_score         SMALLINT    NOT NULL DEFAULT 0,
    max_score           SMALLINT    NOT NULL DEFAULT 10,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_answers_user ON quiz_answers(user_telegram_id);


-- ============================================================
-- 14. BLOCKS_VISIBILITY — вкл/выкл блоков лендинга
-- ============================================================
CREATE TABLE IF NOT EXISTS blocks_visibility (
    block_key       VARCHAR(64)     PRIMARY KEY,
    is_visible      BOOLEAN         NOT NULL DEFAULT TRUE,
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    label           VARCHAR(128)    NOT NULL DEFAULT '',
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 15. UPLOADS — реестр загруженных файлов
-- ============================================================
CREATE TABLE IF NOT EXISTS uploads (
    id              SERIAL          PRIMARY KEY,
    file_path       VARCHAR(512)    NOT NULL UNIQUE,
    original_name   VARCHAR(256)    NOT NULL DEFAULT '',
    mime_type       VARCHAR(64)     NOT NULL DEFAULT 'image/jpeg',
    size_bytes      INTEGER         NOT NULL DEFAULT 0,
    width           INTEGER,
    height          INTEGER,
    uploaded_by     BIGINT          REFERENCES users(telegram_id)
                                    ON DELETE SET NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 🔄 АВТООБНОВЛЕНИЕ updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'users', 'settings', 'texts', 'photos',
            'author_cards', 'method_items', 'course_info',
            'course_days', 'course_results', 'cases',
            'quiz_questions', 'blocks_visibility'
        ])
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS set_updated_at ON %I; '
            'CREATE TRIGGER set_updated_at '
            'BEFORE UPDATE ON %I '
            'FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();',
            tbl, tbl
        );
    END LOOP;
END;
$$;


-- ============================================================
-- ✅ Схема создана
-- ============================================================
