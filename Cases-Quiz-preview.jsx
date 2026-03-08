import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

/* ═══ ANIMATIONS ═══ */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25,1,0.5,1] } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.25,1,0.5,1] } },
};
const stagger = (d=0.08,dc=0.1) => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: d, delayChildren: dc } },
});
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.25,1,0.5,1] } },
  exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0, transition: { duration: 0.25 } }),
};
const tap = { scale: 0.96, transition: { duration: 0.1 } };
const hover = { scale: 1.02, transition: { duration: 0.2 } };

/* ═══ BUTTON ═══ */
function Btn({ children, variant="success", size="xl", icon, onClick, fullWidth=true }) {
  const styles = {
    success: { background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", border: "none", boxShadow: "0 4px 24px rgba(34,197,94,0.4)" },
    primary: { background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", border: "none", boxShadow: "0 4px 20px rgba(16,185,129,0.35)" },
  };
  const sizes = { xl: { height: 60, fontSize: 18, borderRadius: 16 }, hero: { height: 70, fontSize: 20, borderRadius: 20 } };
  return (
    <motion.button whileTap={tap} whileHover={hover} onClick={onClick}
      style={{ ...styles[variant], ...sizes[size], width: fullWidth?"100%":"auto",
        padding: "0 32px", display: "inline-flex", alignItems: "center", justifyContent: "center",
        gap: 10, fontWeight: 600, cursor: "pointer", outline: "none", position: "relative",
        overflow: "hidden", fontFamily: "-apple-system,sans-serif", WebkitTapHighlightColor: "transparent" }}>
      {variant==="success" && (
        <motion.span aria-hidden animate={{ x: ["-100%","300%"] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
          style={{ position: "absolute", top: 0, left: 0, width: "30%", height: "100%",
            background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)", pointerEvents: "none" }} />
      )}
      {icon && <span style={{ fontSize: size==="hero"?24:20, lineHeight: 1 }}>{icon}</span>}
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </motion.button>
  );
}

/* ═══ PROGRESS BAR ═══ */
function ProgressBar({ current, total }) {
  const pct = Math.min(current/total, 1);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>Вопрос {current} из {total}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#10b981" }}>{Math.round(pct*100)}%</span>
      </div>
      <div style={{ width: "100%", height: 6, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden", position: "relative" }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct*100}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          style={{ height: "100%", borderRadius: 6, background: "linear-gradient(90deg,#10b981,#22c55e)", position: "relative" }}>
          <div style={{ position: "absolute", right: -2, top: "50%", transform: "translateY(-50%)",
            width: 12, height: 12, borderRadius: "50%", backgroundColor: "#22c55e",
            boxShadow: "0 0 12px rgba(34,197,94,0.6)" }} />
        </motion.div>
      </div>
    </div>
  );
}

/* ═══ DATA ═══ */
const CASES = [
  { id:1, name:"Марина", age:38, result:"Минус 6 кг, чистая кожа",
    review:"За 21 день ушло 6 кг и кожа стала чистой впервые за 3 года! Я не верила, что это возможно без жёстких диет. Спасибо за этот курс — он изменил мой подход к здоровью!" },
  { id:2, name:"Елена", age:42, result:"Ушли отёки, свежий цвет лица",
    review:"Подруги спрашивают, что я сделала с лицом. Отёки ушли, цвет лица стал свежим. И это всего за 3 недели! Буду рекомендовать всем знакомым." },
  { id:3, name:"Анна", age:36, result:"Энергия и лёгкость",
    review:"Энергии столько, что я снова начала бегать по утрам. Минус 4 кг — приятный бонус. Главное — я чувствую себя совершенно другим человеком." },
  { id:4, name:"Ольга", age:45, result:"Метод, который работает",
    review:"Наконец-то нашла метод без голодания. Минус 5 кг, кожа сияет, и я научилась справляться со стрессом. Лучшая инвестиция в себя!" },
];

const QUESTIONS = [
  { id:1, text:"Как часто вы чувствуете усталость без видимой причины?",
    opts:[{t:"Почти каждый день",s:3},{t:"Несколько раз в неделю",s:2},{t:"Иногда",s:1},{t:"Редко",s:0}] },
  { id:2, text:"Замечали ли вы ухудшение состояния кожи за последний год?",
    opts:[{t:"Да, значительное",s:3},{t:"Да, небольшое",s:2},{t:"Не уверена",s:1},{t:"Нет, кожа в порядке",s:0}] },
  { id:3, text:"Набирали ли вы вес, несмотря на попытки контролировать питание?",
    opts:[{t:"Да, постоянно",s:3},{t:"Да, время от времени",s:2},{t:"Немного",s:1},{t:"Нет",s:0}] },
  { id:4, text:"Как вы оцениваете уровень стресса в вашей жизни?",
    opts:[{t:"Очень высокий",s:3},{t:"Выше среднего",s:2},{t:"Умеренный",s:1},{t:"Низкий",s:0}] },
  { id:5, text:"Бывают ли у вас отёки по утрам (лицо, ноги)?",
    opts:[{t:"Да, почти каждый день",s:3},{t:"Часто",s:2},{t:"Иногда",s:1},{t:"Нет",s:0}] },
];

/* ═══════════════════════════════════════════════════════════
 * CASES SECTION
 * ═══════════════════════════════════════════════════════════ */
function CasesSection() {
  const ref = useRef(null);
  const scrollRef = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const [active, setActive] = useState(0);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const cw = el.scrollWidth / CASES.length;
    setActive(Math.min(Math.round(el.scrollLeft / cw), CASES.length-1));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const scrollTo = (i) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: (el.scrollWidth / CASES.length) * i, behavior: "smooth" });
  };

  return (
    <section ref={ref} style={{
      position: "relative", width: "100%", padding: "64px 0 56px", overflow: "hidden",
      background: "linear-gradient(180deg, #f8fafc 0%, #ecfdf5 50%, #f8fafc 100%)",
    }}>
      <div aria-hidden style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: "140%", height: "50%", background: "radial-gradient(ellipse, rgba(16,185,129,0.05), transparent 70%)", pointerEvents: "none" }} />

      {/* Header */}
      <motion.div variants={fadeInUp} initial="hidden" animate={inView?"visible":"hidden"}
        style={{ textAlign: "center", padding: "0 24px", marginBottom: 36, position: "relative", zIndex: 1 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px",
          borderRadius: 100, backgroundColor: "rgba(16,185,129,0.08)", marginBottom: 16 }}>
          <span style={{ fontSize: 12 }}>📸</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#10b981", letterSpacing: "0.04em", textTransform: "uppercase" }}>До / После</span>
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Реальные результаты</h2>
        <motion.div initial={{ scaleX: 0 }} animate={inView?{ scaleX: 1 }:{ scaleX: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ width: 48, height: 3, borderRadius: 2, background: "linear-gradient(90deg,#10b981,#6ee7b7)",
            margin: "12px auto 16px", transformOrigin: "center" }} />
        <p style={{ fontSize: 16, fontWeight: 400, color: "#64748b", margin: 0 }}>Каждая из них прошла этот путь</p>
      </motion.div>

      {/* Carousel */}
      <motion.div variants={stagger(0.08,0.1)} initial="hidden" animate={inView?"visible":"hidden"}>
        <div ref={scrollRef} style={{
          display: "flex", gap: 16, overflowX: "auto", scrollSnapType: "x mandatory",
          scrollBehavior: "smooth", WebkitOverflowScrolling: "touch", padding: "0 24px 8px",
          scrollbarWidth: "none", msOverflowStyle: "none",
        }}>
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
          {CASES.map((cs) => (
            <motion.div key={cs.id} variants={fadeInUp} style={{
              flexShrink: 0, width: "85%", maxWidth: 360, scrollSnapAlign: "center",
              borderRadius: 20, backgroundColor: "#fff", border: "1px solid rgba(0,0,0,0.04)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03)", overflow: "hidden",
            }}>
              {/* Before / After */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: 180, position: "relative" }}>
                <div style={{ position: "relative", overflow: "hidden", backgroundColor: "#fef2f2" }}>
                  <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#fecaca,#fca5a5)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>😔</div>
                  <div style={{ position: "absolute", bottom: 8, left: 8, padding: "3px 10px", borderRadius: 8,
                    backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", letterSpacing: "0.04em", textTransform: "uppercase" }}>До</span>
                  </div>
                </div>
                <div style={{ position: "relative", overflow: "hidden", backgroundColor: "#ecfdf5" }}>
                  <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#bbf7d0,#86efac)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🤩</div>
                  <div style={{ position: "absolute", bottom: 8, right: 8, padding: "3px 10px", borderRadius: 8,
                    backgroundColor: "rgba(16,185,129,0.85)" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", letterSpacing: "0.04em", textTransform: "uppercase" }}>После</span>
                  </div>
                </div>
                {/* Arrow divider */}
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                  width: 32, height: 32, borderRadius: 10, backgroundColor: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4l4 4-4 4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              {/* Content */}
              <div style={{ padding: "20px 20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 17, fontWeight: 600, color: "#0f172a" }}>{cs.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 400, color: "#94a3b8" }}>{cs.age} лет</span>
                </div>
                <div style={{ display: "inline-flex", padding: "4px 12px", borderRadius: 8,
                  backgroundColor: "rgba(16,185,129,0.08)", marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#059669" }}>✨ {cs.result}</span>
                </div>
                <div style={{ position: "relative", paddingLeft: 16, borderLeft: "3px solid rgba(16,185,129,0.2)" }}>
                  <span aria-hidden style={{ position: "absolute", top: -8, left: -4, fontSize: 32,
                    color: "rgba(16,185,129,0.15)", fontWeight: 700, lineHeight: 1, fontFamily: "Georgia,serif" }}>«</span>
                  <p style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.6, color: "#475569", margin: 0 }}>{cs.review}</p>
                </div>
              </div>
            </motion.div>
          ))}
          <div style={{ flexShrink: 0, width: 8 }} />
        </div>
      </motion.div>

      {/* Dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
        {CASES.map((_, i) => (
          <motion.button key={i} onClick={() => scrollTo(i)}
            animate={{ width: i===active?24:8, backgroundColor: i===active?"#10b981":"#cbd5e1" }}
            transition={{ duration: 0.25 }}
            style={{ height: 8, borderRadius: 4, border: "none", cursor: "pointer", outline: "none", padding: 0,
              WebkitTapHighlightColor: "transparent", boxShadow: i===active?"0 0 8px rgba(16,185,129,0.4)":"none" }} />
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
 * QUIZ SECTION
 * ═══════════════════════════════════════════════════════════ */
function QuizSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const total = QUESTIONS.length;
  const maxScore = total * 3;
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [sel, setSel] = useState(null);
  const [score, setScore] = useState(0);
  const [toast, setToast] = useState(false);
  const done = step >= total;

  const handleSelect = (idx, s) => {
    if (sel !== null) return;
    setSel(idx);
    const ns = score + s;
    setScore(ns);
    setTimeout(() => {
      setSel(null);
      setDir(1);
      setStep(p => p + 1);
    }, 600);
  };

  const restart = () => { setStep(0); setScore(0); setSel(null); setDir(1); };

  const getResult = () => {
    const pct = score / maxScore;
    if (pct >= 0.6) return { emoji: "🚨", text: "Тебе точно нужен детокс! Твой организм просит помощи.", color: "#ef4444" };
    if (pct >= 0.3) return { emoji: "⚠️", text: "Есть признаки того, что детокс будет полезен.", color: "#f59e0b" };
    return { emoji: "💚", text: "У тебя всё неплохо, но детокс поможет чувствовать себя ещё лучше!", color: "#22c55e" };
  };

  const labels = ["A","B","C","D"];
  const cur = !done ? QUESTIONS[step] : null;
  const pct = Math.round((score / maxScore) * 100);
  const res = getResult();

  return (
    <section ref={ref} style={{
      position: "relative", width: "100%", padding: "64px 0 72px",
      background: "linear-gradient(180deg, #0f172a, #1e293b)", overflow: "hidden",
    }}>
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-20%", right: "-20%", width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-15%", width: 250, height: 250, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <motion.div variants={fadeInUp} initial="hidden" animate={inView?"visible":"hidden"}
          style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px",
            borderRadius: 100, backgroundColor: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)", marginBottom: 20 }}>
            <span style={{ fontSize: 13 }}>🧩</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#6ee7b7", letterSpacing: "0.02em" }}>Мини-тест</span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: "0 0 16px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            Узнай, нужен ли тебе детокс
          </h2>
        </motion.div>

        {/* Progress */}
        <div style={{ marginBottom: 32 }}>
          <ProgressBar current={done ? total : step+1} total={total} />
        </div>

        {/* Question / Result */}
        <div style={{ minHeight: 360, position: "relative" }}>
          <AnimatePresence mode="wait" custom={dir}>
            {!done && cur ? (
              <motion.div key={`q-${step}`} custom={dir} variants={slideVariants}
                initial="enter" animate="center" exit="exit">
                <h3 style={{ fontSize: 20, fontWeight: 600, color: "#fff", margin: "0 0 24px", lineHeight: 1.4 }}>
                  {cur.text}
                </h3>
                <motion.div variants={stagger(0.06,0)} initial="hidden" animate="visible"
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {cur.opts.map((opt, idx) => {
                    const isSel = sel === idx;
                    const dis = sel !== null;
                    return (
                      <motion.button key={idx} variants={fadeInUp}
                        whileTap={!dis ? { scale: 0.97 } : undefined}
                        onClick={!dis ? () => handleSelect(idx, opt.s) : undefined}
                        animate={isSel ? { borderColor: "#10b981", boxShadow: "0 0 20px rgba(16,185,129,0.25)" } : {}}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 14,
                          padding: "16px 18px", borderRadius: 14,
                          backgroundColor: isSel ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)",
                          border: isSel ? "1.5px solid #10b981" : "1.5px solid rgba(255,255,255,0.08)",
                          cursor: dis ? "default" : "pointer", outline: "none", textAlign: "left",
                          WebkitTapHighlightColor: "transparent", opacity: dis && !isSel ? 0.5 : 1,
                          transition: "background-color 0.2s ease",
                        }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 10,
                          backgroundColor: isSel ? "#10b981" : "rgba(255,255,255,0.08)",
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          transition: "all 0.2s ease",
                        }}>
                          {isSel ? (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M3.5 8L6.5 11L12.5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>{labels[idx]}</span>
                          )}
                        </div>
                        <span style={{ fontSize: 16, fontWeight: isSel?600:400,
                          color: isSel ? "#6ee7b7" : "rgba(255,255,255,0.8)", lineHeight: 1.4,
                          transition: "color 0.2s ease" }}>{opt.t}</span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              </motion.div>
            ) : (
              /* Result */
              <motion.div key="result" custom={dir} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                style={{ textAlign: "center" }}>
                <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                  style={{ fontSize: 56, lineHeight: 1, marginBottom: 20 }}>{res.emoji}</motion.div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 16px",
                  borderRadius: 100, backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: 20 }}>
                  <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.5)" }}>Твой результат:</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: res.color }}>{score}/{maxScore} ({pct}%)</span>
                </div>
                <div style={{ width: "100%", maxWidth: 280, margin: "0 auto 24px", height: 10, borderRadius: 5,
                  backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    style={{ height: "100%", borderRadius: 5, backgroundColor: res.color,
                      boxShadow: `0 0 12px ${res.color}66` }} />
                </div>
                <p style={{ fontSize: 18, fontWeight: 500, color: "#fff", lineHeight: 1.5, margin: "0 0 32px",
                  maxWidth: 340, marginLeft: "auto", marginRight: "auto" }}>{res.text}</p>
                <Btn variant="success" icon="✨" onClick={() => { setToast(true); setTimeout(() => setToast(false), 1500); }}>
                  Начать детокс прямо сейчас
                </Btn>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 16, lineHeight: 1.4 }}>
                  Тест носит информационный характер и не является диагнозом
                </p>
                {/* Restart link */}
                <motion.button whileTap={{ scale: 0.96 }} onClick={restart}
                  style={{ marginTop: 16, background: "none", border: "none", color: "rgba(255,255,255,0.4)",
                    fontSize: 13, fontWeight: 500, cursor: "pointer", outline: "none", textDecoration: "underline",
                    WebkitTapHighlightColor: "transparent" }}>
                  Пройти заново
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 100,
              padding: "12px 24px", borderRadius: 12, backgroundColor: "rgba(16,185,129,0.95)", color: "#fff",
              fontSize: 14, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
            ✨ Переход к оплате…
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ═══ DIVIDER ═══ */
function Div() {
  return <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg, transparent 0%, #e2e8f0 30%, #e2e8f0 70%, transparent 100%)" }} />;
}

/* ═══ MAIN PREVIEW ═══ */
export default function Preview() {
  return (
    <div style={{ width: "100%", margin: 0, padding: 0,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
      WebkitFontSmoothing: "antialiased", overflowX: "hidden" }}>
      <CasesSection />
      <Div />
      <QuizSection />
    </div>
  );
}
