import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

/* ═══════════════════════════════════════════════════════════
 * ANIMATION PRESETS
 * ═══════════════════════════════════════════════════════════ */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
};
const staggerContainer = (d = 0.08, dc = 0.1) => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: d, delayChildren: dc } },
});
const buttonTap = { scale: 0.96, transition: { duration: 0.1 } };
const buttonHover = { scale: 1.02, transition: { duration: 0.2 } };

/* ═══════════════════════════════════════════════════════════
 * BUTTON
 * ═══════════════════════════════════════════════════════════ */
const BTN = {
  primary: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#fff", border: "none",
    boxShadow: "0 4px 20px rgba(16,185,129,0.35), 0 2px 8px rgba(16,185,129,0.2)",
  },
};
function Btn({ children, onClick, style: s }) {
  return (
    <motion.button
      whileTap={buttonTap} whileHover={buttonHover} onClick={onClick}
      style={{
        ...BTN.primary, height: 40, fontSize: 14, padding: "0 16px", borderRadius: 12,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontWeight: 600, cursor: "pointer", outline: "none",
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        WebkitTapHighlightColor: "transparent", ...s,
      }}
    >{children}</motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════
 * CARD
 * ═══════════════════════════════════════════════════════════ */
function Card({ children, icon, iconSize = 48 }) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -3, boxShadow: "0 16px 48px rgba(0,0,0,0.1)", transition: { duration: 0.25 } }}
      style={{
        backgroundColor: "#ffffff", borderRadius: 16, padding: 24,
        border: "1px solid rgba(0,0,0,0.03)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.25s ease",
      }}
    >
      {icon && (
        <div style={{
          width: iconSize, height: iconSize, borderRadius: iconSize * 0.28,
          backgroundColor: "rgba(16,185,129,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 16, fontSize: iconSize * 0.5, lineHeight: 1,
        }}>{icon}</div>
      )}
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * DATA
 * ═══════════════════════════════════════════════════════════ */
const AUTHOR_CARDS = [
  { id: 1, icon: "👋", title: "Кто я", desc: "Привет! Я — нутрициолог и специалист по детоксикации с медицинским образованием." },
  { id: 2, icon: "📊", title: "Опыт", desc: "Более 10 лет практики. 500+ консультаций. 200+ клиенток прошли мои программы." },
  { id: 3, icon: "🎓", title: "Образование", desc: "Высшее медицинское образование. Специализация: нутрициология и превентивная медицина." },
  { id: 4, icon: "🔬", title: "Чем занимаюсь сейчас", desc: "Веду детокс-программы для женщин 35+. Помогаю вернуть здоровье кожи и комфортный вес." },
  { id: 5, icon: "💚", title: "Мой подход", desc: "Мягкий, научно обоснованный детокс без голодовок. Подходит для повседневной жизни." },
];

const METHOD_ITEMS = [
  { id: 1, icon: "🧪", title: "Научный подход", desc: "Все рекомендации основаны на исследованиях и клинической практике. Никаких мифов — только доказательная медицина." },
  { id: 2, icon: "🥗", title: "Питание без голодания", desc: "Сбалансированное детокс-меню, которое не требует жёстких ограничений. Ты будешь есть вкусно и с пользой." },
  { id: 3, icon: "💆", title: "Уход за кожей изнутри", desc: "Специальные протоколы для восстановления чистоты и сияния кожи. Работаем с причиной, а не симптомами." },
  { id: 4, icon: "🏃", title: "Мягкая активность", desc: "Лёгкие упражнения и лимфодренажные практики для каждого дня. Без изнурительных тренировок." },
  { id: 5, icon: "🧘", title: "Баланс и спокойствие", desc: "Техники управления стрессом, который напрямую влияет на кожу и вес. Восстанавливаем внутреннюю гармонию." },
];

/* ═══════════════════════════════════════════════════════════
 * ABOUT AUTHOR
 * ═══════════════════════════════════════════════════════════ */
function AboutAuthor() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section ref={ref} style={{
      position: "relative", width: "100%", padding: "64px 0 72px", overflow: "hidden",
      background: "linear-gradient(180deg, #f8fafc 0%, #ecfdf5 50%, #f8fafc 100%)",
    }}>
      <div aria-hidden style={{
        position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
        width: "140%", height: "60%",
        background: "radial-gradient(ellipse at center, rgba(16,185,129,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "0 24px" }}>

        {/* Avatar 200px */}
        <motion.div variants={scaleIn} initial="hidden" animate={inView ? "visible" : "hidden"}
          style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <div style={{ position: "relative", width: 200, height: 200 }}>
            <div aria-hidden style={{
              position: "absolute", inset: -12, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)",
            }} />
            <div style={{
              position: "absolute", inset: -4, borderRadius: "50%",
              background: "linear-gradient(135deg, #10b981 0%, #059669 50%, #6ee7b7 100%)", padding: 4,
            }}>
              <div style={{
                width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden",
                background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64,
              }}>👩‍⚕️</div>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div variants={fadeInUp} initial="hidden" animate={inView ? "visible" : "hidden"}
          style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{
            fontSize: 28, fontWeight: 700, color: "#0f172a", margin: "0 0 8px",
            fontFamily: "-apple-system, sans-serif", letterSpacing: "-0.02em",
          }}>Об авторе</h2>
          <motion.div
            initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
            style={{
              width: 48, height: 3, borderRadius: 2,
              background: "linear-gradient(90deg, #10b981, #6ee7b7)",
              margin: "12px auto 16px", transformOrigin: "center",
            }}
          />
          <p style={{ fontSize: 16, fontWeight: 400, color: "#64748b", margin: 0 }}>
            Познакомьтесь с создателем курса
          </p>
        </motion.div>

        {/* 5 Cards */}
        <motion.div variants={staggerContainer(0.08, 0.1)} initial="hidden"
          animate={inView ? "visible" : "hidden"}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {AUTHOR_CARDS.map(c => (
            <Card key={c.id} icon={c.icon} iconSize={48}>
              <h3 style={{
                fontSize: 20, fontWeight: 600, color: "#0f172a", margin: "0 0 8px",
                fontFamily: "-apple-system, sans-serif", letterSpacing: "-0.01em",
              }}>{c.title}</h3>
              <p style={{
                fontSize: 16, fontWeight: 400, lineHeight: 1.55, color: "#475569", margin: 0,
              }}>{c.desc}</p>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
 * METHOD SECTION
 * ═══════════════════════════════════════════════════════════ */
function MethodSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const [clicked, setClicked] = useState(null);

  return (
    <section ref={ref} style={{
      position: "relative", width: "100%", padding: "64px 0 72px",
      background: "#f8fafc", overflow: "hidden",
    }}>
      {/* Dot grid */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.3,
          backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
        <div style={{
          position: "absolute", top: "15%", right: "-20%", width: 300, height: 300,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
        }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <motion.div variants={fadeInUp} initial="hidden" animate={inView ? "visible" : "hidden"}
          style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 100,
            backgroundColor: "rgba(16,185,129,0.08)", marginBottom: 16,
          }}>
            <span style={{ fontSize: 12 }}>🔬</span>
            <span style={{
              fontSize: 12, fontWeight: 600, color: "#10b981",
              letterSpacing: "0.04em", textTransform: "uppercase",
            }}>Методология</span>
          </div>

          <h2 style={{
            fontSize: 28, fontWeight: 700, color: "#0f172a", margin: "0 0 8px",
            fontFamily: "-apple-system, sans-serif", letterSpacing: "-0.02em",
          }}>Мой метод работы</h2>

          <motion.div
            initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
            style={{
              width: 48, height: 3, borderRadius: 2,
              background: "linear-gradient(90deg, #10b981, #6ee7b7)",
              margin: "12px auto 16px", transformOrigin: "center",
            }}
          />
          <p style={{
            fontSize: 16, fontWeight: 400, color: "#64748b", margin: 0,
            maxWidth: 340, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5,
          }}>Научно обоснованный подход к детоксикации</p>
        </motion.div>

        {/* Items with timeline */}
        <motion.div variants={staggerContainer(0.1, 0.15)} initial="hidden"
          animate={inView ? "visible" : "hidden"}
          style={{ display: "flex", flexDirection: "column", position: "relative" }}>

          {/* Connecting line */}
          <motion.div aria-hidden
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
            style={{
              position: "absolute", left: 27, top: 56, bottom: 56, width: 2,
              background: "linear-gradient(180deg, #10b981 0%, rgba(16,185,129,0.15) 100%)",
              transformOrigin: "top", borderRadius: 1, zIndex: 0,
            }}
          />

          {METHOD_ITEMS.map((item, i) => {
            const num = String(i + 1).padStart(2, "0");
            const isLast = i === METHOD_ITEMS.length - 1;
            return (
              <motion.div key={item.id} variants={fadeInUp}
                style={{
                  display: "flex", gap: 20, position: "relative", zIndex: 1,
                  paddingBottom: isLast ? 0 : 32,
                }}>
                {/* Left: icon */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <motion.div variants={scaleIn} style={{
                    width: 56, height: 56, borderRadius: 18,
                    background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
                    border: "1.5px solid rgba(16,185,129,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 26, lineHeight: 1, position: "relative",
                    boxShadow: "0 4px 16px rgba(16,185,129,0.1), 0 1px 4px rgba(0,0,0,0.04)",
                  }}>
                    {item.icon}
                    <div style={{
                      position: "absolute", top: -6, right: -6, width: 22, height: 22,
                      borderRadius: 7, backgroundColor: "#10b981", color: "#fff",
                      fontSize: 11, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(16,185,129,0.4)",
                    }}>{num}</div>
                  </motion.div>
                </div>

                {/* Right: content card */}
                <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                  <div style={{
                    backgroundColor: "#ffffff", borderRadius: 16, padding: "20px 20px 18px",
                    border: "1px solid rgba(0,0,0,0.04)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)",
                  }}>
                    <h3 style={{
                      fontSize: 18, fontWeight: 600, color: "#0f172a", margin: "0 0 6px",
                      letterSpacing: "-0.01em", lineHeight: 1.3,
                    }}>{item.title}</h3>
                    <p style={{
                      fontSize: 15, fontWeight: 400, lineHeight: 1.55, color: "#475569",
                      margin: "0 0 16px",
                    }}>{item.desc}</p>
                    <Btn onClick={() => setClicked(item.id)}>Хочу так же</Btn>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Click toast */}
      {clicked && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          onAnimationComplete={() => setTimeout(() => setClicked(null), 1200)}
          style={{
            position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
            zIndex: 100, padding: "12px 24px", borderRadius: 12,
            backgroundColor: "rgba(16,185,129,0.95)", color: "#fff",
            fontSize: 14, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >✨ Прокрутка к покупке…</motion.div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
 * SECTION DIVIDER
 * ═══════════════════════════════════════════════════════════ */
function Divider() {
  return (
    <div style={{
      width: "100%", height: 1,
      background: "linear-gradient(90deg, transparent 0%, #e2e8f0 30%, #e2e8f0 70%, transparent 100%)",
    }} />
  );
}

/* ═══════════════════════════════════════════════════════════
 * MAIN PREVIEW
 * ═══════════════════════════════════════════════════════════ */
export default function Preview() {
  return (
    <div style={{
      width: "100%", minHeight: "100vh", margin: 0, padding: 0,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
      WebkitFontSmoothing: "antialiased",
      background: "#f8fafc", overflowX: "hidden",
    }}>
      <AboutAuthor />
      <Divider />
      <MethodSection />
    </div>
  );
}
