/* ============================================================
 * 🌿 Detox Course — Framer Motion Animation Presets
 * ============================================================
 * Все анимации проекта собраны здесь для консистентности.
 * Использование: import { fadeInUp, stagger } from '@/utils/animations'
 * ============================================================ */

import type { Variants, Transition } from "framer-motion";

/* ── Transition Curves ────────────────────────────────── */

export const springSmooth: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const easeOutExpo: Transition = {
  duration: 0.6,
  ease: [0.16, 1, 0.3, 1],
};

export const easeOutQuart: Transition = {
  duration: 0.4,
  ease: [0.25, 1, 0.5, 1],
};

/* ── fadeInUp — основная анимация появления блоков ─────── */

export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

/* ── fadeInDown — для элементов сверху ────────────────── */

export const fadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

/* ── fadeIn — простое появление ────────────────────────── */

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

/* ── scaleIn — появление с масштабированием 0.95→1 ────── */

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

/* ── slideLeft — слайд слева (для горизонтальных списков) */

export const slideLeft: Variants = {
  hidden: {
    opacity: 0,
    x: 60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

/* ── slideRight — слайд справа ─────────────────────────── */

export const slideRight: Variants = {
  hidden: {
    opacity: 0,
    x: -60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

/* ── heroTitle — крупный заголовок Hero секции ─────────── */

export const heroTitle: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/* ── heroSubtitle — подзаголовок Hero ──────────────────── */

export const heroSubtitle: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: 0.2,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

/* ── heroButton — кнопки Hero (каскадное появление) ────── */

export const heroButton = (index: number): Variants => ({
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      delay: 0.35 + index * 0.12,
      ease: [0.25, 1, 0.5, 1],
    },
  },
});

/* ── buttonTap — анимация нажатия кнопки ──────────────── */

export const buttonTap = {
  scale: 0.96,
  transition: { duration: 0.1 },
};

export const buttonHover = {
  scale: 1.02,
  transition: { duration: 0.2 },
};

/* ── staggerContainer — контейнер для каскадных анимаций  */

export const staggerContainer = (
  staggerDelay: number = 0.08,
  delayChildren: number = 0.1,
): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
});

/* ── Overlay fade — для затемнений ────────────────────── */

export const overlayFade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

/* ── Floating particles — декоративные частицы ─────────── */

export const floatingParticle = (
  delay: number,
  duration: number = 6,
) => ({
  y: [0, -15, 0],
  opacity: [0.3, 0.7, 0.3],
  transition: {
    duration,
    delay,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
});

/* ── Pulse — пульсация (для привлечения внимания) ─────── */

export const pulse: Variants = {
  hidden: { scale: 1 },
  visible: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/* ── Shimmer — блик по кнопке ─────────────────────────── */

export const shimmer = {
  x: ["-100%", "200%"],
  transition: {
    duration: 1.8,
    repeat: Infinity,
    repeatDelay: 3,
    ease: "easeInOut" as const,
  },
};
