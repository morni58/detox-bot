/* ============================================================
 * 🌿 LoadingScreen — Полноэкранная загрузка контента
 * ============================================================ */

import { motion } from "framer-motion";
import Loader from "../ui/Loader";

export default function LoadingScreen() {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Logo emoji with pulse */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{ fontSize: 48, lineHeight: 1, position: "relative", zIndex: 1 }}
      >
        🌿
      </motion.div>

      {/* Spinner */}
      <Loader size={32} text="Загружаю курс…" dark />

      {/* Animated dots */}
      <div style={{ display: "flex", gap: 6, position: "relative", zIndex: 1 }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: "#10b981",
            }}
          />
        ))}
      </div>
    </div>
  );
}
