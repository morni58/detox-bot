/* ============================================================
 * 🌿 CasesSection — Кейсы клиенток (до/после)
 * ============================================================
 *
 * Дизайн (по спецификации):
 *   • Горизонтальный ScrollSnap-карусель
 *   • Каждая карточка: ~85% ширины экрана, snap: center
 *   • Содержимое карточки:
 *       - До/После фото (2 колонки, одинаковая высота)
 *       - Имя + возраст
 *       - Краткий результат (bold, emerald)
 *       - Полный отзыв (14px)
 *       - Кавычки-декор
 *   • Точки-индикаторы (dots) внизу
 *   • Фон секции: мягкий gradient mint → white
 *
 * Анимации (framer-motion):
 *   • Заголовок: fadeInUp
 *   • Карточки: drag="x" + snapTo
 *   • Активная точка: scale pulse
 *   • Фото: scale hover
 *
 * ============================================================ */

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";

import { useTelegram } from "../../hooks/useTelegram";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import type { CaseStudy } from "../../types";

/* ── Props ────────────────────────────────────────────── */

interface CasesSectionProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  cases?: CaseStudy[];
}

/* ── Default data (из seeds) ──────────────────────────── */

const DEFAULT_CASES: CaseStudy[] = [
  {
    id: 1,
    clientName: "Марина",
    clientAge: 38,
    resultText: "Минус 6 кг, чистая кожа",
    reviewText:
      "За 21 день ушло 6 кг и кожа стала чистой впервые за 3 года! Я не верила, что это возможно без жёстких диет. Спасибо за этот курс — он изменил мой подход к здоровью!",
    photoBefore: "",
    photoAfter: "",
    sortOrder: 1,
    isVisible: true,
  },
  {
    id: 2,
    clientName: "Елена",
    clientAge: 42,
    resultText: "Ушли отёки, свежий цвет лица",
    reviewText:
      "Подруги спрашивают, что я сделала с лицом. Отёки ушли, цвет лица стал свежим. И это всего за 3 недели! Буду рекомендовать всем знакомым.",
    photoBefore: "",
    photoAfter: "",
    sortOrder: 2,
    isVisible: true,
  },
  {
    id: 3,
    clientName: "Анна",
    clientAge: 36,
    resultText: "Энергия и лёгкость",
    reviewText:
      "Энергии столько, что я снова начала бегать по утрам. Минус 4 кг — приятный бонус. Главное — я чувствую себя совершенно другим человеком.",
    photoBefore: "",
    photoAfter: "",
    sortOrder: 3,
    isVisible: true,
  },
  {
    id: 4,
    clientName: "Ольга",
    clientAge: 45,
    resultText: "Метод, который работает",
    reviewText:
      "Наконец-то нашла метод, который работает без голодания. Минус 5 кг, кожа сияет, и я научилась справляться со стрессом. Лучшая инвестиция в себя!",
    photoBefore: "",
    photoAfter: "",
    sortOrder: 4,
    isVisible: true,
  },
];

/* ── Component ────────────────────────────────────────── */

export default function CasesSection({
  sectionTitle = "Реальные результаты",
  sectionSubtitle = "Каждая из них прошла этот путь",
  cases = DEFAULT_CASES,
}: CasesSectionProps) {
  const { haptic } = useTelegram();
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  const visibleCases = cases
    .filter((c) => c.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const [activeIndex, setActiveIndex] = useState(0);

  /* ── Scroll tracking for dots ──────────────────────── */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / visibleCases.length;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.min(idx, visibleCases.length - 1));
  }, [visibleCases.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  /* ── Dot click → scroll to card ────────────────────── */
  const scrollToCard = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / visibleCases.length;
    el.scrollTo({ left: cardWidth * index, behavior: "smooth" });
    haptic.selection();
  };

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        width: "100%",
        padding: "64px 0 56px",
        overflow: "hidden",
        background:
          "linear-gradient(180deg, #f8fafc 0%, #ecfdf5 50%, #f8fafc 100%)",
      }}
    >
      {/* ── Decorative glow ──────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "140%",
          height: "50%",
          background:
            "radial-gradient(ellipse, rgba(16,185,129,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ═══════════════════════════════════════════════
       *  Section Header
       * ═══════════════════════════════════════════════ */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        style={{
          textAlign: "center",
          padding: "0 24px",
          marginBottom: 36,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            borderRadius: 100,
            backgroundColor: "rgba(16,185,129,0.08)",
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 12 }}>📸</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#10b981",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            До / После
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

        {/* Accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
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
          }}
        >
          {sectionSubtitle}
        </p>
      </motion.div>

      {/* ═══════════════════════════════════════════════
       *  Horizontal Scroll-Snap Carousel
       * ═══════════════════════════════════════════════ */}
      <motion.div
        variants={staggerContainer(0.08, 0.1)}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <div
          ref={scrollRef}
          style={{
            display: "flex",
            gap: 16,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
            padding: "0 24px 8px",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {visibleCases.map((cs, idx) => (
            <CaseCard key={cs.id} caseStudy={cs} index={idx} />
          ))}

          {/* Spacer at end for last card centering */}
          <div style={{ flexShrink: 0, width: 8 }} />
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════
       *  Dot Indicators
       * ═══════════════════════════════════════════════ */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginTop: 24,
        }}
      >
        {visibleCases.map((_, idx) => {
          const isActive = idx === activeIndex;
          return (
            <motion.button
              key={idx}
              onClick={() => scrollToCard(idx)}
              animate={{
                width: isActive ? 24 : 8,
                backgroundColor: isActive ? "#10b981" : "#cbd5e1",
              }}
              transition={{ duration: 0.25 }}
              style={{
                height: 8,
                borderRadius: 4,
                border: "none",
                cursor: "pointer",
                outline: "none",
                padding: 0,
                WebkitTapHighlightColor: "transparent",
                boxShadow: isActive
                  ? "0 0 8px rgba(16,185,129,0.4)"
                  : "none",
              }}
            />
          );
        })}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
 * Single Case Card
 * ═══════════════════════════════════════════════════════════ */

interface CaseCardProps {
  caseStudy: CaseStudy;
  index: number;
}

function CaseCard({ caseStudy: cs, index }: CaseCardProps) {
  const hasBefore = cs.photoBefore && !cs.photoBefore.includes("placeholder");
  const hasAfter = cs.photoAfter && !cs.photoAfter.includes("placeholder");

  return (
    <motion.div
      variants={fadeInUp}
      className="scroll-snap-item"
      style={{
        flexShrink: 0,
        width: "85%",
        maxWidth: 360,
        scrollSnapAlign: "center",
        borderRadius: 20,
        backgroundColor: "#ffffff",
        border: "1px solid rgba(0,0,0,0.04)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03)",
        overflow: "hidden",
      }}
    >
      {/* ── Before / After Photos ────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 0,
          height: 180,
          position: "relative",
        }}
      >
        {/* Before */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            backgroundColor: "#fef2f2",
          }}
        >
          {hasBefore ? (
            <img
              src={cs.photoBefore}
              alt={`${cs.clientName} до`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
              }}
            >
              😔
            </div>
          )}
          {/* Label "До" */}
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              padding: "3px 10px",
              borderRadius: 8,
              backgroundColor: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#ffffff",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              До
            </span>
          </div>
        </div>

        {/* After */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            backgroundColor: "#ecfdf5",
          }}
        >
          {hasAfter ? (
            <img
              src={cs.photoAfter}
              alt={`${cs.clientName} после`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
              }}
            >
              🤩
            </div>
          )}
          {/* Label "После" */}
          <div
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              padding: "3px 10px",
              borderRadius: 8,
              backgroundColor: "rgba(16,185,129,0.85)",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#ffffff",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              После
            </span>
          </div>
        </div>

        {/* Center divider arrow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: "#ffffff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* ── Card Content ─────────────────────────────── */}
      <div style={{ padding: "20px 20px 24px" }}>
        {/* Name + Age */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: "#0f172a",
              fontFamily: "'Telegram Sans', -apple-system, sans-serif",
            }}
          >
            {cs.clientName}
          </span>
          {cs.clientAge && (
            <span
              style={{
                fontSize: 13,
                fontWeight: 400,
                color: "#94a3b8",
              }}
            >
              {cs.clientAge} лет
            </span>
          )}
        </div>

        {/* Result text (bold emerald) */}
        <div
          style={{
            display: "inline-flex",
            padding: "4px 12px",
            borderRadius: 8,
            backgroundColor: "rgba(16,185,129,0.08)",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#059669",
              fontFamily: "'Telegram Sans', -apple-system, sans-serif",
            }}
          >
            ✨ {cs.resultText}
          </span>
        </div>

        {/* Quote decoration */}
        <div
          style={{
            position: "relative",
            paddingLeft: 16,
            borderLeft: "3px solid rgba(16,185,129,0.2)",
          }}
        >
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: -8,
              left: -4,
              fontSize: 32,
              color: "rgba(16,185,129,0.15)",
              fontWeight: 700,
              lineHeight: 1,
              fontFamily: "Georgia, serif",
            }}
          >
            «
          </span>
          <p
            style={{
              fontSize: 14,
              fontWeight: 400,
              lineHeight: 1.6,
              color: "#475569",
              margin: 0,
              fontFamily: "'Telegram Sans', -apple-system, sans-serif",
            }}
          >
            {cs.reviewText}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
