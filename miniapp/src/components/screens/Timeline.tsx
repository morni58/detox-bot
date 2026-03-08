/* ============================================================
 * 🌿 Timeline — Интерактивная программа 21 дня
 * ============================================================
 *
 * Дизайн:
 *   • Табы недель (1 / 2 / 3) — горизонтальные pill-кнопки
 *   • 7 дней в каждой неделе — вертикальный список
 *   • Каждый день: кликабельный, раскрывает описание
 *   • Раскрытый день: полное описание + список задач
 *   • Активный день: emerald border + glow
 *   • Timeline-линия слева (gradient)
 *
 * Анимации:
 *   • Переключение недель: fadeInUp stagger
 *   • Раскрытие дня: height auto + fadeIn (AnimatePresence)
 *   • Точка на timeline: scale pulse при активном
 *
 * ============================================================ */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { CourseDay } from "../../types";

/* ── Props ────────────────────────────────────────────── */

interface TimelineProps {
  days: CourseDay[];
  /** Haptic feedback на клик */
  onDayClick?: (dayNumber: number) => void;
}

/* ── Week Tab Labels ──────────────────────────────────── */

const WEEKS = [
  { num: 1, label: "Неделя 1", subtitle: "Мягкий старт" },
  { num: 2, label: "Неделя 2", subtitle: "Глубокое очищение" },
  { num: 3, label: "Неделя 3", subtitle: "Закрепление" },
];

/* ── Component ────────────────────────────────────────── */

export default function Timeline({ days, onDayClick }: TimelineProps) {
  const [activeWeek, setActiveWeek] = useState(1);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  /* Фильтруем дни по активной неделе */
  const weekDays = useMemo(
    () =>
      days
        .filter((d) => {
          if (activeWeek === 1) return d.dayNumber >= 1 && d.dayNumber <= 7;
          if (activeWeek === 2) return d.dayNumber >= 8 && d.dayNumber <= 14;
          return d.dayNumber >= 15 && d.dayNumber <= 21;
        })
        .sort((a, b) => a.dayNumber - b.dayNumber),
    [days, activeWeek],
  );

  const handleDayClick = (dayNum: number) => {
    setExpandedDay((prev) => (prev === dayNum ? null : dayNum));
    onDayClick?.(dayNum);
  };

  return (
    <div>
      {/* ═══════════════════════════════════════════════
       *  Week Tabs
       * ═══════════════════════════════════════════════ */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 28,
          overflowX: "auto",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          padding: "0 0 4px",
        }}
      >
        {WEEKS.map((week) => {
          const isActive = activeWeek === week.num;
          return (
            <motion.button
              key={week.num}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setActiveWeek(week.num);
                setExpandedDay(null);
              }}
              style={{
                flex: 1,
                minWidth: 0,
                padding: "12px 8px",
                borderRadius: 14,
                border: isActive
                  ? "1.5px solid #10b981"
                  : "1.5px solid rgba(0,0,0,0.06)",
                background: isActive
                  ? "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.04) 100%)"
                  : "#ffffff",
                cursor: "pointer",
                outline: "none",
                WebkitTapHighlightColor: "transparent",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                boxShadow: isActive
                  ? "0 2px 12px rgba(16,185,129,0.15)"
                  : "0 1px 4px rgba(0,0,0,0.04)",
                transition: "all 0.2s ease",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: isActive ? "#10b981" : "#0f172a",
                  fontFamily: "'Telegram Sans', -apple-system, sans-serif",
                }}
              >
                {week.label}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 400,
                  color: isActive ? "#059669" : "#94a3b8",
                  fontFamily: "'Telegram Sans', -apple-system, sans-serif",
                }}
              >
                {week.subtitle}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════
       *  Days List (with timeline line)
       * ═══════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeWeek}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
          style={{ position: "relative" }}
        >
          {/* Vertical timeline line */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 15,
              top: 20,
              bottom: 20,
              width: 2,
              background:
                "linear-gradient(180deg, #10b981 0%, rgba(16,185,129,0.12) 100%)",
              borderRadius: 1,
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {weekDays.map((day, i) => (
              <DayItem
                key={day.dayNumber}
                day={day}
                index={i}
                isExpanded={expandedDay === day.dayNumber}
                onClick={() => handleDayClick(day.dayNumber)}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * Single Day Item
 * ═══════════════════════════════════════════════════════════ */

interface DayItemProps {
  day: CourseDay;
  index: number;
  isExpanded: boolean;
  onClick: () => void;
}

function DayItem({ day, index, isExpanded, onClick }: DayItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      {/* ── Clickable Header ─────────────────────────── */}
      <motion.button
        whileTap={{ scale: 0.985 }}
        onClick={onClick}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 16px 14px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          outline: "none",
          WebkitTapHighlightColor: "transparent",
          textAlign: "left",
        }}
      >
        {/* Timeline dot */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            background: isExpanded
              ? "linear-gradient(135deg, #10b981, #059669)"
              : "#ffffff",
            border: isExpanded
              ? "none"
              : "1.5px solid #e2e8f0",
            boxShadow: isExpanded
              ? "0 2px 10px rgba(16,185,129,0.35)"
              : "0 1px 3px rgba(0,0,0,0.04)",
            color: isExpanded ? "#ffffff" : undefined,
            transition: "all 0.2s ease",
            zIndex: 1,
          }}
        >
          {isExpanded ? "✓" : day.icon}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: isExpanded ? "#10b981" : "#94a3b8",
                fontFamily: "'Telegram Sans', -apple-system, sans-serif",
                letterSpacing: "0.02em",
              }}
            >
              ДЕНЬ {day.dayNumber}
            </span>
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: isExpanded ? "#0f172a" : "#334155",
                fontFamily: "'Telegram Sans', -apple-system, sans-serif",
              }}
            >
              {day.title}
            </span>
          </div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: "#64748b",
              margin: "2px 0 0",
              lineHeight: 1.4,
              fontFamily: "'Telegram Sans', -apple-system, sans-serif",
            }}
          >
            {day.shortDesc}
          </p>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ flexShrink: 0, color: "#94a3b8" }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M4.5 6.75L9 11.25L13.5 6.75"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.button>

      {/* ── Expandable Content ───────────────────────── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            style={{ overflow: "hidden", marginLeft: 46 }}
          >
            <div
              style={{
                padding: "4px 16px 20px 0",
              }}
            >
              {/* Full description */}
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "#475569",
                  margin: "0 0 14px",
                  fontFamily: "'Telegram Sans', -apple-system, sans-serif",
                }}
              >
                {day.fullDesc}
              </p>

              {/* Tasks checklist */}
              {day.tasks && day.tasks.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#10b981",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    Задачи на день
                  </span>
                  {day.tasks.map((task, ti) => (
                    <div
                      key={ti}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        padding: "8px 12px",
                        borderRadius: 10,
                        backgroundColor: "rgba(16,185,129,0.05)",
                        border: "1px solid rgba(16,185,129,0.08)",
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 5,
                          border: "1.5px solid #10b981",
                          flexShrink: 0,
                          marginTop: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 2,
                            backgroundColor: "rgba(16,185,129,0.3)",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 14,
                          color: "#334155",
                          lineHeight: 1.4,
                          fontFamily: "'Telegram Sans', -apple-system, sans-serif",
                        }}
                      >
                        {task}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
