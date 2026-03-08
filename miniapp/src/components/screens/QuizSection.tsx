/* ============================================================
 * 🌿 QuizSection — Мини-квиз «Нужен ли тебе детокс?»
 * ============================================================
 *
 * Дизайн (по спецификации):
 *   • Фон: тёмный (#0f172a) + зелёные accent-гlow
 *   • ProgressBar сверху (emerald, 6px)
 *   • 1 вопрос на экране, переключение с анимацией
 *   • 4 варианта ответа — карточки-кнопки
 *   • Выбранный ответ: emerald border + glow
 *   • Авто-переход через 0.6 сек после выбора
 *   • Результат: шкала (0-15), текст, большая CTA кнопка
 *
 * Анимации (framer-motion):
 *   • Вопрос: slideLeft вход / slideRight выход
 *   • Варианты: stagger fadeInUp 0.06s
 *   • Выбор: scale pulse + border glow
 *   • ProgressBar: spring fill
 *   • Результат: scaleIn + confetti emoji
 *
 * ============================================================ */

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

import Button from "../ui/Button";
import ProgressBar from "../ui/ProgressBar";
import { useTelegram } from "../../hooks/useTelegram";
import { fadeInUp, scaleIn, staggerContainer } from "../../utils/animations";
import type { QuizQuestion, QuizOption } from "../../types";

/* ── Props ────────────────────────────────────────────── */

interface QuizSectionProps {
  sectionTitle?: string;
  questions?: QuizQuestion[];
  /** Тексты результатов */
  resultHigh?: string;
  resultMedium?: string;
  resultLow?: string;
  /** Текст CTA кнопки после результата */
  resultButtonText?: string;
  /** Callback: квиз завершён */
  onComplete?: (totalScore: number, answers: Record<number, number>) => void;
  /** Callback: клик по CTA после результата */
  onCtaClick?: () => void;
}

/* ── Default questions (из seeds) ─────────────────────── */

const DEFAULT_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    questionText: "Как часто вы чувствуете усталость без видимой причины?",
    options: [
      { text: "Почти каждый день", score: 3 },
      { text: "Несколько раз в неделю", score: 2 },
      { text: "Иногда", score: 1 },
      { text: "Редко", score: 0 },
    ],
    sortOrder: 1,
  },
  {
    id: 2,
    questionText: "Замечали ли вы ухудшение состояния кожи за последний год?",
    options: [
      { text: "Да, значительное", score: 3 },
      { text: "Да, небольшое", score: 2 },
      { text: "Не уверена", score: 1 },
      { text: "Нет, кожа в порядке", score: 0 },
    ],
    sortOrder: 2,
  },
  {
    id: 3,
    questionText: "Набирали ли вы вес, несмотря на попытки контролировать питание?",
    options: [
      { text: "Да, постоянно", score: 3 },
      { text: "Да, время от времени", score: 2 },
      { text: "Немного", score: 1 },
      { text: "Нет", score: 0 },
    ],
    sortOrder: 3,
  },
  {
    id: 4,
    questionText: "Как вы оцениваете уровень стресса в вашей жизни?",
    options: [
      { text: "Очень высокий", score: 3 },
      { text: "Выше среднего", score: 2 },
      { text: "Умеренный", score: 1 },
      { text: "Низкий", score: 0 },
    ],
    sortOrder: 4,
  },
  {
    id: 5,
    questionText: "Бывают ли у вас отёки по утрам (лицо, ноги)?",
    options: [
      { text: "Да, почти каждый день", score: 3 },
      { text: "Часто", score: 2 },
      { text: "Иногда", score: 1 },
      { text: "Нет", score: 0 },
    ],
    sortOrder: 5,
  },
];

/* ── Step animation variants ──────────────────────────── */

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -80 : 80,
    opacity: 0,
    transition: { duration: 0.25, ease: [0.25, 1, 0.5, 1] },
  }),
};

/* ── Component ────────────────────────────────────────── */

export default function QuizSection({
  sectionTitle = "Узнай, нужен ли тебе детокс",
  questions = DEFAULT_QUESTIONS,
  resultHigh = "Тебе точно нужен детокс! Твой организм просит помощи.",
  resultMedium = "Есть признаки того, что детокс будет полезен.",
  resultLow = "У тебя всё неплохо, но детокс поможет чувствовать себя ещё лучше!",
  resultButtonText = "Начать детокс прямо сейчас",
  onComplete,
  onCtaClick,
}: QuizSectionProps) {
  const { haptic } = useTelegram();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const sorted = [...questions].sort((a, b) => a.sortOrder - b.sortOrder);
  const total = sorted.length;

  const [step, setStep] = useState(0); // 0..total-1 = questions, total = result
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState(0);

  const isComplete = step >= total;
  const currentQuestion = !isComplete ? sorted[step] : null;
  const maxScore = total * 3;

  /* ── Select option → auto-advance ──────────────────── */
  const handleSelect = useCallback(
    (optionIndex: number, score: number) => {
      if (selectedOption !== null) return; // prevent double-tap

      haptic.medium();
      setSelectedOption(optionIndex);

      // Save answer
      const qId = currentQuestion!.id;
      setAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
      const newTotal = totalScore + score;
      setTotalScore(newTotal);

      // Auto-advance after brief delay
      setTimeout(() => {
        setSelectedOption(null);
        setDirection(1);

        if (step + 1 >= total) {
          // Quiz finished
          onComplete?.(newTotal, { ...answers, [qId]: optionIndex });
          haptic.success();
        }

        setStep((prev) => prev + 1);
      }, 600);
    },
    [selectedOption, currentQuestion, totalScore, step, total, answers, haptic, onComplete],
  );

  /* ── Result tier ───────────────────────────────────── */
  const getResult = () => {
    const pct = totalScore / maxScore;
    if (pct >= 0.6) return { emoji: "🚨", text: resultHigh, color: "#ef4444", tier: "high" };
    if (pct >= 0.3) return { emoji: "⚠️", text: resultMedium, color: "#f59e0b", tier: "medium" };
    return { emoji: "💚", text: resultLow, color: "#22c55e", tier: "low" };
  };

  return (
    <section
      ref={sectionRef}
      id="quiz"
      style={{
        position: "relative",
        width: "100%",
        padding: "64px 0 72px",
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        overflow: "hidden",
      }}
    >
      {/* ── Background accents ───────────────────────── */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            top: "-20%",
            right: "-20%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "-15%",
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 480,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* ═══════════════════════════════════════════════
         *  Header
         * ═══════════════════════════════════════════════ */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{ textAlign: "center", marginBottom: 32 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 100,
              backgroundColor: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.2)",
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 13 }}>🧩</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#6ee7b7",
                letterSpacing: "0.02em",
              }}
            >
              Мини-тест
            </span>
          </div>

          <h2
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#ffffff",
              margin: "0 0 16px",
              fontFamily: "'Telegram Sans', -apple-system, sans-serif",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            {sectionTitle}
          </h2>
        </motion.div>

        {/* ═══════════════════════════════════════════════
         *  Progress Bar
         * ═══════════════════════════════════════════════ */}
        <div style={{ marginBottom: 32 }}>
          <ProgressBar
            current={isComplete ? total : step + 1}
            total={total}
            dark
          />
        </div>

        {/* ═══════════════════════════════════════════════
         *  Question / Result (AnimatePresence)
         * ═══════════════════════════════════════════════ */}
        <div style={{ minHeight: 360, position: "relative" }}>
          <AnimatePresence mode="wait" custom={direction}>
            {!isComplete && currentQuestion ? (
              /* ── Question Step ─────────────────────── */
              <motion.div
                key={`q-${step}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {/* Question text */}
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#ffffff",
                    margin: "0 0 24px",
                    lineHeight: 1.4,
                    fontFamily: "'Telegram Sans', -apple-system, sans-serif",
                  }}
                >
                  {currentQuestion.questionText}
                </h3>

                {/* Options */}
                <motion.div
                  variants={staggerContainer(0.06, 0)}
                  initial="hidden"
                  animate="visible"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {currentQuestion.options.map((opt, idx) => (
                    <OptionButton
                      key={idx}
                      option={opt}
                      index={idx}
                      isSelected={selectedOption === idx}
                      isDisabled={selectedOption !== null}
                      onSelect={() => handleSelect(idx, opt.score)}
                    />
                  ))}
                </motion.div>
              </motion.div>
            ) : (
              /* ── Result Screen ─────────────────────── */
              <motion.div
                key="result"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <QuizResult
                  result={getResult()}
                  totalScore={totalScore}
                  maxScore={maxScore}
                  buttonText={resultButtonText}
                  onCtaClick={onCtaClick}
                  haptic={haptic}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
 * Option Button
 * ═══════════════════════════════════════════════════════════ */

interface OptionButtonProps {
  option: QuizOption;
  index: number;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
}

function OptionButton({
  option,
  index,
  isSelected,
  isDisabled,
  onSelect,
}: OptionButtonProps) {
  const labels = ["A", "B", "C", "D"];

  return (
    <motion.button
      variants={fadeInUp}
      whileTap={!isDisabled ? { scale: 0.97 } : undefined}
      onClick={!isDisabled ? onSelect : undefined}
      animate={
        isSelected
          ? {
              borderColor: "#10b981",
              boxShadow: "0 0 20px rgba(16,185,129,0.25), 0 4px 16px rgba(0,0,0,0.15)",
            }
          : {}
      }
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 18px",
        borderRadius: 14,
        backgroundColor: isSelected
          ? "rgba(16,185,129,0.1)"
          : "rgba(255,255,255,0.05)",
        border: isSelected
          ? "1.5px solid #10b981"
          : "1.5px solid rgba(255,255,255,0.08)",
        cursor: isDisabled ? "default" : "pointer",
        outline: "none",
        textAlign: "left",
        WebkitTapHighlightColor: "transparent",
        transition: "background-color 0.2s ease",
        opacity: isDisabled && !isSelected ? 0.5 : 1,
      }}
    >
      {/* Letter badge */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: isSelected ? "#10b981" : "rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.2s ease",
        }}
      >
        {isSelected ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3.5 8L6.5 11L12.5 5"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              fontFamily: "'Telegram Sans', -apple-system, sans-serif",
            }}
          >
            {labels[index] || String(index + 1)}
          </span>
        )}
      </div>

      {/* Text */}
      <span
        style={{
          fontSize: 16,
          fontWeight: isSelected ? 600 : 400,
          color: isSelected ? "#6ee7b7" : "rgba(255,255,255,0.8)",
          lineHeight: 1.4,
          fontFamily: "'Telegram Sans', -apple-system, sans-serif",
          transition: "color 0.2s ease",
        }}
      >
        {option.text}
      </span>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════
 * Quiz Result Screen
 * ═══════════════════════════════════════════════════════════ */

interface QuizResultProps {
  result: { emoji: string; text: string; color: string; tier: string };
  totalScore: number;
  maxScore: number;
  buttonText: string;
  onCtaClick?: () => void;
  haptic: { medium: () => void };
}

function QuizResult({
  result,
  totalScore,
  maxScore,
  buttonText,
  onCtaClick,
  haptic,
}: QuizResultProps) {
  const pct = Math.round((totalScore / maxScore) * 100);

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      style={{ textAlign: "center" }}
    >
      {/* Big emoji */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        style={{
          fontSize: 56,
          lineHeight: 1,
          marginBottom: 20,
        }}
      >
        {result.emoji}
      </motion.div>

      {/* Score */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "6px 16px",
          borderRadius: 100,
          backgroundColor: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          marginBottom: 20,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          Твой результат:
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: result.color,
          }}
        >
          {totalScore}/{maxScore} ({pct}%)
        </span>
      </div>

      {/* Score bar */}
      <div
        style={{
          width: "100%",
          maxWidth: 280,
          margin: "0 auto 24px",
          height: 10,
          borderRadius: 5,
          backgroundColor: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
          style={{
            height: "100%",
            borderRadius: 5,
            backgroundColor: result.color,
            boxShadow: `0 0 12px ${result.color}66`,
          }}
        />
      </div>

      {/* Result text */}
      <p
        style={{
          fontSize: 18,
          fontWeight: 500,
          color: "#ffffff",
          lineHeight: 1.5,
          margin: "0 0 32px",
          maxWidth: 340,
          marginLeft: "auto",
          marginRight: "auto",
          fontFamily: "'Telegram Sans', -apple-system, sans-serif",
        }}
      >
        {result.text}
      </p>

      {/* CTA Button */}
      <Button
        variant="success"
        size="xl"
        icon="✨"
        fullWidth
        haptic={haptic.medium}
        onClick={onCtaClick}
      >
        {buttonText}
      </Button>

      {/* Disclaimer */}
      <p
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.3)",
          marginTop: 16,
          lineHeight: 1.4,
        }}
      >
        Тест носит информационный характер и не является диагнозом
      </p>
    </motion.div>
  );
}
