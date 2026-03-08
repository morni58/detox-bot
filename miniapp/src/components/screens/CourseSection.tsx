/* ============================================================
 * 🌿 CourseSection — Главный блок курса (самый важный)
 * ============================================================
 *
 * Дизайн (по спецификации):
 *   1. Заголовок «21-дневный детокс-курс»
 *   2. ЦА: «Для женщин 35+ с проблемами кожи и лишним весом»
 *   3. Почему важен детокс — текст + 4 инфографики (grid 2×2)
 *   4. Программа — интерактивная timeline 21 день
 *   5. Условия + гарантия 14 дней
 *   6. 3 большие кнопки «Купить курс» (распределены по секции)
 *
 * Фон:
 *   - Верхняя часть: тёмный (#0f172a) + зелёные акценты
 *   - Нижняя часть (timeline, условия): светлый (#f8fafc)
 *
 * Анимации:
 *   - Заголовок: fadeInUp
 *   - Инфографика: stagger grid scaleIn
 *   - Timeline: встроенные анимации компонента
 *   - Кнопки: heroButton cascade
 *   - Гарантия: slideRight с иконкой щита
 *
 * ============================================================ */

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

import Button from "../ui/Button";
import Card from "../ui/Card";
import Timeline from "./Timeline";
import { useTelegram } from "../../hooks/useTelegram";
import {
  fadeInUp,
  scaleIn,
  staggerContainer,
} from "../../utils/animations";
import type {
  CourseDay,
  CourseResult,
  CourseInfo,
} from "../../types";

/* ── Props ────────────────────────────────────────────── */

interface CourseSectionProps {
  /** Мета-данные курса */
  info?: CourseInfo;
  /** Инфографика «Почему важен детокс» (4 карточки) */
  results?: CourseResult[];
  /** 21 день программы */
  days?: CourseDay[];
  /** Текст кнопки покупки */
  buyButtonText?: string;
  /** Callback покупки */
  onBuyClick?: () => void;
}

/* ── Default Data ─────────────────────────────────────── */

const DEFAULT_INFO: CourseInfo = {
  title: "21-дневный детокс-курс",
  targetAudience: "Для женщин 35+ с проблемами кожи и лишним весом",
  whyDetoxText:
    "После 35 лет метаболизм замедляется, а токсины накапливаются быстрее. Это отражается на коже — высыпания, тусклость, отёки — и на весе. Детокс перезапускает системы очищения организма.",
  conditionsText:
    "Доступ открывается мгновенно после оплаты. Все материалы доступны 60 дней. Можно проходить в своём темпе.",
  guaranteeText:
    "Гарантия 14 дней — если курс не подойдёт, вернём Stars без вопросов.",
  guaranteeDays: 14,
  priceStars: 1500,
  oldPriceStars: 2500,
  privateChatLink: "",
};

const DEFAULT_RESULTS: CourseResult[] = [
  { id: 1, icon: "✨", metricValue: "93%",   metricLabel: "улучшение кожи",   description: "Видимое улучшение уже на 2-й неделе", sortOrder: 1 },
  { id: 2, icon: "⚖️", metricValue: "3–7 кг", metricLabel: "снижение веса",    description: "Без голодания и жёстких диет",        sortOrder: 2 },
  { id: 3, icon: "⚡",  metricValue: "2x",     metricLabel: "больше энергии",   description: "Очищение + правильное питание",        sortOrder: 3 },
  { id: 4, icon: "💆",  metricValue: "87%",    metricLabel: "снижение стресса", description: "Нормализация уровня кортизола",        sortOrder: 4 },
];

const DEFAULT_DAYS: CourseDay[] = [
  { id: 1, dayNumber: 1, title: "Подготовка", shortDesc: "Оценка текущего состояния", fullDesc: "Заполняем дневник самочувствия. Фиксируем точку старта.", tasks: ["Заполнить дневник", "Сделать фото ДО", "Убрать сахар и фастфуд"], icon: "🌅", weekNumber: 1, isVisible: true },
  { id: 2, dayNumber: 2, title: "Водный баланс", shortDesc: "Настраиваем питьевой режим", fullDesc: "Рассчитываем норму воды. Утренний ритуал с лимонной водой.", tasks: ["Рассчитать норму воды", "Утренний стакан воды с лимоном"], icon: "💧", weekNumber: 1, isVisible: true },
  { id: 3, dayNumber: 3, title: "Детокс-завтраки", shortDesc: "Новые утренние привычки", fullDesc: "Смузи, каши с суперфудами, свежие овощи.", tasks: ["Приготовить детокс-смузи", "Записать ощущения"], icon: "🥣", weekNumber: 1, isVisible: true },
  { id: 4, dayNumber: 4, title: "Лимфодренаж", shortDesc: "Запускаем лимфатическую систему", fullDesc: "Сухой массаж щёткой. Контрастный душ. Упражнения.", tasks: ["Сухой массаж 5 мин", "Контрастный душ"], icon: "🧖", weekNumber: 1, isVisible: true },
  { id: 5, dayNumber: 5, title: "Очищение кожи", shortDesc: "Начинаем работу с кожей", fullDesc: "Натуральные маски. Питание для кожи изнутри.", tasks: ["Ревизия косметички", "Натуральная маска"], icon: "✨", weekNumber: 1, isVisible: true },
  { id: 6, dayNumber: 6, title: "Антистресс", shortDesc: "Снижаем кортизол", fullDesc: "Дыхательные практики, прогулка, цифровой детокс.", tasks: ["Дыхательная практика 10 мин", "Прогулка 30 мин"], icon: "🧘", weekNumber: 1, isVisible: true },
  { id: 7, dayNumber: 7, title: "Итоги недели", shortDesc: "Первые результаты", fullDesc: "Сравниваем самочувствие с днём 1.", tasks: ["Заполнить дневник", "Сравнить с днём 1"], icon: "📊", weekNumber: 1, isVisible: true },
  { id: 8, dayNumber: 8, title: "Детокс-меню", shortDesc: "Полный переход на детокс-питание", fullDesc: "Меню на всю неделю. Все рецепты с фото.", tasks: ["Закупить продукты", "Приготовить первый обед"], icon: "🥗", weekNumber: 2, isVisible: true },
  { id: 9, dayNumber: 9, title: "Глубокий лимфодренаж", shortDesc: "Усиливаем практики", fullDesc: "Гуа-ша, массаж ног, лимфодренажная гимнастика.", tasks: ["Гуа-ша 10 мин", "Гимнастика 15 мин"], icon: "💆", weekNumber: 2, isVisible: true },
  { id: 10, dayNumber: 10, title: "Детокс печени", shortDesc: "Поддержка главного фильтра", fullDesc: "Продукты для печени. Тёплая вода с куркумой.", tasks: ["Вода с куркумой утром", "Салат с рукколой"], icon: "🫒", weekNumber: 2, isVisible: true },
  { id: 11, dayNumber: 11, title: "Детокс кишечника", shortDesc: "Восстанавливаем микрофлору", fullDesc: "Пребиотики, пробиотики, ферментированные продукты.", tasks: ["Добавить кефир/комбучу", "Увеличить клетчатку"], icon: "🦠", weekNumber: 2, isVisible: true },
  { id: 12, dayNumber: 12, title: "Интенсив для кожи", shortDesc: "Глубокое очищение", fullDesc: "Паровые ванночки. Маска с глиной. Сыворотка.", tasks: ["Паровая ванночка", "Маска с глиной"], icon: "🌺", weekNumber: 2, isVisible: true },
  { id: 13, dayNumber: 13, title: "Движение", shortDesc: "Активный день", fullDesc: "Тренировка 30 мин. Йога или пилатес.", tasks: ["Тренировка 30 мин", "10 000 шагов"], icon: "🏃", weekNumber: 2, isVisible: true },
  { id: 14, dayNumber: 14, title: "Итоги недели 2", shortDesc: "Промежуточные результаты", fullDesc: "Взвешивание. Фото кожи. Ты молодец!", tasks: ["Взвешивание", "Фото кожи", "Сравнить"], icon: "🏆", weekNumber: 2, isVisible: true },
  { id: 15, dayNumber: 15, title: "Закрепление питания", shortDesc: "Формируем привычки", fullDesc: "Персональное меню. Правило 80/20.", tasks: ["Составить меню", "Записать рецепты"], icon: "📝", weekNumber: 3, isVisible: true },
  { id: 16, dayNumber: 16, title: "Утренний ритуал", shortDesc: "Идеальное утро", fullDesc: "Вода, дыхание, движение, уход — всё в одном.", tasks: ["Записать ритуал", "Выполнить полностью"], icon: "🌅", weekNumber: 3, isVisible: true },
  { id: 17, dayNumber: 17, title: "Уход на каждый день", shortDesc: "Финальный протокол кожи", fullDesc: "Минимальный и расширенный уход.", tasks: ["Записать протокол", "Утренний + вечерний уход"], icon: "🪞", weekNumber: 3, isVisible: true },
  { id: 18, dayNumber: 18, title: "Антистресс-система", shortDesc: "Долгосрочное управление", fullDesc: "2–3 практики навсегда. Дневник благодарности.", tasks: ["Выбрать 2 практики", "Начать дневник"], icon: "🕊", weekNumber: 3, isVisible: true },
  { id: 19, dayNumber: 19, title: "Движение навсегда", shortDesc: "Режим активности", fullDesc: "Свой вид активности. Расписание на месяц.", tasks: ["Выбрать активность", "Составить расписание"], icon: "🚴", weekNumber: 3, isVisible: true },
  { id: 20, dayNumber: 20, title: "Подготовка к финалу", shortDesc: "Финальные замеры", fullDesc: "Взвешивание. Фото ПОСЛЕ. Финальный дневник.", tasks: ["Взвешивание", "Фото ПОСЛЕ", "Заполнить дневник"], icon: "📸", weekNumber: 3, isVisible: true },
  { id: 21, dayNumber: 21, title: "Выпускной!", shortDesc: "Ты прошла весь путь!", fullDesc: "Сравниваем ДО и ПОСЛЕ. Бонусные материалы!", tasks: ["Сравнить ДО и ПОСЛЕ", "Забрать бонусы"], icon: "🎉", weekNumber: 3, isVisible: true },
];

/* ── Component ────────────────────────────────────────── */

export default function CourseSection({
  info = DEFAULT_INFO,
  results = DEFAULT_RESULTS,
  days = DEFAULT_DAYS,
  buyButtonText = "Купить курс",
  onBuyClick,
}: CourseSectionProps) {
  const { haptic } = useTelegram();

  /* Refs for scroll-triggered animations */
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const guaranteeRef = useRef<HTMLDivElement>(null);

  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
  const statsInView = useInView(statsRef, { once: true, amount: 0.2 });
  const timelineInView = useInView(timelineRef, { once: true, amount: 0.1 });
  const guaranteeInView = useInView(guaranteeRef, { once: true, amount: 0.3 });

  const sortedResults = [...results].sort((a, b) => a.sortOrder - b.sortOrder);
  const visibleDays = days.filter((d) => d.isVisible);

  return (
    <section
      id="course"
      style={{ width: "100%", overflow: "hidden" }}
    >
      {/* ═════════════════════════════════════════════════════
       *  PART 1: Dark Header — Title + Audience + Why Detox
       * ═════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "relative",
          width: "100%",
          padding: "72px 0 56px",
          background:
            "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
          overflow: "hidden",
        }}
      >
        {/* Background texture */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.06,
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            pointerEvents: "none",
          }}
        />
        {/* Green glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-30%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "120%",
            height: "60%",
            background:
              "radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 480,
            margin: "0 auto",
            padding: "0 24px",
          }}
        >
          {/* ── Section badge ─────────────────────────── */}
          <motion.div
            ref={headerRef}
            variants={fadeInUp}
            initial="hidden"
            animate={headerInView ? "visible" : "hidden"}
            style={{ textAlign: "center", marginBottom: 32 }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 100,
                backgroundColor: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.2)",
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 13 }}>🌿</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#6ee7b7",
                  letterSpacing: "0.02em",
                }}
              >
                Главная программа
              </span>
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#ffffff",
                margin: "0 0 12px",
                fontFamily: "'Telegram Sans', -apple-system, sans-serif",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              {info.title}
            </h2>

            {/* Accent line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={headerInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
              style={{
                width: 48,
                height: 3,
                borderRadius: 2,
                background: "linear-gradient(90deg, #10b981, #6ee7b7)",
                margin: "0 auto 16px",
                transformOrigin: "center",
              }}
            />

            {/* Target audience */}
            <p
              style={{
                fontSize: 17,
                fontWeight: 400,
                color: "rgba(255,255,255,0.7)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {info.targetAudience}
            </p>
          </motion.div>

          {/* ── BUY BUTTON #1 (after header) ─────────── */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate={headerInView ? "visible" : "hidden"}
            style={{ marginBottom: 48 }}
          >
            <Button
              variant="success"
              size="xl"
              icon="✨"
              fullWidth
              haptic={haptic.medium}
              onClick={onBuyClick}
            >
              {buyButtonText}
            </Button>
          </motion.div>

          {/* ── Why Detox ─────────────────────────────── */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate={headerInView ? "visible" : "hidden"}
            style={{ marginBottom: 32 }}
          >
            <h3
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: "#ffffff",
                margin: "0 0 12px",
                fontFamily: "'Telegram Sans', -apple-system, sans-serif",
              }}
            >
              Почему детокс важен?
            </h3>
            <p
              style={{
                fontSize: 15,
                fontWeight: 400,
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.6)",
                margin: 0,
              }}
            >
              {info.whyDetoxText}
            </p>
          </motion.div>

          {/* ── 4 Infographic Cards (2×2 grid) ────────── */}
          <motion.div
            ref={statsRef}
            variants={staggerContainer(0.1, 0.05)}
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {sortedResults.map((result) => (
              <motion.div
                key={result.id}
                variants={scaleIn}
              >
                <Card
                  variant="glass"
                  style={{
                    padding: "20px 16px",
                    textAlign: "center",
                    minHeight: 140,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* Icon */}
                  <span
                    style={{ fontSize: 28, lineHeight: 1, marginBottom: 10 }}
                  >
                    {result.icon}
                  </span>

                  {/* Big metric */}
                  <span
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: "#6ee7b7",
                      lineHeight: 1.1,
                      fontFamily: "'Telegram Sans', -apple-system, sans-serif",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {result.metricValue}
                  </span>

                  {/* Label */}
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.7)",
                      marginTop: 4,
                      lineHeight: 1.3,
                    }}
                  >
                    {result.metricLabel}
                  </span>

                  {/* Desc */}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 400,
                      color: "rgba(255,255,255,0.4)",
                      marginTop: 6,
                      lineHeight: 1.3,
                    }}
                  >
                    {result.description}
                  </span>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════
       *  PART 2: Light — Timeline Program
       * ═════════════════════════════════════════════════════ */}
      <div
        style={{
          width: "100%",
          padding: "56px 0",
          background: "#f8fafc",
          position: "relative",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            margin: "0 auto",
            padding: "0 24px",
          }}
        >
          {/* Section header */}
          <motion.div
            ref={timelineRef}
            variants={fadeInUp}
            initial="hidden"
            animate={timelineInView ? "visible" : "hidden"}
            style={{ textAlign: "center", marginBottom: 32 }}
          >
            <h3
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#0f172a",
                margin: "0 0 8px",
                fontFamily: "'Telegram Sans', -apple-system, sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              Программа курса
            </h3>
            <p
              style={{
                fontSize: 15,
                color: "#64748b",
                margin: 0,
              }}
            >
              Нажми на любой день, чтобы увидеть подробности
            </p>
          </motion.div>

          {/* Interactive Timeline */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate={timelineInView ? "visible" : "hidden"}
          >
            <Timeline days={visibleDays} />
          </motion.div>

          {/* ── BUY BUTTON #2 (after timeline) ────────── */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate={timelineInView ? "visible" : "hidden"}
            style={{ marginTop: 36 }}
          >
            <Button
              variant="primary"
              size="xl"
              icon="🌿"
              fullWidth
              haptic={haptic.medium}
              onClick={onBuyClick}
            >
              {buyButtonText}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════
       *  PART 3: Conditions + Guarantee + Price + BUY #3
       * ═════════════════════════════════════════════════════ */}
      <div
        style={{
          width: "100%",
          padding: "0 0 72px",
          background: "#f8fafc",
          position: "relative",
        }}
      >
        <div
          ref={guaranteeRef}
          style={{
            maxWidth: 480,
            margin: "0 auto",
            padding: "0 24px",
          }}
        >
          {/* ── Conditions Card ──────────────────────── */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate={guaranteeInView ? "visible" : "hidden"}
            style={{ marginBottom: 16 }}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 16,
                padding: 24,
                border: "1px solid rgba(0,0,0,0.04)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <h4
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#0f172a",
                  margin: "0 0 10px",
                  fontFamily: "'Telegram Sans', -apple-system, sans-serif",
                }}
              >
                📋 Условия участия
              </h4>
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: "#475569",
                  margin: 0,
                }}
              >
                {info.conditionsText}
              </p>
            </div>
          </motion.div>

          {/* ── Guarantee Card ───────────────────────── */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate={guaranteeInView ? "visible" : "hidden"}
            style={{ marginBottom: 32 }}
          >
            <div
              style={{
                borderRadius: 16,
                padding: 24,
                background:
                  "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.03) 100%)",
                border: "1.5px solid rgba(16,185,129,0.15)",
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              {/* Shield icon */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                }}
              >
                🛡
              </div>

              <div>
                <h4
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: "#0f172a",
                    margin: "0 0 6px",
                    fontFamily: "'Telegram Sans', -apple-system, sans-serif",
                  }}
                >
                  Гарантия {info.guaranteeDays} дней
                </h4>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: "#475569",
                    margin: 0,
                  }}
                >
                  {info.guaranteeText}
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── Price Block ──────────────────────────── */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate={guaranteeInView ? "visible" : "hidden"}
            style={{ marginBottom: 24 }}
          >
            <div
              style={{
                borderRadius: 20,
                padding: "28px 24px",
                background:
                  "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Glow */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: "-40%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "120%",
                  height: "80%",
                  background:
                    "radial-gradient(ellipse, rgba(16,185,129,0.12) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />

              <div style={{ position: "relative", zIndex: 1 }}>
                {/* Old price (зачёркнутая) */}
                {info.oldPriceStars && (
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 400,
                      color: "rgba(255,255,255,0.4)",
                      textDecoration: "line-through",
                      marginBottom: 4,
                      display: "block",
                    }}
                  >
                    {info.oldPriceStars} Stars
                  </span>
                )}

                {/* Current price */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: 28 }}>⭐</span>
                  <span
                    style={{
                      fontSize: 40,
                      fontWeight: 700,
                      color: "#ffffff",
                      fontFamily: "'Telegram Sans', -apple-system, sans-serif",
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                    }}
                  >
                    {info.priceStars}
                  </span>
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 400,
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    Stars
                  </span>
                </div>

                {/* Savings badge */}
                {info.oldPriceStars && info.oldPriceStars > info.priceStars && (
                  <div
                    style={{
                      display: "inline-flex",
                      padding: "4px 12px",
                      borderRadius: 100,
                      backgroundColor: "rgba(34,197,94,0.15)",
                      border: "1px solid rgba(34,197,94,0.25)",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#4ade80",
                      }}
                    >
                      Выгода {info.oldPriceStars - info.priceStars} Stars
                    </span>
                  </div>
                )}

                {/* What's included */}
                <div
                  style={{
                    marginTop: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    textAlign: "left",
                  }}
                >
                  {[
                    "Полная программа на 21 день",
                    "Ежедневные рекомендации",
                    "Закрытый чат с поддержкой",
                    "Персональная обратная связь",
                    "Бонусные материалы по уходу",
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 6,
                          backgroundColor: "rgba(16,185,129,0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M2.5 6L5 8.5L9.5 3.5"
                            stroke="#10b981"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span
                        style={{
                          fontSize: 14,
                          color: "rgba(255,255,255,0.75)",
                          lineHeight: 1.3,
                        }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── BUY BUTTON #3 (final, biggest) ───────── */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate={guaranteeInView ? "visible" : "hidden"}
          >
            <Button
              variant="success"
              size="hero"
              icon="🚀"
              fullWidth
              haptic={haptic.heavy}
              onClick={onBuyClick}
            >
              {buyButtonText}
            </Button>

            {/* Micro-text under button */}
            <p
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "#94a3b8",
                marginTop: 12,
                lineHeight: 1.4,
              }}
            >
              Безопасная оплата через Telegram • Мгновенный доступ
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
