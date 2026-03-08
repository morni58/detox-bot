/* ============================================================
 * 🌿 Button — Design System Button Component
 * ============================================================
 *
 * Variants:
 *   primary   → #10b981 emerald (градиент)
 *   success   → #22c55e green (градиент + пульсация)
 *   secondary → прозрачный с рамкой
 *   ghost     → без фона, текстовая
 *
 * Sizes:
 *   sm   → 40px height
 *   md   → 48px height
 *   lg   → 56px height
 *   xl   → 60px height (CTA)
 *   hero → 70px height (финальный CTA)
 *
 * Features:
 *   - framer-motion tap/hover
 *   - shimmer эффект на success
 *   - haptic feedback
 *   - emoji icon support
 * ============================================================ */

import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { buttonTap, buttonHover } from "../../utils/animations";
import type { ButtonVariant, ButtonSize } from "../../types";

interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children" | "style"> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  fullWidth?: boolean;
  loading?: boolean;
  haptic?: () => void;
}

/* ── Размеры ──────────────────────────────────────────── */

const SIZE_STYLES: Record<ButtonSize, React.CSSProperties> = {
  sm: { height: 40, fontSize: 14, padding: "0 16px", borderRadius: 12 },
  md: { height: 48, fontSize: 16, padding: "0 24px", borderRadius: 16 },
  lg: { height: 56, fontSize: 17, padding: "0 28px", borderRadius: 16 },
  xl: { height: 60, fontSize: 18, padding: "0 32px", borderRadius: 16 },
  hero: { height: 70, fontSize: 20, padding: "0 36px", borderRadius: 20 },
};

/* ── Варианты ─────────────────────────────────────────── */

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#ffffff",
    border: "none",
    boxShadow: "0 4px 20px rgba(16, 185, 129, 0.35), 0 2px 8px rgba(16, 185, 129, 0.2)",
  },
  success: {
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    color: "#ffffff",
    border: "none",
    boxShadow: "0 4px 24px rgba(34, 197, 94, 0.4), 0 2px 8px rgba(34, 197, 94, 0.25)",
  },
  secondary: {
    background: "rgba(255, 255, 255, 0.08)",
    color: "#ffffff",
    border: "1.5px solid rgba(255, 255, 255, 0.25)",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(12px)",
  },
  ghost: {
    background: "transparent",
    color: "#10b981",
    border: "none",
    boxShadow: "none",
  },
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  fullWidth = false,
  loading = false,
  haptic: hapticFn,
  onClick,
  ...rest
}: ButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) return;
    hapticFn?.();
    onClick?.(e);
  };

  return (
    <motion.button
      whileTap={buttonTap}
      whileHover={buttonHover}
      onClick={handleClick}
      disabled={loading}
      style={{
        ...VARIANT_STYLES[variant],
        ...SIZE_STYLES[size],
        width: fullWidth ? "100%" : "auto",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        fontFamily: "'Telegram Sans', -apple-system, sans-serif",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        cursor: loading ? "wait" : "pointer",
        opacity: loading ? 0.7 : 1,
        position: "relative",
        overflow: "hidden",
        WebkitTapHighlightColor: "transparent",
        outline: "none",
        transition: "opacity 0.2s ease",
      }}
      {...rest}
    >
      {/* Shimmer effect для success-кнопок */}
      {variant === "success" && !loading && (
        <motion.span
          aria-hidden
          animate={{
            x: ["-100%", "300%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 4,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "30%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Loading spinner */}
      {loading && (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            display: "inline-block",
            width: 18,
            height: 18,
            border: "2px solid rgba(255,255,255,0.3)",
            borderTopColor: "#fff",
            borderRadius: "50%",
          }}
        />
      )}

      {/* Icon (emoji) */}
      {icon && !loading && (
        <span style={{ fontSize: size === "hero" ? 24 : 20, lineHeight: 1 }}>
          {icon}
        </span>
      )}

      {/* Label */}
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </motion.button>
  );
}
