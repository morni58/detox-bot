import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";

/* ═══════════════════════════════════════════════════════════
 * 🌿 ANIMATION PRESETS
 * ═══════════════════════════════════════════════════════════ */

const heroTitle = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const heroSubtitle = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: 0.2, ease: [0.25, 1, 0.5, 1] },
  },
};

const heroButton = (index) => ({
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, delay: 0.35 + index * 0.12, ease: [0.25, 1, 0.5, 1] },
  },
});

const staggerContainer = (staggerDelay = 0.1, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: staggerDelay, delayChildren },
  },
});

const overlayFade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

const floatingParticle = (delay, duration = 6) => ({
  y: [0, -15, 0],
  opacity: [0.3, 0.7, 0.3],
  transition: { duration, delay, repeat: Infinity, ease: "easeInOut" },
});

const buttonTap = { scale: 0.96, transition: { duration: 0.1 } };
const buttonHover = { scale: 1.02, transition: { duration: 0.2 } };

/* ═══════════════════════════════════════════════════════════
 * BUTTON COMPONENT
 * ═══════════════════════════════════════════════════════════ */

const VARIANT_STYLES = {
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
};

const SIZE_STYLES = {
  lg: { height: 56, fontSize: 17, padding: "0 28px", borderRadius: 16 },
  xl: { height: 60, fontSize: 18, padding: "0 32px", borderRadius: 16 },
};

function Button({ children, variant = "success", size = "xl", icon, fullWidth, onClick }) {
  return (
    <motion.button
      whileTap={buttonTap}
      whileHover={buttonHover}
      onClick={onClick}
      style={{
        ...VARIANT_STYLES[variant],
        ...SIZE_STYLES[size],
        width: fullWidth ? "100%" : "auto",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        fontFamily: "'Helvetica Neue', -apple-system, sans-serif",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        WebkitTapHighlightColor: "transparent",
        outline: "none",
      }}
    >
      {variant === "success" && (
        <motion.span
          aria-hidden
          animate={{ x: ["-100%", "300%"] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
          style={{
            position: "absolute", top: 0, left: 0,
            width: "30%", height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
            pointerEvents: "none",
          }}
        />
      )}
      {icon && <span style={{ fontSize: size === "xl" ? 22 : 20, lineHeight: 1 }}>{icon}</span>}
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════
 * FLOATING PARTICLES
 * ═══════════════════════════════════════════════════════════ */

const PARTICLES = [
  { size: 4, top: "12%", left: "8%",  delay: 0,   duration: 7, opacity: 0.4 },
  { size: 6, top: "22%", left: "85%", delay: 1.2, duration: 5, opacity: 0.3 },
  { size: 3, top: "45%", left: "15%", delay: 2.5, duration: 8, opacity: 0.25 },
  { size: 5, top: "60%", left: "78%", delay: 0.8, duration: 6, opacity: 0.35 },
  { size: 4, top: "75%", left: "45%", delay: 3.0, duration: 7, opacity: 0.2 },
  { size: 7, top: "18%", left: "55%", delay: 1.8, duration: 9, opacity: 0.15 },
  { size: 3, top: "85%", left: "25%", delay: 0.5, duration: 6, opacity: 0.3 },
  { size: 5, top: "35%", left: "92%", delay: 2.0, duration: 5, opacity: 0.25 },
];

/* ═══════════════════════════════════════════════════════════
 * HERO SECTION
 * ═══════════════════════════════════════════════════════════ */

export default function HeroSectionPreview() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [clicked, setClicked] = useState(null);

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      fontFamily: "'Helvetica Neue', -apple-system, BlinkMacSystemFont, sans-serif",
      WebkitFontSmoothing: "antialiased",
      margin: 0, padding: 0, overflow: "hidden",
    }}>
      <section
        ref={sectionRef}
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "center",
          overflow: "hidden",
          background: "linear-gradient(145deg, #064e3b 0%, #0f172a 40%, #1e1b4b 100%)",
        }}
      >
        {/* ── Overlay + Bottom Gradient ──────────────── */}
        <motion.div
          variants={overlayFade}
          initial="hidden"
          animate="visible"
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
        >
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "55%",
            background: "linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.6) 40%, transparent 100%)",
          }} />

          {/* Green accent glow */}
          <div style={{
            position: "absolute", bottom: "-10%", left: "50%",
            transform: "translateX(-50%)",
            width: "120%", height: "40%",
            background: "radial-gradient(ellipse at center, rgba(16,185,129,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
        </motion.div>

        {/* ── Floating Particles ─────────────────────── */}
        <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>
          {PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              animate={floatingParticle(p.delay, p.duration)}
              style={{
                position: "absolute", top: p.top, left: p.left,
                width: p.size, height: p.size,
                borderRadius: "50%",
                backgroundColor: `rgba(16,185,129,${p.opacity})`,
                boxShadow: `0 0 ${p.size * 3}px rgba(16,185,129,${p.opacity * 0.8})`,
              }}
            />
          ))}
        </div>

        {/* ── Main Content ───────────────────────────── */}
        <motion.div
          variants={staggerContainer(0.1, 0)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{
            position: "relative", zIndex: 3,
            width: "100%", maxWidth: 480,
            padding: "0 24px 48px",
            display: "flex", flexDirection: "column",
            alignItems: "center", textAlign: "center",
          }}
        >
          {/* Badge */}
          <motion.div
            variants={heroSubtitle}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 100,
              backgroundColor: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.25)",
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 13 }}>🌿</span>
            <span style={{
              fontSize: 13, fontWeight: 500,
              color: "#6ee7b7", letterSpacing: "0.02em",
            }}>
              21-дневный курс
            </span>
          </motion.div>

          {/* Title — 48px, white, bold */}
          <motion.h1
            variants={heroTitle}
            style={{
              fontSize: 48, fontWeight: 700, lineHeight: 1.08,
              color: "#ffffff", margin: "0 0 16px",
              letterSpacing: "-0.03em",
              textShadow: "0 2px 20px rgba(0,0,0,0.3)",
            }}
          >
            Детокс-курс от Анны
          </motion.h1>

          {/* Subtitle — 20px */}
          <motion.p
            variants={heroSubtitle}
            style={{
              fontSize: 20, fontWeight: 400, lineHeight: 1.45,
              color: "rgba(255,255,255,0.8)",
              margin: "0 0 36px", maxWidth: 380,
              textShadow: "0 1px 10px rgba(0,0,0,0.2)",
            }}
          >
            Верни чистую кожу, энергию и тело за 21 день
          </motion.p>

          {/* CTA Button — success, 60px, ✨ */}
          <motion.div variants={heroButton(0)} style={{ width: "100%", marginBottom: 12 }}>
            <Button
              variant="success"
              size="xl"
              icon="✨"
              fullWidth
              onClick={() => setClicked("cta")}
            >
              Начать детокс прямо сейчас
            </Button>
          </motion.div>

          {/* Secondary Button */}
          <motion.div variants={heroButton(1)} style={{ width: "100%" }}>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => setClicked("learn")}
            >
              Узнать подробнее
            </Button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            style={{
              marginTop: 32,
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 8,
            }}
          >
            <span style={{
              fontSize: 12, fontWeight: 500,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}>
              листай вниз
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ opacity: 0.4 }}>
                <path
                  d="M10 4v12m0 0l-4-4m4 4l4-4"
                  stroke="white" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── Click Feedback Toast ────────────────────── */}
        {clicked && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={() => setTimeout(() => setClicked(null), 1500)}
            style={{
              position: "fixed", bottom: 32, left: "50%",
              transform: "translateX(-50%)",
              zIndex: 100,
              padding: "12px 24px",
              borderRadius: 12,
              backgroundColor: "rgba(16,185,129,0.95)",
              color: "#fff",
              fontSize: 14, fontWeight: 600,
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            {clicked === "cta" ? "✨ Переход к оплате…" : "📋 Прокрутка к деталям…"}
          </motion.div>
        )}
      </section>
    </div>
  );
}
