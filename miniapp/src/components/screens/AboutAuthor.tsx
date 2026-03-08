/* ============================================================
 * 🌿 AboutAuthor — Секция «Об авторе»
 * ============================================================
 *
 * Дизайн (по спецификации):
 *   • Большое круглое фото автора: 200×200px, border 4px emerald
 *   • 5 карточек (grid 1-col mobile):
 *       1. Кто я
 *       2. Опыт
 *       3. Образование
 *       4. Чем занимаюсь сейчас
 *       5. Иная информация
 *   • Каждая карточка:
 *       - emoji-иконка в цветном круге
 *       - заголовок: 20px, weight 600
 *       - текст: 16px, weight 400
 *       - анимация: fadeInUp (stagger 0.08s)
 *   • Фон: мягкий radial gradient (light mint)
 *   • Отступы: padding 24px / 32px
 *
 * Анимации (framer-motion):
 *   • Фото: scaleIn (0→1, spring)
 *   • Секция title: fadeInUp
 *   • Карточки: staggerContainer → fadeInUp каскадом
 *   • Зелёная линия-акцент: scaleX 0→1
 *
 * ============================================================ */

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

import Card from "../ui/Card";
import {
  fadeInUp,
  scaleIn,
  staggerContainer,
} from "../../utils/animations";
import type { AuthorCard as AuthorCardType } from "../../types";

/* ── Props ────────────────────────────────────────────── */

interface AboutAuthorProps {
  /** Заголовок секции */
  sectionTitle?: string;
  /** Подзаголовок */
  sectionSubtitle?: string;
  /** URL круглого фото автора (200px) */
  avatarUrl?: string;
  /** 5 карточек с информацией */
  cards?: AuthorCardType[];
}

/* ── Default cards (из seed data) ─────────────────────── */

const DEFAULT_CARDS: AuthorCardType[] = [
  {
    id: 1,
    icon: "👋",
    title: "Кто я",
    description:
      "Привет! Я — нутрициолог и специалист по детоксикации с медицинским образованием.",
    sortOrder: 1,
    isVisible: true,
  },
  {
    id: 2,
    icon: "📊",
    title: "Опыт",
    description:
      "Более 10 лет практики. 500+ консультаций. 200+ клиенток прошли мои программы.",
    sortOrder: 2,
    isVisible: true,
  },
  {
    id: 3,
    icon: "🎓",
    title: "Образование",
    description:
      "Высшее медицинское образование. Специализация: нутрициология и превентивная медицина.",
    sortOrder: 3,
    isVisible: true,
  },
  {
    id: 4,
    icon: "🔬",
    title: "Чем занимаюсь сейчас",
    description:
      "Веду детокс-программы для женщин 35+. Помогаю вернуть здоровье кожи и комфортный вес.",
    sortOrder: 4,
    isVisible: true,
  },
  {
    id: 5,
    icon: "💚",
    title: "Мой подход",
    description:
      "Мягкий, научно обоснованный детокс без голодовок. Подходит для повседневной жизни.",
    sortOrder: 5,
    isVisible: true,
  },
];

/* ── Component ────────────────────────────────────────── */

export default function AboutAuthor({
  sectionTitle = "Об авторе",
  sectionSubtitle = "Познакомьтесь с создателем курса",
  avatarUrl,
  cards = DEFAULT_CARDS,
}: AboutAuthorProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  const visibleCards = cards
    .filter((c) => c.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        width: "100%",
        padding: "64px 0 72px",
        overflow: "hidden",
        /* Мягкий фон с mint-оттенком */
        background:
          "linear-gradient(180deg, #f8fafc 0%, #ecfdf5 50%, #f8fafc 100%)",
      }}
    >
      {/* ── Декоративный фон: радиальное свечение ─────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "140%",
          height: "60%",
          background:
            "radial-gradient(ellipse at center, rgba(16, 185, 129, 0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

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
         *  Круглое фото автора (200px)
         * ═══════════════════════════════════════════════ */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              position: "relative",
              width: 200,
              height: 200,
            }}
          >
            {/* Внешнее свечение */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: -12,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
              }}
            />

            {/* Рамка с градиентом */}
            <div
              style={{
                position: "absolute",
                inset: -4,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, #10b981 0%, #059669 50%, #6ee7b7 100%)",
                padding: 4,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  overflow: "hidden",
                  backgroundColor: "#e2e8f0",
                }}
              >
                {avatarUrl && !avatarUrl.includes("placeholder") ? (
                  <img
                    src={avatarUrl}
                    alt="Автор курса"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  /* Placeholder avatar */
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background:
                        "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 64,
                    }}
                  >
                    👩‍⚕️
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════
         *  Заголовок секции
         * ═══════════════════════════════════════════════ */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{ textAlign: "center", marginBottom: 40 }}
        >
          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#0f172a",
              margin: "0 0 8px",
              fontFamily:
                "'Telegram Sans', -apple-system, sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            {sectionTitle}
          </h2>

          {/* Акцентная линия */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
            style={{
              width: 48,
              height: 3,
              borderRadius: 2,
              background:
                "linear-gradient(90deg, #10b981, #6ee7b7)",
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
              fontFamily:
                "'Telegram Sans', -apple-system, sans-serif",
            }}
          >
            {sectionSubtitle}
          </p>
        </motion.div>

        {/* ═══════════════════════════════════════════════
         *  5 карточек (grid 1-col mobile)
         * ═══════════════════════════════════════════════ */}
        <motion.div
          variants={staggerContainer(0.08, 0.1)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {visibleCards.map((card) => (
            <Card
              key={card.id}
              variant="elevated"
              icon={card.icon}
              iconSize={48}
              style={{ padding: 24 }}
            >
              {/* Заголовок карточки: 20px */}
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#0f172a",
                  margin: "0 0 8px",
                  fontFamily:
                    "'Telegram Sans', -apple-system, sans-serif",
                  letterSpacing: "-0.01em",
                }}
              >
                {card.title}
              </h3>

              {/* Описание: 16px */}
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 400,
                  lineHeight: 1.55,
                  color: "#475569",
                  margin: 0,
                  fontFamily:
                    "'Telegram Sans', -apple-system, sans-serif",
                }}
              >
                {card.description}
              </p>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
