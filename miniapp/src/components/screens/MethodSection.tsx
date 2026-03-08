/* ============================================================
 * 🌿 MethodSection — Секция «Метод работы»
 * ============================================================
 *
 * Дизайн (по спецификации):
 *   • Заголовок: 28px, bold
 *   • 4–6 пунктов (вертикальный список)
 *   • Каждый пункт:
 *       - Большая иконка (56px) в градиентном круге
 *       - Заголовок 18px, weight 600
 *       - Описание 15px, weight 400, color #475569
 *       - Кнопка «Хочу так же» (primary, sm)
 *   • Нумерация шагов (01, 02, 03…)
 *   • Соединительная линия между шагами
 *   • Фон: светлый (#f8fafc), без градиента
 *
 * Анимации (framer-motion):
 *   • Заголовок: fadeInUp
 *   • Каждый пункт: fadeInUp stagger 0.1s
 *   • Иконка: scaleIn при появлении
 *   • Линия: scaleY 0→1
 *   • Кнопка: появляется последней в каждом пункте
 *
 * ============================================================ */

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

import Button from "../ui/Button";
import {
  fadeInUp,
  scaleIn,
  staggerContainer,
} from "../../utils/animations";
import type { MethodItem as MethodItemType } from "../../types";

/* ── Props ────────────────────────────────────────────── */

interface MethodSectionProps {
  /** Заголовок секции */
  sectionTitle?: string;
  /** Подзаголовок */
  sectionSubtitle?: string;
  /** Текст кнопки на каждом пункте */
  buttonText?: string;
  /** Пункты метода (4–6 шт.) */
  items?: MethodItemType[];
  /** Callback: клик по «Хочу так же» */
  onItemCtaClick?: (itemId: number) => void;
}

/* ── Default items (из seed data) ─────────────────────── */

const DEFAULT_ITEMS: MethodItemType[] = [
  {
    id: 1,
    icon: "🧪",
    title: "Научный подход",
    description:
      "Все рекомендации основаны на исследованиях и клинической практике. Никаких мифов — только доказательная медицина.",
    sortOrder: 1,
    isVisible: true,
  },
  {
    id: 2,
    icon: "🥗",
    title: "Питание без голодания",
    description:
      "Сбалансированное детокс-меню, которое не требует жёстких ограничений. Ты будешь есть вкусно и с пользой.",
    sortOrder: 2,
    isVisible: true,
  },
  {
    id: 3,
    icon: "💆",
    title: "Уход за кожей изнутри",
    description:
      "Специальные протоколы для восстановления чистоты и сияния кожи. Работаем с причиной, а не симптомами.",
    sortOrder: 3,
    isVisible: true,
  },
  {
    id: 4,
    icon: "🏃",
    title: "Мягкая активность",
    description:
      "Лёгкие упражнения и лимфодренажные практики для каждого дня. Без изнурительных тренировок.",
    sortOrder: 4,
    isVisible: true,
  },
  {
    id: 5,
    icon: "🧘",
    title: "Баланс и спокойствие",
    description:
      "Техники управления стрессом, который напрямую влияет на кожу и вес. Восстанавливаем внутреннюю гармонию.",
    sortOrder: 5,
    isVisible: true,
  },
];

/* ── Component ────────────────────────────────────────── */

export default function MethodSection({
  sectionTitle = "Мой метод работы",
  sectionSubtitle = "Научно обоснованный подход к детоксикации",
  buttonText = "Хочу так же",
  items = DEFAULT_ITEMS,
  onItemCtaClick,
}: MethodSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  const visibleItems = items
    .filter((item) => item.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        width: "100%",
        padding: "64px 0 72px",
        background: "#f8fafc",
        overflow: "hidden",
      }}
    >
      {/* ── Декоративные элементы фона ─────────────────── */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {/* Точечная сетка */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.3,
            backgroundImage:
              "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Правый blob */}
        <div
          style={{
            position: "absolute",
            top: "15%",
            right: "-20%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%)",
          }}
        />
        {/* Левый blob */}
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "-15%",
            width: 250,
            height: 250,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 480,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* ═══════════════════════════════════════════════
         *  Заголовок секции (28px)
         * ═══════════════════════════════════════════════ */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{ textAlign: "center", marginBottom: 48 }}
        >
          {/* Мини-badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 100,
              backgroundColor: "rgba(16, 185, 129, 0.08)",
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 12 }}>🔬</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#10b981",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Методология
            </span>
          </div>

          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#0f172a",
              margin: "0 0 8px",
              fontFamily: "'Telegram Sans', -apple-system, sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            {sectionTitle}
          </h2>

          {/* Акцентная линия */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.3,
              ease: [0.25, 1, 0.5, 1],
            }}
            style={{
              width: 48,
              height: 3,
              borderRadius: 2,
              background: "linear-gradient(90deg, #10b981, #6ee7b7)",
              margin: "12px auto 16px",
              transformOrigin: "center",
            }}
          />

          <p
            style={{
              fontSize: 16,
              fontWeight: 400,
              color: "#64748b",
              margin: 0,
              maxWidth: 340,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.5,
              fontFamily: "'Telegram Sans', -apple-system, sans-serif",
            }}
          >
            {sectionSubtitle}
          </p>
        </motion.div>

        {/* ═══════════════════════════════════════════════
         *  Список пунктов (вертикальный с timeline-линией)
         * ═══════════════════════════════════════════════ */}
        <motion.div
          variants={staggerContainer(0.1, 0.15)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            position: "relative",
          }}
        >
          {/* Соединительная линия */}
          <motion.div
            aria-hidden
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
            style={{
              position: "absolute",
              left: 27, /* центр иконки */
              top: 56,
              bottom: 56,
              width: 2,
              background:
                "linear-gradient(180deg, #10b981 0%, rgba(16,185,129,0.15) 100%)",
              transformOrigin: "top",
              borderRadius: 1,
              zIndex: 0,
            }}
          />

          {visibleItems.map((item, index) => (
            <MethodItemCard
              key={item.id}
              item={item}
              index={index}
              total={visibleItems.length}
              buttonText={buttonText}
              onCtaClick={() => onItemCtaClick?.(item.id)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
 * Отдельный пункт метода
 * ═══════════════════════════════════════════════════════════ */

interface MethodItemCardProps {
  item: MethodItemType;
  index: number;
  total: number;
  buttonText: string;
  onCtaClick?: () => void;
}

function MethodItemCard({
  item,
  index,
  total,
  buttonText,
  onCtaClick,
}: MethodItemCardProps) {
  const stepNumber = String(index + 1).padStart(2, "0");
  const isLast = index === total - 1;

  return (
    <motion.div
      variants={fadeInUp}
      style={{
        display: "flex",
        gap: 20,
        position: "relative",
        zIndex: 1,
        padding: "0 0 32px 0",
        /* Убираем нижний padding у последнего */
        ...(isLast ? { paddingBottom: 0 } : {}),
      }}
    >
      {/* ── Левая часть: иконка + номер ──────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        {/* Большая иконка в градиентном круге (56px) */}
        <motion.div
          variants={scaleIn}
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
            border: "1.5px solid rgba(16, 185, 129, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            lineHeight: 1,
            boxShadow:
              "0 4px 16px rgba(16, 185, 129, 0.1), 0 1px 4px rgba(0,0,0,0.04)",
            position: "relative",
          }}
        >
          {item.icon}

          {/* Номер шага (badge в углу) */}
          <div
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              width: 22,
              height: 22,
              borderRadius: 7,
              backgroundColor: "#10b981",
              color: "#ffffff",
              fontSize: 11,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(16, 185, 129, 0.4)",
              fontFamily: "'Telegram Sans', -apple-system, sans-serif",
            }}
          >
            {stepNumber}
          </div>
        </motion.div>
      </div>

      {/* ── Правая часть: контент ────────────────────── */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          paddingTop: 4,
        }}
      >
        {/* Карточка-контейнер */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 16,
            padding: "20px 20px 18px",
            border: "1px solid rgba(0, 0, 0, 0.04)",
            boxShadow:
              "0 2px 12px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.03)",
          }}
        >
          {/* Заголовок: 18px */}
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#0f172a",
              margin: "0 0 6px",
              fontFamily: "'Telegram Sans', -apple-system, sans-serif",
              letterSpacing: "-0.01em",
              lineHeight: 1.3,
            }}
          >
            {item.title}
          </h3>

          {/* Описание: 15px */}
          <p
            style={{
              fontSize: 15,
              fontWeight: 400,
              lineHeight: 1.55,
              color: "#475569",
              margin: "0 0 16px",
              fontFamily: "'Telegram Sans', -apple-system, sans-serif",
            }}
          >
            {item.description}
          </p>

          {/* Кнопка «Хочу так же» */}
          <Button
            variant="primary"
            size="sm"
            haptic={undefined}
            onClick={onCtaClick}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
