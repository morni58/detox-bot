import { useState, useRef, useMemo } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

/* ═══ ANIMATIONS ═══ */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25,1,0.5,1] } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.25,1,0.5,1] } },
};
const stagger = (d=0.1, dc=0.05) => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: d, delayChildren: dc } },
});
const tap = { scale: 0.96, transition: { duration: 0.1 } };
const hover = { scale: 1.02, transition: { duration: 0.2 } };

/* ═══ BUTTON ═══ */
const BTN_STYLES = {
  success: { background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", color: "#fff", border: "none", boxShadow: "0 4px 24px rgba(34,197,94,0.4)" },
  primary: { background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff", border: "none", boxShadow: "0 4px 20px rgba(16,185,129,0.35)" },
};
const BTN_SIZES = {
  xl: { height: 60, fontSize: 18, padding: "0 32px", borderRadius: 16 },
  hero: { height: 70, fontSize: 20, padding: "0 36px", borderRadius: 20 },
};
function Btn({ children, variant="success", size="xl", icon, onClick, style: s }) {
  return (
    <motion.button whileTap={tap} whileHover={hover} onClick={onClick}
      style={{
        ...BTN_STYLES[variant], ...BTN_SIZES[size], width: "100%",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
        fontWeight: 600, cursor: "pointer", outline: "none", position: "relative", overflow: "hidden",
        fontFamily: "-apple-system, sans-serif", WebkitTapHighlightColor: "transparent", ...s,
      }}>
      {variant === "success" && (
        <motion.span aria-hidden animate={{ x: ["-100%","300%"] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
          style={{ position: "absolute", top: 0, left: 0, width: "30%", height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)", pointerEvents: "none" }}
        />
      )}
      {icon && <span style={{ fontSize: size==="hero"?24:20, lineHeight: 1 }}>{icon}</span>}
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </motion.button>
  );
}

/* ═══ GLASS CARD ═══ */
function GlassCard({ children, style: s }) {
  return (
    <motion.div variants={scaleIn} style={{
      backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.12)", backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)", borderRadius: 16, padding: "20px 16px",
      textAlign: "center", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", minHeight: 140, ...s,
    }}>{children}</motion.div>
  );
}

/* ═══ DATA ═══ */
const RESULTS = [
  { id:1, icon:"✨", val:"93%",   lab:"улучшение кожи",   desc:"Видимое улучшение на 2-й неделе" },
  { id:2, icon:"⚖️", val:"3–7 кг",lab:"снижение веса",    desc:"Без голодания и жёстких диет" },
  { id:3, icon:"⚡",  val:"2x",    lab:"больше энергии",   desc:"Очищение + правильное питание" },
  { id:4, icon:"💆",  val:"87%",   lab:"снижение стресса", desc:"Нормализация кортизола" },
];

const WEEKS = [
  { num:1, label:"Неделя 1", sub:"Мягкий старт" },
  { num:2, label:"Неделя 2", sub:"Глубокое очищение" },
  { num:3, label:"Неделя 3", sub:"Закрепление" },
];

const DAYS = [
  { n:1, t:"Подготовка",       s:"Оценка текущего состояния",     f:"Заполняем дневник самочувствия. Фиксируем точку старта: вес, состояние кожи, энергия.", tasks:["Заполнить дневник","Сделать фото ДО","Убрать сахар и фастфуд"], i:"🌅" },
  { n:2, t:"Водный баланс",    s:"Настраиваем питьевой режим",    f:"Рассчитываем норму воды. Утренний ритуал с лимонной водой.", tasks:["Рассчитать норму воды","Утренний стакан с лимоном"], i:"💧" },
  { n:3, t:"Детокс-завтраки",  s:"Новые утренние привычки",       f:"Смузи, каши с суперфудами, свежие овощи.", tasks:["Приготовить детокс-смузи","Записать ощущения"], i:"🥣" },
  { n:4, t:"Лимфодренаж",      s:"Запускаем лимфатическую систему",f:"Сухой массаж щёткой. Контрастный душ. Упражнения.", tasks:["Сухой массаж 5 мин","Контрастный душ"], i:"🧖" },
  { n:5, t:"Очищение кожи",    s:"Начинаем работу с кожей",       f:"Натуральные маски. Питание для кожи изнутри.", tasks:["Ревизия косметички","Натуральная маска"], i:"✨" },
  { n:6, t:"Антистресс",       s:"Снижаем кортизол",              f:"Дыхательные практики, прогулка, цифровой детокс.", tasks:["Дыхательная практика 10 мин","Прогулка 30 мин"], i:"🧘" },
  { n:7, t:"Итоги недели",     s:"Первые результаты",             f:"Сравниваем самочувствие с днём 1.", tasks:["Заполнить дневник","Сравнить с днём 1"], i:"📊" },
  { n:8, t:"Детокс-меню",      s:"Полный переход",                f:"Меню на всю неделю: завтраки, обеды, ужины.", tasks:["Закупить продукты","Приготовить обед"], i:"🥗" },
  { n:9, t:"Глубокий лимфодренаж",s:"Усиливаем практики",         f:"Гуа-ша, массаж, лимфодренажная гимнастика.", tasks:["Гуа-ша 10 мин","Гимнастика 15 мин"], i:"💆" },
  { n:10,t:"Детокс печени",    s:"Поддержка фильтра",             f:"Продукты для печени. Куркума.", tasks:["Вода с куркумой","Салат с рукколой"], i:"🫒" },
  { n:11,t:"Детокс кишечника", s:"Восстанавливаем микрофлору",    f:"Пребиотики, пробиотики.", tasks:["Добавить кефир","Увеличить клетчатку"], i:"🦠" },
  { n:12,t:"Интенсив для кожи",s:"Глубокое очищение",             f:"Паровые ванночки. Маска с глиной.", tasks:["Паровая ванночка","Маска с глиной"], i:"🌺" },
  { n:13,t:"Движение",         s:"Активный день",                 f:"Тренировка 30 мин. Йога или пилатес.", tasks:["Тренировка 30 мин","10 000 шагов"], i:"🏃" },
  { n:14,t:"Итоги недели 2",   s:"Промежуточные результаты",      f:"Взвешивание. Фото кожи. Ты молодец!", tasks:["Взвешивание","Фото кожи"], i:"🏆" },
  { n:15,t:"Закрепление",      s:"Формируем привычки",            f:"Персональное меню. Правило 80/20.", tasks:["Составить меню","Записать рецепты"], i:"📝" },
  { n:16,t:"Утренний ритуал",  s:"Идеальное утро",                f:"Вода, дыхание, движение, уход.", tasks:["Записать ритуал","Выполнить"], i:"🌅" },
  { n:17,t:"Уход за кожей",    s:"Финальный протокол",            f:"Минимальный и расширенный уход.", tasks:["Записать протокол"], i:"🪞" },
  { n:18,t:"Антистресс-система",s:"Долгосрочное управление",      f:"2–3 практики навсегда.", tasks:["Выбрать 2 практики"], i:"🕊" },
  { n:19,t:"Движение навсегда",s:"Режим активности",              f:"Расписание тренировок на месяц.", tasks:["Составить расписание"], i:"🚴" },
  { n:20,t:"Подготовка к финалу",s:"Финальные замеры",            f:"Взвешивание. Фото ПОСЛЕ.", tasks:["Взвешивание","Фото ПОСЛЕ"], i:"📸" },
  { n:21,t:"Выпускной!",       s:"Ты прошла весь путь!",          f:"Сравниваем ДО и ПОСЛЕ. Бонусы!", tasks:["Сравнить ДО/ПОСЛЕ","Забрать бонусы"], i:"🎉" },
];

/* ═══ TIMELINE COMPONENT ═══ */
function Timeline() {
  const [week, setWeek] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const weekDays = useMemo(() => DAYS.filter(d => {
    if (week===1) return d.n>=1&&d.n<=7;
    if (week===2) return d.n>=8&&d.n<=14;
    return d.n>=15&&d.n<=21;
  }), [week]);

  return (
    <div>
      {/* Week tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {WEEKS.map(w => {
          const active = week===w.num;
          return (
            <motion.button key={w.num} whileTap={{ scale: 0.96 }}
              onClick={() => { setWeek(w.num); setExpanded(null); }}
              style={{
                flex: 1, padding: "12px 8px", borderRadius: 14, cursor: "pointer", outline: "none",
                border: active ? "1.5px solid #10b981" : "1.5px solid rgba(0,0,0,0.06)",
                background: active ? "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.04))" : "#fff",
                boxShadow: active ? "0 2px 12px rgba(16,185,129,0.15)" : "0 1px 4px rgba(0,0,0,0.04)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                WebkitTapHighlightColor: "transparent", fontFamily: "-apple-system, sans-serif",
              }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: active?"#10b981":"#0f172a" }}>{w.label}</span>
              <span style={{ fontSize: 11, fontWeight: 400, color: active?"#059669":"#94a3b8" }}>{w.sub}</span>
            </motion.button>
          );
        })}
      </div>
      {/* Days */}
      <AnimatePresence mode="wait">
        <motion.div key={week}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
          style={{ position: "relative" }}>
          <div aria-hidden style={{
            position: "absolute", left: 15, top: 20, bottom: 20, width: 2,
            background: "linear-gradient(180deg, #10b981, rgba(16,185,129,0.12))", borderRadius: 1,
          }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {weekDays.map((day, idx) => {
              const isExp = expanded===day.n;
              return (
                <motion.div key={day.n}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx*0.04 }}>
                  <motion.button whileTap={{ scale: 0.985 }}
                    onClick={() => setExpanded(prev => prev===day.n?null:day.n)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 16px 14px 0", background: "none", border: "none",
                      cursor: "pointer", outline: "none", textAlign: "left",
                      WebkitTapHighlightColor: "transparent",
                    }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
                      background: isExp ? "linear-gradient(135deg, #10b981, #059669)" : "#fff",
                      border: isExp ? "none" : "1.5px solid #e2e8f0",
                      boxShadow: isExp ? "0 2px 10px rgba(16,185,129,0.35)" : "0 1px 3px rgba(0,0,0,0.04)",
                      color: isExp ? "#fff" : undefined, transition: "all 0.2s ease", zIndex: 1,
                    }}>{isExp ? "✓" : day.i}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: isExp?"#10b981":"#94a3b8", letterSpacing: "0.02em" }}>ДЕНЬ {day.n}</span>
                        <span style={{ fontSize: 15, fontWeight: 600, color: isExp?"#0f172a":"#334155" }}>{day.t}</span>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 400, color: "#64748b", margin: "2px 0 0", lineHeight: 1.4 }}>{day.s}</p>
                    </div>
                    <motion.div animate={{ rotate: isExp?180:0 }} transition={{ duration: 0.2 }}
                      style={{ flexShrink: 0, color: "#94a3b8" }}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.div>
                  </motion.button>
                  <AnimatePresence>
                    {isExp && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                        style={{ overflow: "hidden", marginLeft: 46 }}>
                        <div style={{ padding: "4px 16px 20px 0" }}>
                          <p style={{ fontSize: 14, lineHeight: 1.6, color: "#475569", margin: "0 0 14px" }}>{day.f}</p>
                          {day.tasks.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: "#10b981", letterSpacing: "0.04em", textTransform: "uppercase" }}>Задачи на день</span>
                              {day.tasks.map((task, ti) => (
                                <div key={ti} style={{
                                  display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 12px",
                                  borderRadius: 10, backgroundColor: "rgba(16,185,129,0.05)",
                                  border: "1px solid rgba(16,185,129,0.08)",
                                }}>
                                  <div style={{
                                    width: 18, height: 18, borderRadius: 5, border: "1.5px solid #10b981",
                                    flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center",
                                  }}><div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: "rgba(16,185,129,0.3)" }} /></div>
                                  <span style={{ fontSize: 14, color: "#334155", lineHeight: 1.4 }}>{task}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══ MAIN PREVIEW ═══ */
export default function CoursePreview() {
  const [toast, setToast] = useState(false);
  const headerRef = useRef(null);
  const statsRef = useRef(null);
  const timelineRef = useRef(null);
  const guaranteeRef = useRef(null);
  const hInView = useInView(headerRef, { once: true, amount: 0.3 });
  const sInView = useInView(statsRef, { once: true, amount: 0.2 });
  const tInView = useInView(timelineRef, { once: true, amount: 0.1 });
  const gInView = useInView(guaranteeRef, { once: true, amount: 0.3 });
  const buy = () => { setToast(true); setTimeout(() => setToast(false), 1500); };

  return (
    <div style={{ width: "100%", margin: 0, padding: 0, fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", WebkitFontSmoothing: "antialiased", overflowX: "hidden" }}>
      {/* ══ PART 1: DARK HEADER ══ */}
      <div style={{ position: "relative", width: "100%", padding: "72px 0 56px",
        background: "linear-gradient(180deg, #0f172a, #1e293b)", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, opacity: 0.06,
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)",
          width: "120%", height: "60%", background: "radial-gradient(ellipse, rgba(16,185,129,0.08), transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "0 24px" }}>
          <motion.div ref={headerRef} variants={fadeInUp} initial="hidden" animate={hInView?"visible":"hidden"}
            style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px",
              borderRadius: 100, backgroundColor: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)", marginBottom: 20 }}>
              <span style={{ fontSize: 13 }}>🌿</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#6ee7b7", letterSpacing: "0.02em" }}>Главная программа</span>
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>21-дневный детокс-курс</h2>
            <motion.div initial={{ scaleX: 0 }} animate={hInView?{ scaleX: 1 }:{ scaleX: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{ width: 48, height: 3, borderRadius: 2, background: "linear-gradient(90deg, #10b981, #6ee7b7)",
                margin: "0 auto 16px", transformOrigin: "center" }} />
            <p style={{ fontSize: 17, fontWeight: 400, color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.5 }}>
              Для женщин 35+ с проблемами кожи и лишним весом
            </p>
          </motion.div>

          {/* BUY #1 */}
          <motion.div variants={fadeInUp} initial="hidden" animate={hInView?"visible":"hidden"} style={{ marginBottom: 48 }}>
            <Btn variant="success" icon="✨" onClick={buy}>Купить курс</Btn>
          </motion.div>

          {/* Why detox */}
          <motion.div variants={fadeInUp} initial="hidden" animate={hInView?"visible":"hidden"} style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 22, fontWeight: 600, color: "#fff", margin: "0 0 12px" }}>Почему детокс важен?</h3>
            <p style={{ fontSize: 15, fontWeight: 400, lineHeight: 1.65, color: "rgba(255,255,255,0.6)", margin: 0 }}>
              После 35 лет метаболизм замедляется, а токсины накапливаются быстрее. Это отражается на коже и весе. Детокс перезапускает очищение организма.
            </p>
          </motion.div>

          {/* 4 Stats (2×2) */}
          <motion.div ref={statsRef} variants={stagger(0.1, 0.05)} initial="hidden" animate={sInView?"visible":"hidden"}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {RESULTS.map(r => (
              <GlassCard key={r.id}>
                <span style={{ fontSize: 28, lineHeight: 1, marginBottom: 10 }}>{r.icon}</span>
                <span style={{ fontSize: 28, fontWeight: 700, color: "#6ee7b7", lineHeight: 1.1, letterSpacing: "-0.02em" }}>{r.val}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.7)", marginTop: 4, lineHeight: 1.3 }}>{r.lab}</span>
                <span style={{ fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.4)", marginTop: 6, lineHeight: 1.3 }}>{r.desc}</span>
              </GlassCard>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ══ PART 2: TIMELINE ══ */}
      <div style={{ width: "100%", padding: "56px 0", background: "#f8fafc" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 24px" }}>
          <motion.div ref={timelineRef} variants={fadeInUp} initial="hidden" animate={tInView?"visible":"hidden"}
            style={{ textAlign: "center", marginBottom: 32 }}>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Программа курса</h3>
            <p style={{ fontSize: 15, color: "#64748b", margin: 0 }}>Нажми на любой день, чтобы увидеть подробности</p>
          </motion.div>
          <motion.div variants={fadeInUp} initial="hidden" animate={tInView?"visible":"hidden"}>
            <Timeline />
          </motion.div>
          {/* BUY #2 */}
          <motion.div variants={fadeInUp} initial="hidden" animate={tInView?"visible":"hidden"} style={{ marginTop: 36 }}>
            <Btn variant="primary" icon="🌿" onClick={buy}>Купить курс</Btn>
          </motion.div>
        </div>
      </div>

      {/* ══ PART 3: CONDITIONS + GUARANTEE + PRICE + BUY #3 ══ */}
      <div style={{ width: "100%", padding: "0 0 72px", background: "#f8fafc" }}>
        <div ref={guaranteeRef} style={{ maxWidth: 480, margin: "0 auto", padding: "0 24px" }}>
          {/* Conditions */}
          <motion.div variants={fadeInUp} initial="hidden" animate={gInView?"visible":"hidden"} style={{ marginBottom: 16 }}>
            <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24,
              border: "1px solid rgba(0,0,0,0.04)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <h4 style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", margin: "0 0 10px" }}>📋 Условия участия</h4>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: "#475569", margin: 0 }}>
                Доступ мгновенно после оплаты. Материалы доступны 60 дней. Можно проходить в своём темпе.
              </p>
            </div>
          </motion.div>
          {/* Guarantee */}
          <motion.div variants={fadeInUp} initial="hidden" animate={gInView?"visible":"hidden"} style={{ marginBottom: 32 }}>
            <div style={{
              borderRadius: 16, padding: 24,
              background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.03))",
              border: "1.5px solid rgba(16,185,129,0.15)", display: "flex", gap: 16, alignItems: "flex-start",
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "linear-gradient(135deg, #10b981, #059669)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, flexShrink: 0, boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
              }}>🛡</div>
              <div>
                <h4 style={{ fontSize: 17, fontWeight: 600, color: "#0f172a", margin: "0 0 6px" }}>Гарантия 14 дней</h4>
                <p style={{ fontSize: 14, lineHeight: 1.55, color: "#475569", margin: 0 }}>
                  Если курс не подойдёт — вернём Stars без вопросов.
                </p>
              </div>
            </div>
          </motion.div>
          {/* Price block */}
          <motion.div variants={scaleIn} initial="hidden" animate={gInView?"visible":"hidden"} style={{ marginBottom: 24 }}>
            <div style={{
              borderRadius: 20, padding: "28px 24px",
              background: "linear-gradient(135deg, #0f172a, #1e293b)",
              textAlign: "center", position: "relative", overflow: "hidden",
            }}>
              <div aria-hidden style={{
                position: "absolute", top: "-40%", left: "50%", transform: "translateX(-50%)",
                width: "120%", height: "80%", background: "radial-gradient(ellipse, rgba(16,185,129,0.12), transparent 70%)", pointerEvents: "none",
              }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <span style={{ fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.4)", textDecoration: "line-through", display: "block", marginBottom: 4 }}>2500 Stars</span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 28 }}>⭐</span>
                  <span style={{ fontSize: 40, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>1500</span>
                  <span style={{ fontSize: 18, fontWeight: 400, color: "rgba(255,255,255,0.5)" }}>Stars</span>
                </div>
                <div style={{ display: "inline-flex", padding: "4px 12px", borderRadius: 100,
                  backgroundColor: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#4ade80" }}>Выгода 1000 Stars</span>
                </div>
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
                  {["Полная программа на 21 день","Ежедневные рекомендации","Закрытый чат с поддержкой","Персональная обратная связь","Бонусные материалы по уходу"].map((item,i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: "rgba(16,185,129,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.3 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          {/* BUY #3 — biggest */}
          <motion.div variants={scaleIn} initial="hidden" animate={gInView?"visible":"hidden"}>
            <Btn variant="success" size="hero" icon="🚀" onClick={buy}>Купить курс</Btn>
            <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 12, lineHeight: 1.4 }}>
              Безопасная оплата через Telegram • Мгновенный доступ
            </p>
          </motion.div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 100,
              padding: "12px 24px", borderRadius: 12, backgroundColor: "rgba(16,185,129,0.95)", color: "#fff",
              fontSize: 14, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
            ⭐ Переход к оплате Stars…
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
