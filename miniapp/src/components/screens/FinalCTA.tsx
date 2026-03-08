/* ============================================================
 * 🌿 FinalCTA — Финальный блок с призывом к действию
 * ============================================================
 *
 * Дизайн:
 *   • Тёмный фон (#0f172a) + зелёные accent-glow
 *   • Большой emoji 🚀 с bounce
 *   • Заголовок «Готова начать?» (28px)
 *   • Social proof: «200+ клиенток уже прошли курс»
 *   • Цена: зачёркнутая старая + новая (Stars)
 *   • CTA кнопка: success, hero (70px), shimmer
 *   • Micro-гарантия + безопасная оплата
 *
 * ============================================================ */

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

import Button from "../ui/Button";
import { useTelegram } from "../../hooks/useTelegram";
import { fadeInUp, scaleIn } from "../../utils/animations";
import { formatNumber } from "../../utils/format";

/* ── Props ────────────────────────────────────────────── */

interface FinalCTAProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  priceStars?: number;
  oldPriceStars?: number;
  guaranteeDays?: number;
  clientsCount?: number;
  onBuyClick?: () => void;
}

/* ── Component ────────────────────────────────────────── */

export default function FinalCTA({
  title = "Готова начать свой путь?",
  subtitle = "Присоединяйся к программе сегодня",
  buttonText = "Начать детокс ✨",
  priceStars = 1500,
  oldPriceStars = 2500,
  guaranteeDays = 14,
  clientsCount = 200,
  onBuyClick,
}: FinalCTAProps) {
  const { haptic } = useTelegram();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      id="final-cta"
      style={{
        position: "relative",
        width: "100%",
        padding: "72px 0 80px",
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        overflow: "hidden",
      }}
    >
      {/* ── Background accents ───────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "140%",
          height: "60%",
          background:
            "radial-gradient(ellipse, rgba(16,185,129,0.1) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-20%",
          width: 250,
          height: 250,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 480,
          margin: "0 auto",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        {/* ── Big emoji ──────────────────────────────── */}
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={inView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -15 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{ fontSize: 56, lineHeight: 1, marginBottom: 24 }}
        >
          🚀
        </motion.div>

        {/* ── Title ──────────────────────────────────── */}
        <motion.h2
          variants={fadeInUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
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
          {title}
        </motion.h2>

        {/* ── Subtitle ──────────────────────────────── */}
        <motion.p
          variants={fadeInUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          style={{
            fontSize: 16,
            fontWeight: 400,
            color: "rgba(255,255,255,0.6)",
            margin: "0 0 28px",
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </motion.p>

        {/* ── Social proof ──────────────────────────── */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 18px",
            borderRadius: 100,
            backgroundColor: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.2)",
            marginBottom: 32,
          }}
        >
          {/* Stacked avatars (placeholders) */}
          <div style={{ display: "flex" }}>
            {["😊", "🥰", "💪"].map((e, i) => (
              <div
                key={i}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: "rgba(16,185,129,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  marginLeft: i === 0 ? 0 : -8,
                  border: "2px solid #0f172a",
                  position: "relative",
                  zIndex: 3 - i,
                }}
              >
                {e}
              </div>
            ))}
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#6ee7b7",
            }}
          >
            {formatNumber(clientsCount)}+ уже прошли
          </span>
        </motion.div>

        {/* ── Price ──────────────────────────────────── */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          style={{ marginBottom: 24 }}
        >
          {oldPriceStars > priceStars && (
            <span
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.35)",
                textDecoration: "line-through",
                marginRight: 12,
              }}
            >
              {formatNumber(oldPriceStars)} Stars
            </span>
          )}
          <span style={{ fontSize: 14 }}>⭐</span>
          <span
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#ffffff",
              fontFamily: "'Telegram Sans', -apple-system, sans-serif",
              letterSpacing: "-0.03em",
              marginLeft: 6,
            }}
          >
            {formatNumber(priceStars)}
          </span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 400,
              color: "rgba(255,255,255,0.5)",
              marginLeft: 6,
            }}
          >
            Stars
          </span>
        </motion.div>

        {/* ── CTA Button ─────────────────────────────── */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <Button
            variant="success"
            size="hero"
            icon="✨"
            fullWidth
            haptic={haptic.heavy}
            onClick={onBuyClick}
          >
            {buttonText}
          </Button>
        </motion.div>

        {/* ── Micro-guarantees ───────────────────────── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {[
            { icon: "🛡", text: `Гарантия ${guaranteeDays} дней` },
            { icon: "⚡", text: "Мгновенный доступ" },
            { icon: "🔒", text: "Безопасная оплата" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ fontSize: 12 }}>{item.icon}</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {item.text}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
