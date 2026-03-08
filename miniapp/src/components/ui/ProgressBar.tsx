/* ============================================================
 * 🌿 ProgressBar — Полоса прогресса (Quiz + любые шаги)
 * ============================================================
 *
 * Дизайн:
 *   • Высота трека: 6px, border-radius: full
 *   • Трек: #e2e8f0 (light) / rgba(255,255,255,0.1) (dark)
 *   • Заполнение: emerald gradient, spring-анимация
 *   • Пульсирующее свечение на кончике
 *   • Лейбл: "2 / 5" справа сверху
 *
 * ============================================================ */

import { motion } from "framer-motion";

interface ProgressBarProps {
  /** Текущий шаг (1-based) */
  current: number;
  /** Всего шагов */
  total: number;
  /** Тёмная тема */
  dark?: boolean;
  /** Показывать лейбл "2/5" */
  showLabel?: boolean;
  /** Высота полосы (px) */
  height?: number;
}

export default function ProgressBar({
  current,
  total,
  dark = false,
  showLabel = true,
  height = 6,
}: ProgressBarProps) {
  const progress = Math.min(Math.max(current / total, 0), 1);

  return (
    <div>
      {/* Label */}
      {showLabel && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: dark ? "rgba(255,255,255,0.5)" : "#64748b",
              fontFamily: "'Telegram Sans', -apple-system, sans-serif",
            }}
          >
            Вопрос {current} из {total}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#10b981",
              fontFamily: "'Telegram Sans', -apple-system, sans-serif",
            }}
          >
            {Math.round(progress * 100)}%
          </span>
        </div>
      )}

      {/* Track */}
      <div
        style={{
          width: "100%",
          height,
          borderRadius: height,
          backgroundColor: dark
            ? "rgba(255,255,255,0.08)"
            : "#e2e8f0",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 25,
          }}
          style={{
            height: "100%",
            borderRadius: height,
            background:
              "linear-gradient(90deg, #10b981 0%, #22c55e 100%)",
            position: "relative",
          }}
        >
          {/* Glow tip */}
          <div
            style={{
              position: "absolute",
              right: -2,
              top: "50%",
              transform: "translateY(-50%)",
              width: height + 6,
              height: height + 6,
              borderRadius: "50%",
              backgroundColor: "#22c55e",
              boxShadow: "0 0 12px rgba(34, 197, 94, 0.6)",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
