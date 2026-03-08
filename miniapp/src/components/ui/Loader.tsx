/* ============================================================
 * 🌿 Loader — Анимированный спиннер
 * ============================================================ */

import { motion } from "framer-motion";

interface LoaderProps {
  size?: number;
  text?: string;
  dark?: boolean;
}

export default function Loader({
  size = 40,
  text,
  dark = false,
}: LoaderProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* Spinner ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: `3px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(16,185,129,0.15)"}`,
          borderTopColor: "#10b981",
        }}
      />

      {/* Optional text */}
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: dark ? "rgba(255,255,255,0.5)" : "#64748b",
            margin: 0,
            fontFamily: "'Telegram Sans', -apple-system, sans-serif",
          }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}
