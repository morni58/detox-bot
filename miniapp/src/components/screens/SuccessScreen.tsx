/* ============================================================
 * 🌿 SuccessScreen — Экран после успешной оплаты
 * ============================================================
 *
 * Дизайн:
 *   • Тёмный фон с зелёным glow
 *   • Конфетти-emoji разлетаются
 *   • Большой ✅ с spring bounce
 *   • «Поздравляем! Оплата прошла успешно»
 *   • Кнопка → закрытый чат (Telegram deeplink)
 *   • Кнопка → закрыть Mini App
 *
 * ============================================================ */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Button from "../ui/Button";
import { useTelegram } from "../../hooks/useTelegram";
import { scaleIn, fadeInUp } from "../../utils/animations";

/* ── Props ────────────────────────────────────────────── */

interface SuccessScreenProps {
  chatLink?: string | null;
  onClose?: () => void;
}

/* ── Confetti particles ──────────────────────────────── */

const CONFETTI = ["🎉", "✨", "🌿", "💚", "🎊", "⭐", "🥳", "🍀"];

function useConfetti(count = 12) {
  const [particles] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: CONFETTI[i % CONFETTI.length],
      x: Math.random() * 100,       // vw %
      delay: Math.random() * 0.6,
      duration: 2 + Math.random() * 1.5,
      size: 16 + Math.random() * 14,
    })),
  );
  return particles;
}

/* ── Component ────────────────────────────────────────── */

export default function SuccessScreen({
  chatLink,
  onClose,
}: SuccessScreenProps) {
  const { haptic, openTelegramLink, close } = useTelegram();
  const confetti = useConfetti(14);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    haptic.success();
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, [haptic]);

  const handleOpenChat = () => {
    if (chatLink) {
      haptic.medium();
      openTelegramLink(chatLink);
    }
  };

  const handleClose = () => {
    haptic.light();
    onClose?.();
    close();
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Background glow ──────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Confetti ─────────────────────────────────── */}
      <AnimatePresence>
        {showConfetti &&
          confetti.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: -40, x: `${p.x}vw`, opacity: 1, scale: 0 }}
              animate={{
                y: "110vh",
                opacity: [1, 1, 0],
                scale: 1,
                rotate: Math.random() > 0.5 ? 360 : -360,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: "easeIn",
              }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                fontSize: p.size,
                lineHeight: 1,
                pointerEvents: "none",
                zIndex: 10,
              }}
            >
              {p.emoji}
            </motion.div>
          ))}
      </AnimatePresence>

      {/* ── Content ──────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: 380,
          width: "100%",
        }}
      >
        {/* Big checkmark */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 250, damping: 18, delay: 0.2 }}
          style={{
            width: 96,
            height: 96,
            borderRadius: 28,
            background: "linear-gradient(135deg, #10b981, #22c55e)",
            boxShadow: "0 8px 40px rgba(16,185,129,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 32px",
          }}
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <motion.path
              d="M12 24L20 32L36 16"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            />
          </svg>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#ffffff",
            margin: "0 0 12px",
            fontFamily: "'Telegram Sans', -apple-system, sans-serif",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          Поздравляем! 🎉
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          style={{
            fontSize: 16,
            fontWeight: 400,
            color: "rgba(255,255,255,0.6)",
            margin: "0 0 36px",
            lineHeight: 1.55,
          }}
        >
          Оплата прошла успешно! Добро пожаловать в 21-дневный детокс-курс.
        </motion.p>

        {/* ── Next steps ─────────────────────────────── */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: 24,
            marginBottom: 32,
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#6ee7b7",
              marginBottom: 14,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Следующие шаги
          </div>
          {[
            { num: "1", text: "Вступи в закрытый чат участниц" },
            { num: "2", text: "Получи приветственное сообщение" },
            { num: "3", text: "Начни День 1 завтра утром" },
          ].map((step) => (
            <div
              key={step.num}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9,
                  backgroundColor: "rgba(16,185,129,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#10b981",
                  }}
                >
                  {step.num}
                </span>
              </div>
              <span
                style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,0.75)",
                  lineHeight: 1.4,
                }}
              >
                {step.text}
              </span>
            </div>
          ))}
        </motion.div>

        {/* ── Buttons ────────────────────────────────── */}
        {chatLink && (
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            style={{ marginBottom: 12 }}
          >
            <Button
              variant="success"
              size="xl"
              icon="💬"
              fullWidth
              haptic={haptic.medium}
              onClick={handleOpenChat}
            >
              Вступить в закрытый чат
            </Button>
          </motion.div>
        )}

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            haptic={haptic.light}
            onClick={handleClose}
          >
            Закрыть
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
