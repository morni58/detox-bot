/* ============================================================
 * 🌿 Card — Design System Card Component
 * ============================================================
 *
 * Variants:
 *   solid  → белый фон, shadow-xl (светлая тема)
 *   glass  → blur + полупрозрачность (поверх тёмных фонов)
 *   outline → прозрачный + border
 *   elevated → solid + усиленная тень + hover-подъём
 *
 * Features:
 *   - framer-motion fadeInUp при появлении
 *   - Поддержка иконки (emoji) слева или сверху
 *   - radius 16px, padding 24px (по дизайн-системе)
 *   - hover: translate -2px + shadow усиление
 *
 * ============================================================ */

import { type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { fadeInUp } from "../../utils/animations";

/* ── Types ────────────────────────────────────────────── */

type CardVariant = "solid" | "glass" | "outline" | "elevated";

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  /** Emoji-иконка (отображается в цветном круге) */
  icon?: string;
  /** Размер иконки-круга */
  iconSize?: number;
  /** Кастомная анимация (по умолчанию fadeInUp) */
  variants?: Variants;
  /** Кликабельная карточка */
  onClick?: () => void;
  /** Inline-стили для обёртки */
  style?: React.CSSProperties;
  className?: string;
}

/* ── Variant Styles ───────────────────────────────────── */

const VARIANT_STYLES: Record<CardVariant, React.CSSProperties> = {
  solid: {
    backgroundColor: "#ffffff",
    border: "1px solid rgba(0, 0, 0, 0.04)",
    boxShadow:
      "0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04)",
  },
  glass: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  },
  outline: {
    backgroundColor: "transparent",
    border: "1.5px solid rgba(16, 185, 129, 0.2)",
    boxShadow: "none",
  },
  elevated: {
    backgroundColor: "#ffffff",
    border: "1px solid rgba(0, 0, 0, 0.03)",
    boxShadow:
      "0 12px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
  },
};

/* ── Component ────────────────────────────────────────── */

export default function Card({
  children,
  variant = "solid",
  icon,
  iconSize = 48,
  variants: customVariants,
  onClick,
  style,
  className,
}: CardProps) {
  const isClickable = !!onClick;

  return (
    <motion.div
      variants={customVariants ?? fadeInUp}
      whileHover={
        isClickable
          ? {
              y: -3,
              boxShadow:
                variant === "glass"
                  ? "0 12px 40px rgba(0,0,0,0.2)"
                  : "0 16px 48px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.06)",
              transition: { duration: 0.25 },
            }
          : undefined
      }
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={className}
      style={{
        ...VARIANT_STYLES[variant],
        borderRadius: 16,
        padding: 24,
        position: "relative",
        overflow: "hidden",
        cursor: isClickable ? "pointer" : "default",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
    >
      {/* ── Icon Circle ────────────────────────────── */}
      {icon && (
        <div
          style={{
            width: iconSize,
            height: iconSize,
            borderRadius: iconSize * 0.28,
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            fontSize: iconSize * 0.5,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      )}

      {children}
    </motion.div>
  );
}
