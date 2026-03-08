/* ============================================================
 * 🌿 HeroSection — Полноэкранная шапка Mini App
 * ============================================================
 *
 * Дизайн (по спецификации):
 *   • Фон: полноэкранное фото автора, object-cover
 *   • Overlay: rgba(0, 0, 0, 0.55) + нижний градиент
 *   • Заголовок: 48px, white, bold
 *   • Подзаголовок: 20px, white/80%
 *   • Кнопка 1: success, 60px height, emoji ✨
 *   • Кнопка 2: secondary
 *   • Декор: плавающие частицы + градиентное свечение
 *
 * Анимации (framer-motion):
 *   • Overlay — fadeIn 0.8s
 *   • Заголовок — heroTitle (y:40→0, scale:0.96→1, 0.7s)
 *   • Подзаголовок — heroSubtitle (y:20→0, delay 0.2s)
 *   • Кнопки — heroButton (каскад delay 0.35 + i*0.12)
 *   • Частицы — float loop (y bounce, opacity pulse)
 *   • Shimmer на success-кнопке — бесконечный блик
 *
 * ============================================================ */

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";

import Button from "../ui/Button";
import { useTelegram } from "../../hooks/useTelegram";
import {
  heroTitle,
  heroSubtitle,
  heroButton,
  overlayFade,
  floatingParticle,
  staggerContainer,
} from "../../utils/animations";

/* ── Props ────────────────────────────────────────────── */

interface HeroSectionProps {
  /** Заголовок: "Детокс-курс от [Имя]" */
  title?: string;
  /** Подзаголовок */
  subtitle?: string;
  /** Текст главной кнопки (success) */
  buttonPrimary?: string;
  /** Текст вторичной кнопки */
  buttonSecondary?: string;
  /** URL фото автора (object-cover) */
  backgroundImage?: string;
  /** Callback: клик по "Начать детокс" */
  onCtaClick?: () => void;
  /** Callback: клик по "Узнать подробнее" */
  onLearnMoreClick?: () => void;
}

/* ── Floating Particles (декоративные) ────────────────── */

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

/* ── Component ────────────────────────────────────────── */

export default function HeroSection({
  title = "Детокс-курс от Анны",
  subtitle = "Верни чистую кожу, энергию и тело за 21 день",
  buttonPrimary = "Начать детокс прямо сейчас",
  buttonSecondary = "Узнать подробнее",
  backgroundImage,
  onCtaClick,
  onLearnMoreClick,
}: HeroSectionProps) {
  const { haptic, viewportHeight } = useTelegram();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  /* ── Parallax: фон двигается медленнее при скролле ──── */
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 500], [0, 120]);
  const overlayOpacity = useTransform(scrollY, [0, 300], [0.55, 0.75]);

  /* ── Placeholder фон если нет фото ──────────────────── */
  const hasBg = backgroundImage && !backgroundImage.includes("placeholder");

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        width: "100%",
        minHeight: viewportHeight || "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        overflow: "hidden",
        /* Fallback gradient if no photo */
        background: hasBg
          ? undefined
          : "linear-gradient(145deg, #064e3b 0%, #0f172a 40%, #1e1b4b 100%)",
      }}
    >
      {/* ═════════════════════════════════════════════════
       *  LAYER 1: Background Image (parallax)
       * ═════════════════════════════════════════════════ */}
      {hasBg && (
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            y: bgY,
            willChange: "transform",
          }}
        >
          <img
            src={backgroundImage}
            alt="Автор детокс-курса"
            style={{
              width: "100%",
              height: "120%",
              objectFit: "cover",
              objectPosition: "center 20%",
            }}
          />
        </motion.div>
      )}

      {/* ═════════════════════════════════════════════════
       *  LAYER 2: Gradient Overlay
       *  Верх: rgba(0,0,0,0.55)
       *  Низ: плавный переход в тёмный
       * ═════════════════════════════════════════════════ */}
      <motion.div
        variants={overlayFade}
        initial="hidden"
        animate="visible"
        style={{
          position: "absolute",
          inset: 0,
          background: hasBg
            ? undefined
            : "transparent",
          zIndex: 1,
        }}
      >
        {/* Основной overlay */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            opacity: hasBg ? overlayOpacity : 0,
          }}
        />

        {/* Нижний градиент — плавный переход к контенту ниже */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "55%",
            background:
              "linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.6) 40%, transparent 100%)",
          }}
        />

        {/* Зелёное свечение снизу (accent glow) */}
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "120%",
            height: "40%",
            background:
              "radial-gradient(ellipse at center, rgba(16, 185, 129, 0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      </motion.div>

      {/* ═════════════════════════════════════════════════
       *  LAYER 3: Floating Particles
       * ═════════════════════════════════════════════════ */}
      <div
        style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}
        aria-hidden
      >
        {PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            animate={floatingParticle(p.delay, p.duration)}
            style={{
              position: "absolute",
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: `rgba(16, 185, 129, ${p.opacity})`,
              boxShadow: `0 0 ${p.size * 3}px rgba(16, 185, 129, ${p.opacity * 0.8})`,
            }}
          />
        ))}
      </div>

      {/* ═════════════════════════════════════════════════
       *  LAYER 4: Content
       * ═════════════════════════════════════════════════ */}
      <motion.div
        variants={staggerContainer(0.1, 0)}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        style={{
          position: "relative",
          zIndex: 3,
          width: "100%",
          maxWidth: 480,
          padding: "0 24px 48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 0,
        }}
      >
        {/* ── Badge ──────────────────────────────────── */}
        <motion.div
          variants={heroSubtitle}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 100,
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 13 }}>🌿</span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#6ee7b7",
              letterSpacing: "0.02em",
            }}
          >
            21-дневный курс
          </span>
        </motion.div>

        {/* ── Title (48px, white, bold) ──────────────── */}
        <motion.h1
          variants={heroTitle}
          style={{
            fontSize: 48,
            fontWeight: 700,
            lineHeight: 1.08,
            color: "#ffffff",
            margin: "0 0 16px",
            fontFamily: "'Telegram Sans', -apple-system, sans-serif",
            letterSpacing: "-0.03em",
            textShadow: "0 2px 20px rgba(0, 0, 0, 0.3)",
            /* Gradient text accent on last word */
          }}
        >
          {title}
        </motion.h1>

        {/* ── Subtitle (20px) ───────────────────────── */}
        <motion.p
          variants={heroSubtitle}
          style={{
            fontSize: 20,
            fontWeight: 400,
            lineHeight: 1.45,
            color: "rgba(255, 255, 255, 0.8)",
            margin: "0 0 36px",
            fontFamily: "'Telegram Sans', -apple-system, sans-serif",
            maxWidth: 380,
            textShadow: "0 1px 10px rgba(0, 0, 0, 0.2)",
          }}
        >
          {subtitle}
        </motion.p>

        {/* ── Button 1: Success CTA (60px, ✨) ──────── */}
        <motion.div
          variants={heroButton(0)}
          style={{ width: "100%", marginBottom: 12 }}
        >
          <Button
            variant="success"
            size="xl"
            icon="✨"
            fullWidth
            haptic={haptic.medium}
            onClick={onCtaClick}
          >
            {buttonPrimary}
          </Button>
        </motion.div>

        {/* ── Button 2: Secondary ────────────────────── */}
        <motion.div
          variants={heroButton(1)}
          style={{ width: "100%" }}
        >
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            haptic={haptic.light}
            onClick={onLearnMoreClick}
          >
            {buttonSecondary}
          </Button>
        </motion.div>

        {/* ── Scroll Indicator ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          style={{
            marginTop: 32,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "rgba(255, 255, 255, 0.4)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            листай вниз
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{ opacity: 0.4 }}
            >
              <path
                d="M10 4v12m0 0l-4-4m4 4l4-4"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
