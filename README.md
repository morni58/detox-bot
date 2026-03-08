# 🌿 Detox Course — Telegram Bot + Mini App

> Премиум Telegram-бот + полноэкранное Mini App для продажи 21-дневного детокс-курса.
> Целевая аудитория — женщины 35+ (проблемы кожи и лишний вес).

---

## 📋 Оглавление

- [Архитектура](#архитектура)
- [Технологический стек](#технологический-стек)
- [Структура проекта](#структура-проекта)
- [Быстрый старт (разработка)](#быстрый-старт-разработка)
- [Деплой на продакшен](#деплой-на-продакшен)
- [Настройка Telegram](#настройка-telegram)
- [Дизайн-система](#дизайн-система)
- [API Документация](#api-документация)
- [Админка](#админка)
- [Платежи](#платежи)
- [Часто задаваемые вопросы](#faq)

---

## Архитектура

```
┌─────────────────────────────────────────────────────────┐
│                    Telegram Cloud                        │
│  ┌──────────┐    ┌──────────────────────────────────┐   │
│  │ Bot API  │    │ Mini App (WebApp iframe)          │   │
│  └────┬─────┘    └──────────────┬───────────────────┘   │
└───────┼─────────────────────────┼───────────────────────┘
        │                         │
        ▼                         ▼
┌───────────────┐     ┌───────────────────┐
│  aiogram Bot  │     │  Nginx (SSL/proxy)│
│  (polling /   │     │    ┌─────┬──────┐ │
│   webhook)    │     │    │ SPA │ /api │ │
└───────┬───────┘     │    └──┬──┴──┬───┘ │
        │             └───────┼─────┼─────┘
        │                     │     │
        │              ┌──────┘     └──────┐
        │              ▼                   ▼
        │      ┌──────────────┐   ┌──────────────┐
        │      │  React App   │   │  FastAPI      │
        │      │  (Vite SSG)  │   │  (Uvicorn)   │
        │      └──────────────┘   └──────┬───────┘
        │                                │
        └──────────┬─────────────────────┘
                   │
          ┌────────┴────────┐
          ▼                 ▼
   ┌────────────┐   ┌────────────┐
   │ PostgreSQL │   │   Redis    │
   │   (data)   │   │  (cache/   │
   │            │   │   FSM)     │
   └────────────┘   └────────────┘
```

---

## Технологический стек

| Компонент | Технология | Версия |
|-----------|-----------|--------|
| **Bot** | Python + aiogram | 3.12 / 3.15 |
| **API** | FastAPI + Uvicorn | 0.115+ |
| **Frontend** | React + Vite + TypeScript | 19 / 6 / 5.7 |
| **Стили** | TailwindCSS v4 | 4.x |
| **Анимации** | framer-motion | 12.x |
| **Mini Apps SDK** | @telegram-apps/sdk | 2.x |
| **БД** | PostgreSQL | 17 |
| **Кеш** | Redis | 7 |
| **ORM** | SQLAlchemy (async) | 2.0 |
| **Прокси** | Nginx | 1.27 |
| **SSL** | Let's Encrypt (Certbot) | — |
| **Контейнеры** | Docker + Compose | 27+ |

---

## Структура проекта

```
project/
├── bot/                              # 🤖 Telegram-бот + API
│   ├── handlers/                     #    Обработчики команд
│   │   ├── __init__.py
│   │   ├── start.py                  #    /start, приветствие, deep links
│   │   ├── payment.py                #    Оплата (Stars / внешняя)
│   │   └── admin.py                  #    Админ-команды
│   ├── middlewares/                   #    Middleware
│   │   ├── __init__.py
│   │   ├── auth.py                   #    Проверка авторизации
│   │   └── throttle.py               #    Антифлуд
│   ├── keyboards/                    #    Клавиатуры
│   │   ├── __init__.py
│   │   ├── inline.py                 #    Inline-кнопки
│   │   └── webapp.py                 #    WebApp-кнопки
│   ├── services/                     #    Бизнес-логика
│   │   ├── __init__.py
│   │   ├── user_service.py           #    Работа с пользователями
│   │   ├── payment_service.py        #    Логика оплаты
│   │   └── course_service.py         #    Контент курса
│   ├── utils/                        #    Утилиты
│   │   ├── __init__.py
│   │   └── telegram.py               #    Хелперы Telegram API
│   ├── __init__.py
│   ├── main.py                       #    Точка входа бота
│   ├── config.py                     #    Pydantic Settings
│   ├── api.py                        #    FastAPI приложение
│   ├── Dockerfile                    #    Docker для бота
│   ├── Dockerfile.api                #    Docker для API
│   └── requirements.txt              #    Python-зависимости
│
├── miniapp/                          # ⚛️ React Mini App
│   ├── public/                       #    Статические файлы
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                   #    UI-компоненты (дизайн-система)
│   │   │   │   ├── Button.tsx        #    Кнопки (primary/success/secondary)
│   │   │   │   ├── Card.tsx          #    Карточки с тенью
│   │   │   │   ├── Loader.tsx        #    Спиннер загрузки
│   │   │   │   ├── ProgressBar.tsx   #    Прогресс-бар (квиз)
│   │   │   │   ├── Timeline.tsx      #    Timeline 21 день
│   │   │   │   └── PhotoCompare.tsx  #    До/После сравнение
│   │   │   ├── screens/              #    Экраны лендинга
│   │   │   │   ├── LoadingScreen.tsx #    1. Кастомный loading
│   │   │   │   ├── HeroSection.tsx   #    2. Шапка + CTA
│   │   │   │   ├── AboutAuthor.tsx   #    3. Об авторе (5 карточек)
│   │   │   │   ├── MethodSection.tsx #    4. Метод работы
│   │   │   │   ├── CourseSection.tsx  #    5. Курс (timeline, до/после)
│   │   │   │   ├── CasesSection.tsx  #    6. Кейсы (ScrollSnap)
│   │   │   │   ├── FinalCTA.tsx      #    7. Финальный CTA
│   │   │   │   ├── QuizSection.tsx   #    8. Мини-квиз (5 вопросов)
│   │   │   │   └── SuccessScreen.tsx #    9. Экран после оплаты
│   │   │   └── admin/                #    Панель администратора
│   │   │       ├── AdminLayout.tsx   #    Layout + навигация вкладок
│   │   │       ├── GeneralSettings.tsx  # Цвет, логотип, loading
│   │   │       ├── TextsEditor.tsx   #    Все тексты
│   │   │       ├── PhotosManager.tsx #    Управление фото
│   │   │       ├── MethodEditor.tsx  #    CRUD метода
│   │   │       ├── CourseEditor.tsx  #    Timeline, результаты, условия
│   │   │       ├── CasesEditor.tsx   #    CRUD кейсов
│   │   │       ├── PricingLinks.tsx  #    Цена и ссылки
│   │   │       ├── BlockToggle.tsx   #    Вкл/выкл блоков
│   │   │       └── PreviewMode.tsx   #    Превью как клиент
│   │   ├── hooks/                    #    React-хуки
│   │   │   ├── useTelegram.ts        #    Telegram WebApp SDK
│   │   │   ├── useAdmin.ts           #    Логика админки
│   │   │   ├── useQuiz.ts            #    Состояние квиза
│   │   │   └── usePayment.ts         #    Процесс оплаты
│   │   ├── api/                      #    HTTP-клиент
│   │   │   ├── client.ts             #    Axios/fetch + interceptors
│   │   │   └── endpoints.ts          #    Все API эндпоинты
│   │   ├── assets/                   #    Ресурсы
│   │   │   ├── images/               #    Изображения
│   │   │   └── fonts/                #    Шрифты (Telegram Sans)
│   │   ├── styles/
│   │   │   └── globals.css           #    Tailwind + кастомные стили
│   │   ├── types/
│   │   │   ├── index.ts              #    TypeScript-типы
│   │   │   └── telegram.d.ts         #    Типы Telegram SDK
│   │   ├── utils/
│   │   │   ├── animations.ts         #    framer-motion пресеты
│   │   │   └── format.ts             #    Форматирование
│   │   ├── App.tsx                   #    Корневой компонент
│   │   ├── main.tsx                  #    Точка входа React
│   │   └── vite-env.d.ts             #    Vite типы
│   ├── index.html                    #    HTML-шаблон
│   ├── package.json                  #    Node-зависимости
│   ├── tsconfig.json                 #    TypeScript конфиг
│   ├── vite.config.ts                #    Vite конфиг
│   ├── tailwind.config.ts            #    Tailwind конфиг
│   └── Dockerfile                    #    Docker (multi-stage)
│
├── database/                         # 🗃️ Схема и данные
│   ├── schema.sql                    #    Создание таблиц
│   ├── models.py                     #    SQLAlchemy-модели
│   ├── migrations/                   #    Alembic-миграции
│   │   └── .gitkeep
│   └── seeds/
│       └── initial_content.sql       #    Начальный контент
│
├── nginx/                            # 🌐 Reverse proxy
│   ├── nginx.conf                    #    Основной конфиг
│   ├── conf.d/
│   │   └── default.conf              #    Конфиг сайта + SSL
│   └── webroot/                      #    Certbot challenge
│
├── .env.example                      #    Шаблон переменных окружения
├── .gitignore                        #    Git ignore
├── docker-compose.yml                #    Docker Compose (все сервисы)
└── README.md                         #    ← Вы здесь
```

---

## Быстрый старт (разработка)

### Предварительные требования

- **Docker** ≥ 27.0 и **Docker Compose** ≥ 2.30
- **Node.js** ≥ 22 LTS (для локальной разработки Mini App)
- **Python** ≥ 3.12 (для локальной разработки бота)
- **Telegram-аккаунт** + бот от @BotFather

### Шаг 1. Клонируй репозиторий

```bash
git clone https://github.com/your-user/detox-course.git
cd detox-course
```

### Шаг 2. Настрой окружение

```bash
# Скопируй шаблон
cp .env.example .env

# Открой и заполни обязательные поля
nano .env
```

**Минимум для запуска:**

| Переменная | Где взять |
|-----------|-----------|
| `BOT_TOKEN` | @BotFather → `/newbot` |
| `ADMIN_ID` | @userinfobot → `/start` |
| `POSTGRES_PASSWORD` | Придумай надёжный |
| `SECRET_KEY` | `openssl rand -hex 32` |

### Шаг 3. Запуск через Docker (рекомендуемый)

```bash
# Поднимаем всё одной командой
docker compose up -d --build

# Проверяем статус
docker compose ps

# Смотрим логи
docker compose logs -f bot
docker compose logs -f api
```

Сервисы:

| Сервис | Порт | URL |
|--------|------|-----|
| PostgreSQL | 5432 | `localhost:5432` |
| Redis | 6379 | `localhost:6379` |
| Bot | — | polling (без порта) |
| API | 8000 | `http://localhost:8000` |
| Mini App | 80 | `http://localhost:80` |
| Nginx | 80/443 | Проксирует всё |

### Шаг 4. Локальная разработка (без Docker)

**Бот:**

```bash
cd bot

# Виртуальное окружение
python -m venv .venv
source .venv/bin/activate   # Linux/Mac
# .venv\Scripts\activate    # Windows

# Зависимости
pip install -r requirements.txt

# Запуск
python -m main
```

**Mini App:**

```bash
cd miniapp

# Зависимости
npm install

# Dev-сервер с HMR
npm run dev
# → http://localhost:5173
```

**БД (нужен запущенный PostgreSQL):**

```bash
# Через Docker (только БД)
docker compose up -d postgres redis

# Или локальный PostgreSQL
psql -U postgres -c "CREATE DATABASE detox_course;"
psql -U postgres -d detox_course -f database/schema.sql
psql -U postgres -d detox_course -f database/seeds/initial_content.sql
```

### Шаг 5. Туннель для тестирования Mini App

Telegram требует HTTPS для Mini App. Используй туннель:

```bash
# Вариант 1: ngrok
ngrok http 5173
# Скопируй https://xxxx.ngrok.io → в .env WEBAPP_URL

# Вариант 2: Cloudflare Tunnel
cloudflared tunnel --url http://localhost:5173

# Вариант 3: localtunnel
npx localtunnel --port 5173
```

Затем обнови `WEBAPP_URL` в `.env` и перезапусти бота.

---

## Деплой на продакшен

### Требования к серверу

- **VPS/VDS:** минимум 1 vCPU, 2 GB RAM, 20 GB SSD
- **ОС:** Ubuntu 22.04+ / Debian 12+
- **Домен:** с DNS A-записью на IP сервера
- **Рекомендуемые хостинги:** Hetzner, Timeweb Cloud, Selectel

### Шаг 1. Подготовка сервера

```bash
# Подключись к серверу
ssh root@your-server-ip

# Обнови систему
apt update && apt upgrade -y

# Установи Docker
curl -fsSL https://get.docker.com | sh

# Установи Docker Compose (если не включён)
apt install -y docker-compose-plugin

# Создай пользователя (не работай под root)
adduser deploy
usermod -aG docker deploy
su - deploy
```

### Шаг 2. Деплой проекта

```bash
# Клонируй репозиторий
git clone https://github.com/your-user/detox-course.git
cd detox-course

# Настрой окружение
cp .env.example .env
nano .env

# ОБЯЗАТЕЛЬНО укажи:
# DOMAIN=your-domain.com
# SSL_EMAIL=your-email@example.com
# WEBAPP_URL=https://your-domain.com
# VITE_API_URL=https://your-domain.com/api
# + все остальные переменные
```

### Шаг 3. SSL-сертификат (Let's Encrypt)

```bash
# Замени YOUR_DOMAIN в nginx конфиге
sed -i 's/YOUR_DOMAIN/your-domain.com/g' nginx/conf.d/default.conf

# Первый запуск — без SSL (для получения сертификата)
# Временно закомментируй SSL-блок в nginx/conf.d/default.conf
# и оставь только server на порту 80

# Запусти nginx
docker compose up -d nginx

# Получи сертификат
docker compose run --rm certbot certonly \
  --webroot \
  -w /var/www/certbot \
  -d your-domain.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email

# Верни SSL-блок в nginx конфиг
# Перезапусти всё
docker compose down
docker compose up -d --build
```

### Шаг 4. Проверка

```bash
# Все контейнеры запущены?
docker compose ps

# Логи без ошибок?
docker compose logs --tail=50

# Mini App доступен?
curl -I https://your-domain.com

# API работает?
curl https://your-domain.com/api/health

# Бот отвечает?
# Отправь /start боту в Telegram
```

### Шаг 5. Автообновление SSL

Certbot контейнер автоматически обновляет сертификаты каждые 12 часов. Для перезагрузки nginx после обновления добавь cron:

```bash
# Под пользователем deploy
crontab -e

# Добавь строку:
0 5 * * 1 cd /home/deploy/detox-course && docker compose exec nginx nginx -s reload
```

### Шаг 6. Обновление проекта

```bash
cd /home/deploy/detox-course

# Забери изменения
git pull origin main

# Пересобери и перезапусти
docker compose up -d --build

# Проверь логи
docker compose logs -f --tail=20
```

---

## Настройка Telegram

### 1. Создание бота

```
@BotFather → /newbot → Название → @username_bot
→ Сохрани токен в .env BOT_TOKEN
```

### 2. Настройка Mini App

```
@BotFather → /mybots → @your_bot → Bot Settings → Menu Button
→ Введи URL: https://your-domain.com
→ Текст кнопки: 🌿 Детокс-курс
```

### 3. Настройка оплаты

```
@BotFather → /mybots → @your_bot → Payments
→ Подключи провайдера (Stars / ЮKassa / Stripe)
→ Сохрани токен в .env PAYMENT_PROVIDER_TOKEN
```

### 4. Создание закрытого чата

```
1. Создай группу/канал в Telegram
2. Сделай бота администратором (с правом приглашать)
3. Создай invite-ссылку
4. Сохрани в .env:
   PRIVATE_CHAT_INVITE_LINK=https://t.me/+XXXXX
   PRIVATE_CHAT_ID=-100XXXXXXXXXX
```

---

## Дизайн-система

| Токен | Значение | Использование |
|-------|----------|---------------|
| `primary` | `#10b981` (emerald-500) | Акценты, primary-кнопки |
| `success` | `#22c55e` (green-500) | CTA-кнопки, позитивные действия |
| `bg-light` | `#f8fafc` (slate-50) | Фон светлой темы |
| `bg-dark` | `#0f172a` (slate-900) | Фон тёмной темы |
| `font` | Telegram Sans | Основной шрифт |
| `fw-heading` | 600 | Заголовки |
| `fw-body` | 400 | Текст |
| `spacing` | 16 / 24 / 32px | Отступы |
| `radius` | 16px | Радиус кнопок и карточек |
| `shadow` | shadow-xl (soft) | Тени карточек |
| `animation` | fadeInUp 0.4s | Появление блоков |
| `animation` | scale 0.95→1 | Нажатие кнопок |
| `animation` | slideLeft | Горизонтальный скролл |

---

## API Документация

После запуска API автоматически генерирует Swagger UI:

```
https://your-domain.com/api/docs      — Swagger UI
https://your-domain.com/api/redoc     — ReDoc
https://your-domain.com/api/health    — Health check
```

### Основные эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/health` | Статус API |
| `GET` | `/content` | Весь контент лендинга |
| `GET` | `/content/blocks` | Настройки видимости блоков |
| `POST` | `/quiz/submit` | Отправка результатов квиза |
| `POST` | `/payment/create` | Создание платежа |
| `POST` | `/payment/verify` | Верификация оплаты |
| `GET` | `/admin/settings` | Настройки (только админ) |
| `PUT` | `/admin/settings` | Обновление настроек |
| `POST` | `/admin/upload` | Загрузка фото |
| `CRUD` | `/admin/methods` | Управление методами |
| `CRUD` | `/admin/cases` | Управление кейсами |
| `CRUD` | `/admin/course/*` | Управление курсом |

---

## Админка

Доступ к админке: **только для пользователя с `ADMIN_ID`**.

Mini App автоматически определяет admin-статус через `initData` от Telegram и показывает кнопку «Админка» в навигации.

### Вкладки

1. **Общие настройки** — primary color, логотип, loading screen
2. **Тексты** — все заголовки, подзаголовки, описания
3. **Фото** — фото автора, инфографика, кейсы
4. **Метод работы** — полный CRUD пунктов
5. **Курс** — timeline 21 день, результаты, условия
6. **Кейсы** — CRUD: фото до/после, текст, порядок
7. **Цена и ссылки** — стоимость, invite-ссылка
8. **Вкл/выкл блоков** — показать/скрыть секции
9. **Превью** — просмотр как клиент

---

## Платежи

Поддерживается два режима:

### Telegram Stars (встроенные)

Нативная оплата внутри Telegram — без внешних провайдеров.

```
Пользователь → Кнопка «Купить» → Telegram Payment Dialog → Подтверждение → Бот обрабатывает → Доступ к курсу
```

### Внешняя оплата (ЮKassa / Stripe)

Для рынков где Stars недоступны.

```
Пользователь → Кнопка «Купить» → Redirect на платёжку → Webhook → Бот обрабатывает → Доступ к курсу
```

---

## FAQ

**Q: Mini App не открывается в Telegram?**
Проверь: HTTPS обязателен. Убедись что `WEBAPP_URL` в `.env` начинается с `https://`.

**Q: Бот не отвечает на /start?**
Проверь `BOT_TOKEN` в `.env`. Посмотри логи: `docker compose logs bot`.

**Q: Как сбросить базу данных?**
`docker compose down -v` удалит все данные. Затем `docker compose up -d --build`.

**Q: Как добавить второго админа?**
Пока поддерживается один админ. Для нескольких — расширь проверку в `auth.py`.

**Q: Как поменять цвет темы?**
Через админку → Общие настройки → Color picker. Или `primary` в Tailwind конфиге.

---

## Команды Docker

```bash
# Запуск
docker compose up -d --build

# Остановка
docker compose down

# Логи всех сервисов
docker compose logs -f

# Логи конкретного сервиса
docker compose logs -f bot

# Перезапуск одного сервиса
docker compose restart bot

# Зайти внутрь контейнера
docker compose exec bot bash

# Статус
docker compose ps

# Очистить всё (ОСТОРОЖНО: удалит данные!)
docker compose down -v --rmi all
```

---

## Лицензия

Private. All rights reserved.
