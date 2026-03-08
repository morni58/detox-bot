import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══ MOCK DATA ═══ */
const MOCK = {
  texts: {
    hero: { title: "21-дневный детокс-курс", subtitle: "Мягкий научный метод", badge: "🌿 21-дневный курс", cta_primary: "Начать детокс ✨", cta_secondary: "Подробнее" },
    author: { section_title: "Об авторе", section_subtitle: "Познакомьтесь с создателем курса" },
    method: { section_title: "Мой метод работы", section_subtitle: "Научно обоснованный подход", badge: "Методология", button_text: "Хочу так же" },
    course: { badge: "Главная программа", why_detox_title: "Почему детокс важен?" },
    cases: { section_title: "Реальные результаты", section_subtitle: "Каждая из них прошла этот путь", badge: "До / После" },
    quiz: { section_title: "Узнай, нужен ли тебе детокс", badge: "Мини-тест", result_high: "Тебе точно нужен детокс!", result_medium: "Есть признаки...", result_low: "У тебя всё неплохо", result_button: "Начать детокс" },
    final_cta: { title: "Готова начать?", subtitle: "Присоединяйся к 200+ довольным клиенткам", button_text: "Купить курс" },
  },
  photos: { hero_bg: { slot: "hero_bg", filePath: "", altText: "Фон" }, author_avatar: { slot: "author_avatar", filePath: "", altText: "Автор" } },
  authorCards: [
    { id:1, icon:"👋", title:"Кто я", description:"Нутрициолог и специалист по детоксикации.", sortOrder:1, isVisible:true },
    { id:2, icon:"📊", title:"Опыт", description:"10+ лет практики, 500+ консультаций.", sortOrder:2, isVisible:true },
    { id:3, icon:"🎓", title:"Образование", description:"Высшее медицинское образование.", sortOrder:3, isVisible:true },
  ],
  methodItems: [
    { id:1, icon:"🧪", title:"Научный подход", description:"Доказательная медицина.", sortOrder:1, isVisible:true },
    { id:2, icon:"🥗", title:"Питание без голодания", description:"Сбалансированное детокс-меню.", sortOrder:2, isVisible:true },
  ],
  courseInfo: { title: "21-дневный детокс-курс", targetAudience: "Женщины 35+", whyDetoxText: "После 35 лет метаболизм замедляется...",
    conditionsText: "Доступ мгновенно после оплаты.", guaranteeText: "14 дней гарантия.", guaranteeDays: 14,
    priceStars: 1500, oldPriceStars: 2500, privateChatLink: "https://t.me/+abc" },
  courseDays: Array.from({ length: 7 }, (_, i) => ({
    id: i+1, dayNumber: i+1, title: `День ${i+1}`, shortDesc: "Описание дня",
    fullDesc: "Полное описание...", tasks: ["Задача 1", "Задача 2"],
    icon: ["🌅","💧","🥣","🧖","✨","🧘","📊"][i], weekNumber: 1, isVisible: true,
  })),
  courseResults: [
    { id:1, icon:"✨", metricValue:"93%", metricLabel:"улучшение кожи", description:"На 2-й неделе", sortOrder:1 },
    { id:2, icon:"⚖️", metricValue:"3–7 кг", metricLabel:"снижение веса", description:"Без голодания", sortOrder:2 },
  ],
  cases: [
    { id:1, clientName:"Марина", clientAge:38, resultText:"Минус 6 кг", reviewText:"За 21 день ушло 6 кг!", photoBefore:"", photoAfter:"", sortOrder:1, isVisible:true },
    { id:2, clientName:"Елена", clientAge:42, resultText:"Ушли отёки", reviewText:"Подруги спрашивают, что я сделала.", photoBefore:"", photoAfter:"", sortOrder:2, isVisible:true },
  ],
  quizQuestions: [
    { id:1, questionText:"Как часто вы чувствуете усталость?", options:[{text:"Каждый день",score:3},{text:"Часто",score:2},{text:"Иногда",score:1},{text:"Редко",score:0}], sortOrder:1 },
    { id:2, questionText:"Ухудшилось ли состояние кожи?", options:[{text:"Да, сильно",score:3},{text:"Немного",score:2},{text:"Не уверена",score:1},{text:"Нет",score:0}], sortOrder:2 },
  ],
  blocks: { hero: true, author: true, method: true, course: true, cases: true, quiz: true, final_cta: true },
  settings: { primaryColor: "#10b981", successColor: "#22c55e", bgLight: "#f8fafc", bgDark: "#0f172a",
    fontFamily: "Telegram Sans", borderRadius: "16", supportBot: "@support_bot", channelLink: "" },
};

/* ═══ STYLES ═══ */
const S = {
  label: { fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 6, display: "block", letterSpacing: "0.02em" },
  input: { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box", backgroundColor: "#fafbfc" },
  textarea: { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 15, fontFamily: "inherit", outline: "none", resize: "vertical", minHeight: 80, boxSizing: "border-box", backgroundColor: "#fafbfc", lineHeight: 1.5 },
  card: { background: "#fff", borderRadius: 14, padding: 20, marginBottom: 14, border: "1px solid rgba(0,0,0,0.04)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  deleteBtn: { padding: "6px 12px", borderRadius: 8, border: "1.5px solid #fca5a5", background: "rgba(239,68,68,0.05)", color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer", outline: "none" },
  addBtn: { width: "100%", height: 44, borderRadius: 12, border: "2px dashed #cbd5e1", background: "transparent", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, outline: "none" },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 },
};

/* ═══ TOGGLE ═══ */
function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      position: "relative", width: 48, height: 28, borderRadius: 14, cursor: "pointer",
      border: "none", outline: "none", padding: 0, flexShrink: 0,
      background: value ? "#10b981" : "#cbd5e1", transition: "background 0.2s",
    }}>
      <div style={{ position: "absolute", top: 3, left: value ? 23 : 3, width: 22, height: 22,
        borderRadius: 11, backgroundColor: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
    </button>
  );
}

/* ═══ COLOR PICKER ═══ */
function ColorPicker({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={S.label}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ position: "relative", width: 44, height: 44, borderRadius: 12, overflow: "hidden", border: "2px solid #e2e8f0", flexShrink: 0 }}>
          <input type="color" value={value} onChange={e => onChange(e.target.value)}
            style={{ position: "absolute", inset: -8, width: "calc(100% + 16px)", height: "calc(100% + 16px)", border: "none", cursor: "pointer", padding: 0 }} />
        </div>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} maxLength={7}
          style={{ ...S.input, width: 100, fontFamily: "monospace", fontSize: 14 }} />
        <div style={{ display: "flex", gap: 4 }}>
          {["#10b981","#22c55e","#3b82f6","#8b5cf6","#f59e0b","#ef4444"].map(c => (
            <button key={c} onClick={() => onChange(c)} style={{
              width: 22, height: 22, borderRadius: 6, backgroundColor: c, cursor: "pointer",
              border: value===c?"2px solid #0f172a":"2px solid transparent", outline: "none", padding: 0,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══ EMOJI FIELD ═══ */
function EmojiField({ label, value, onChange }) {
  const emojis = ["👋","📊","🎓","🔬","💚","🧪","🥗","💆","🏃","🧘","✨","⚡","🛡","🎉","🌿"];
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={S.label}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} maxLength={4}
          style={{ ...S.input, width: 60, textAlign: "center", fontSize: 22, padding: "6px 8px" }} />
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {emojis.map(e => (
            <button key={e} onClick={() => onChange(e)} style={{
              width: 30, height: 30, borderRadius: 8, cursor: "pointer", fontSize: 16, outline: "none",
              border: value===e?"2px solid #10b981":"1px solid #e2e8f0",
              background: value===e?"rgba(16,185,129,0.08)":"#fff",
              display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
            }}>{e}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══ PHOTO UPLOADER ═══ */
function PhotoUploader({ label, currentUrl }) {
  const has = currentUrl && currentUrl.length > 0;
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={S.label}>{label}</label>}
      <div style={{
        width: "100%", height: has ? 120 : 80, borderRadius: 12, border: "2px dashed #cbd5e1",
        background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ textAlign: "center", color: "#94a3b8" }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>📷</div>
          <div style={{ fontSize: 12, fontWeight: 500 }}>Нажмите для загрузки</div>
        </div>
      </div>
    </div>
  );
}

/* ═══ SAVE BUTTON ═══ */
function SaveBtn({ saving, onClick }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onClick} disabled={saving}
      style={{
        width: "100%", height: 48, borderRadius: 12, border: "none",
        background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff",
        fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center", gap: 8, outline: "none",
        boxShadow: "0 4px 16px rgba(16,185,129,0.3)", marginTop: 20, opacity: saving?0.7:1,
      }}>{saving ? "⏳ Сохраняю…" : "💾 Сохранить изменения"}</motion.button>
  );
}

/* ═══ TABS ═══ */
const TABS = [
  { key:"texts", icon:"📝", label:"Тексты" },
  { key:"photos", icon:"📸", label:"Фото" },
  { key:"author", icon:"👤", label:"Автор" },
  { key:"method", icon:"🔬", label:"Метод" },
  { key:"course", icon:"📚", label:"Курс" },
  { key:"cases", icon:"💼", label:"Кейсы" },
  { key:"quiz", icon:"🧩", label:"Квиз" },
  { key:"design", icon:"🎨", label:"Дизайн" },
  { key:"settings", icon:"⚙️", label:"Настр." },
];

/* ═══ TEXTS TAB ═══ */
function TextsTab({ data, saving, doSave }) {
  const [texts, setTexts] = useState(data.texts);
  const SECTIONS = [
    { key:"hero", label:"🏠 Главный экран", fields:["title","subtitle","badge","cta_primary"] },
    { key:"author", label:"👤 Об авторе", fields:["section_title","section_subtitle"] },
    { key:"method", label:"🔬 Метод", fields:["section_title","button_text"] },
    { key:"quiz", label:"🧩 Квиз", fields:["section_title","result_high","result_low"] },
  ];
  return (
    <div>
      <h3 style={S.sectionTitle}>📝 Редактирование текстов</h3>
      {SECTIONS.map(sec => (
        <div key={sec.key} style={S.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>{sec.label}</div>
          {sec.fields.map(field => (
            <div key={field} style={{ marginBottom: 12 }}>
              <label style={S.label}>{field.replace(/_/g," ").toUpperCase()}</label>
              {field.includes("subtitle")||field.includes("result") ? (
                <textarea style={S.textarea} value={texts[sec.key]?.[field]||""} rows={2}
                  onChange={e => setTexts(p => ({...p,[sec.key]:{...(p[sec.key]||{}),[field]:e.target.value}}))} />
              ) : (
                <input type="text" style={S.input} value={texts[sec.key]?.[field]||""}
                  onChange={e => setTexts(p => ({...p,[sec.key]:{...(p[sec.key]||{}),[field]:e.target.value}}))} />
              )}
            </div>
          ))}
        </div>
      ))}
      <SaveBtn saving={saving} onClick={() => doSave("texts")} />
    </div>
  );
}

/* ═══ AUTHOR TAB ═══ */
function AuthorTab({ data, saving, doSave }) {
  const [cards, setCards] = useState(data.authorCards);
  const update = (id, patch) => setCards(p => p.map(c => c.id===id?{...c,...patch}:c));
  const add = () => { const mx = cards.reduce((m,c)=>Math.max(m,c.id),0); setCards(p => [...p, {id:mx+1,icon:"✨",title:"",description:"",sortOrder:p.length+1,isVisible:true}]); };
  const remove = id => setCards(p => p.filter(c => c.id!==id));
  return (
    <div>
      <h3 style={S.sectionTitle}>👤 Карточки автора</h3>
      {cards.map((c,i) => (
        <div key={c.id} style={S.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <span style={{ fontSize:13, fontWeight:700, color:"#94a3b8" }}>#{i+1}</span>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <Toggle value={c.isVisible} onChange={v => update(c.id,{isVisible:v})} />
              <button style={S.deleteBtn} onClick={() => remove(c.id)}>Удалить</button>
            </div>
          </div>
          <EmojiField label="Иконка" value={c.icon} onChange={v => update(c.id,{icon:v})} />
          <div style={{ marginBottom:12 }}><label style={S.label}>Заголовок</label>
            <input type="text" style={S.input} value={c.title} onChange={e => update(c.id,{title:e.target.value})} /></div>
          <div><label style={S.label}>Описание</label>
            <textarea style={S.textarea} value={c.description} rows={2} onChange={e => update(c.id,{description:e.target.value})} /></div>
        </div>
      ))}
      <button style={S.addBtn} onClick={add}>＋ Добавить карточку</button>
      <SaveBtn saving={saving} onClick={() => doSave("author")} />
    </div>
  );
}

/* ═══ CASES TAB ═══ */
function CasesTab({ data, saving, doSave }) {
  const [cases, setCases] = useState(data.cases);
  const update = (id, patch) => setCases(p => p.map(c => c.id===id?{...c,...patch}:c));
  const add = () => { const mx = cases.reduce((m,c)=>Math.max(m,c.id),0); setCases(p => [...p, {id:mx+1,clientName:"",clientAge:null,resultText:"",reviewText:"",photoBefore:"",photoAfter:"",sortOrder:p.length+1,isVisible:true}]); };
  const remove = id => setCases(p => p.filter(c => c.id!==id));
  return (
    <div>
      <h3 style={S.sectionTitle}>💼 Кейсы клиенток</h3>
      {cases.map((cs,i) => (
        <div key={cs.id} style={S.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <span style={{ fontSize:14, fontWeight:700 }}>Кейс #{i+1}</span>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <Toggle value={cs.isVisible} onChange={v => update(cs.id,{isVisible:v})} />
              <button style={S.deleteBtn} onClick={() => remove(cs.id)}>Удалить</button>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 80px", gap:10, marginBottom:12 }}>
            <div><label style={S.label}>Имя</label><input type="text" style={S.input} value={cs.clientName} onChange={e => update(cs.id,{clientName:e.target.value})} /></div>
            <div><label style={S.label}>Возраст</label><input type="number" style={S.input} value={cs.clientAge||""} onChange={e => update(cs.id,{clientAge:+e.target.value||null})} /></div>
          </div>
          <div style={{ marginBottom:12 }}><label style={S.label}>Результат</label>
            <input type="text" style={S.input} value={cs.resultText} onChange={e => update(cs.id,{resultText:e.target.value})} placeholder="Минус 6 кг, чистая кожа" /></div>
          <div style={{ marginBottom:12 }}><label style={S.label}>Отзыв</label>
            <textarea style={S.textarea} value={cs.reviewText} rows={3} onChange={e => update(cs.id,{reviewText:e.target.value})} /></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <PhotoUploader label="Фото ДО" currentUrl={cs.photoBefore} />
            <PhotoUploader label="Фото ПОСЛЕ" currentUrl={cs.photoAfter} />
          </div>
        </div>
      ))}
      <button style={S.addBtn} onClick={add}>＋ Добавить кейс</button>
      <SaveBtn saving={saving} onClick={() => doSave("cases")} />
    </div>
  );
}

/* ═══ QUIZ TAB ═══ */
function QuizTab({ data, saving, doSave }) {
  const [qs, setQs] = useState(data.quizQuestions);
  const updateQ = (id, patch) => setQs(p => p.map(q => q.id===id?{...q,...patch}:q));
  const updateOpt = (qId, oIdx, patch) => setQs(p => p.map(q => q.id===qId?{...q,options:q.options.map((o,i)=>i===oIdx?{...o,...patch}:o)}:q));
  const addOpt = qId => setQs(p => p.map(q => q.id===qId?{...q,options:[...q.options,{text:"",score:0}]}:q));
  const rmOpt = (qId, oIdx) => setQs(p => p.map(q => q.id===qId?{...q,options:q.options.filter((_,i)=>i!==oIdx)}:q));
  const addQ = () => { const mx = qs.reduce((m,q)=>Math.max(m,q.id),0); setQs(p => [...p, {id:mx+1,questionText:"",options:[{text:"",score:3},{text:"",score:2},{text:"",score:1},{text:"",score:0}],sortOrder:p.length+1}]); };
  const rmQ = id => setQs(p => p.filter(q => q.id!==id));
  const labels = ["A","B","C","D","E"];
  return (
    <div>
      <h3 style={S.sectionTitle}>🧩 Вопросы квиза</h3>
      {qs.map((q,qi) => (
        <div key={q.id} style={S.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <span style={{ fontSize:14, fontWeight:700 }}>Вопрос {qi+1}</span>
            <button style={S.deleteBtn} onClick={() => rmQ(q.id)}>Удалить</button>
          </div>
          <div style={{ marginBottom:14 }}><label style={S.label}>Текст вопроса</label>
            <textarea style={S.textarea} value={q.questionText} rows={2} onChange={e => updateQ(q.id,{questionText:e.target.value})} /></div>
          <label style={S.label}>Варианты ответов</label>
          {q.options.map((opt,oi) => (
            <div key={oi} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8, padding:"8px 10px", borderRadius:10, backgroundColor:"#f8fafc", border:"1px solid #f1f5f9" }}>
              <span style={{ fontSize:13, fontWeight:700, color:"#94a3b8", width:20, textAlign:"center", flexShrink:0 }}>{labels[oi]||oi+1}</span>
              <input type="text" placeholder="Текст" style={{...S.input,flex:1,border:"1px solid #e2e8f0"}} value={opt.text} onChange={e => updateOpt(q.id,oi,{text:e.target.value})} />
              <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                <label style={{ fontSize:11, color:"#94a3b8", fontWeight:600 }}>Балл</label>
                <input type="number" min={0} max={5} style={{...S.input,width:48,padding:"6px 8px",textAlign:"center",fontSize:14}} value={opt.score} onChange={e => updateOpt(q.id,oi,{score:+e.target.value})} />
              </div>
              {q.options.length > 2 && (
                <button onClick={() => rmOpt(q.id,oi)} style={{
                  width:28, height:28, borderRadius:8, border:"1px solid #fca5a5", background:"#fff",
                  color:"#ef4444", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center",
                  justifyContent:"center", flexShrink:0, outline:"none", padding:0,
                }}>✕</button>
              )}
            </div>
          ))}
          {q.options.length < 5 && <button onClick={() => addOpt(q.id)} style={{...S.addBtn,height:36,border:"1.5px dashed #cbd5e1",fontSize:12}}>＋ Вариант</button>}
        </div>
      ))}
      <button style={S.addBtn} onClick={addQ}>＋ Добавить вопрос</button>
      <SaveBtn saving={saving} onClick={() => doSave("quiz")} />
    </div>
  );
}

/* ═══ DESIGN TAB ═══ */
function DesignTab({ data, saving, doSave }) {
  const [t, setT] = useState({ primary: data.settings.primaryColor||"#10b981", success: data.settings.successColor||"#22c55e",
    bgLight: data.settings.bgLight||"#f8fafc", bgDark: data.settings.bgDark||"#0f172a", radius: +(data.settings.borderRadius||16) });
  return (
    <div>
      <h3 style={S.sectionTitle}>🎨 Дизайн-система</h3>
      <div style={S.card}>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>Цветовая палитра</div>
        <ColorPicker label="Primary" value={t.primary} onChange={v => setT(p => ({...p,primary:v}))} />
        <ColorPicker label="Success" value={t.success} onChange={v => setT(p => ({...p,success:v}))} />
        <ColorPicker label="Фон (светлый)" value={t.bgLight} onChange={v => setT(p => ({...p,bgLight:v}))} />
        <ColorPicker label="Фон (тёмный)" value={t.bgDark} onChange={v => setT(p => ({...p,bgDark:v}))} />
      </div>
      <div style={S.card}>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>Border Radius</div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <input type="range" min={4} max={24} value={t.radius} onChange={e => setT(p => ({...p,radius:+e.target.value}))} style={{ flex:1 }} />
          <span style={{ fontSize:14, fontWeight:600, width:40 }}>{t.radius}px</span>
        </div>
        <div style={{ fontSize:13, fontWeight:600, color:"#64748b", margin:"16px 0 8px" }}>Превью</div>
        <div style={{ padding:20, borderRadius:t.radius, background:`linear-gradient(135deg,${t.primary},${t.success})`,
          color:"#fff", textAlign:"center" }}>
          <div style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>Preview Button</div>
          <div style={{ fontSize:13, opacity:0.7 }}>border-radius: {t.radius}px</div>
        </div>
      </div>
      <SaveBtn saving={saving} onClick={() => doSave("design")} />
    </div>
  );
}

/* ═══ SETTINGS TAB ═══ */
function SettingsTab({ data, saving, doSave }) {
  const [blocks, setBlocks] = useState(data.blocks);
  const [pricing, setPricing] = useState({ price: data.courseInfo.priceStars, old: data.courseInfo.oldPriceStars||0 });
  const [links, setLinks] = useState({ chat: data.courseInfo.privateChatLink, support: data.settings.supportBot||"", channel: data.settings.channelLink||"" });
  const BL = { hero:"🏠 Главный экран", author:"👤 Об авторе", method:"🔬 Метод", course:"📚 Курс", cases:"💼 Кейсы", quiz:"🧩 Квиз", final_cta:"🎯 Финальный CTA" };
  return (
    <div>
      <h3 style={S.sectionTitle}>⚙️ Настройки</h3>
      <div style={S.card}>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Видимость секций</div>
        <div style={{ fontSize:12, color:"#94a3b8", marginBottom:16 }}>Скрытые секции не отображаются</div>
        {Object.entries(BL).map(([k,v]) => (
          <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid #f1f5f9" }}>
            <span style={{ fontSize:14, fontWeight:500, color:"#334155" }}>{v}</span>
            <Toggle value={blocks[k]!==false} onChange={val => setBlocks(p => ({...p,[k]:val}))} />
          </div>
        ))}
      </div>
      <div style={S.card}>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>💰 Цена</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <div><label style={S.label}>Stars ⭐</label><input type="number" style={S.input} value={pricing.price} onChange={e => setPricing(p=>({...p,price:+e.target.value}))} /></div>
          <div><label style={S.label}>Старая цена</label><input type="number" style={S.input} value={pricing.old} onChange={e => setPricing(p=>({...p,old:+e.target.value}))} /></div>
        </div>
        {pricing.old > pricing.price && (
          <div style={{ marginTop:10, padding:"6px 12px", borderRadius:8, backgroundColor:"rgba(34,197,94,0.08)",
            fontSize:13, fontWeight:600, color:"#059669", display:"inline-block" }}>
            Выгода: {pricing.old - pricing.price} Stars ({Math.round((1-pricing.price/pricing.old)*100)}%)
          </div>
        )}
      </div>
      <div style={S.card}>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>🔗 Ссылки</div>
        {[["chat","Закрытый чат","https://t.me/+..."],["support","Бот поддержки","@bot"],["channel","Канал","https://t.me/ch"]].map(([k,l,ph]) => (
          <div key={k} style={{ marginBottom:12 }}><label style={S.label}>{l}</label>
            <input type="text" style={S.input} placeholder={ph} value={links[k]} onChange={e => setLinks(p=>({...p,[k]:e.target.value}))} /></div>
        ))}
      </div>
      <SaveBtn saving={saving} onClick={() => doSave("settings")} />
    </div>
  );
}

/* ═══ SIMPLE TABS (photos, method, course) ═══ */
function PhotosTab({ saving, doSave }) {
  return (
    <div>
      <h3 style={S.sectionTitle}>📸 Фото</h3>
      {[["hero_bg","Фон главного экрана","1080×1920"],["author_avatar","Фото автора","600×600"],["og_image","OG-картинка","1200×630"]].map(([k,l,d]) => (
        <div key={k} style={S.card}>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>{l}</div>
          <div style={{ fontSize:12, color:"#94a3b8", marginBottom:12 }}>{d}</div>
          <PhotoUploader label="" currentUrl="" />
          <label style={S.label}>Alt-текст</label>
          <input type="text" style={S.input} defaultValue="" />
        </div>
      ))}
      <SaveBtn saving={saving} onClick={() => doSave("photos")} />
    </div>
  );
}

function MethodTab({ data, saving, doSave }) {
  const [items, setItems] = useState(data.methodItems);
  const update = (id, patch) => setItems(p => p.map(m => m.id===id?{...m,...patch}:m));
  const add = () => { const mx = items.reduce((m,i)=>Math.max(m,i.id),0); setItems(p => [...p, {id:mx+1,icon:"🧪",title:"",description:"",sortOrder:p.length+1,isVisible:true}]); };
  const remove = id => setItems(p => p.filter(m => m.id!==id));
  return (
    <div>
      <h3 style={S.sectionTitle}>🔬 Пункты метода</h3>
      {items.map((item,i) => (
        <div key={item.id} style={S.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <span style={{ fontSize:13, fontWeight:700, color:"#94a3b8" }}>Шаг {i+1}</span>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <Toggle value={item.isVisible} onChange={v => update(item.id,{isVisible:v})} />
              <button style={S.deleteBtn} onClick={() => remove(item.id)}>Удалить</button>
            </div>
          </div>
          <EmojiField label="Иконка" value={item.icon} onChange={v => update(item.id,{icon:v})} />
          <div style={{ marginBottom:12 }}><label style={S.label}>Заголовок</label>
            <input type="text" style={S.input} value={item.title} onChange={e => update(item.id,{title:e.target.value})} /></div>
          <div><label style={S.label}>Описание</label>
            <textarea style={S.textarea} value={item.description} rows={2} onChange={e => update(item.id,{description:e.target.value})} /></div>
        </div>
      ))}
      <button style={S.addBtn} onClick={add}>＋ Добавить пункт</button>
      <SaveBtn saving={saving} onClick={() => doSave("method")} />
    </div>
  );
}

function CourseTab({ data, saving, doSave }) {
  const [info, setInfo] = useState(data.courseInfo);
  return (
    <div>
      <h3 style={S.sectionTitle}>📚 Курс</h3>
      <div style={S.card}>
        {[["title","Название",false],["targetAudience","ЦА",false],["whyDetoxText","Почему детокс?",true],["conditionsText","Условия",true],["guaranteeText","Гарантия",true]].map(([k,l,multi]) => (
          <div key={k} style={{ marginBottom:14 }}><label style={S.label}>{l}</label>
            {multi ? <textarea style={S.textarea} value={info[k]||""} rows={2} onChange={e => setInfo(p=>({...p,[k]:e.target.value}))} />
              : <input type="text" style={S.input} value={info[k]||""} onChange={e => setInfo(p=>({...p,[k]:e.target.value}))} />}
          </div>
        ))}
      </div>
      <SaveBtn saving={saving} onClick={() => doSave("course")} />
    </div>
  );
}

/* ═══ MAIN ADMIN PANEL ═══ */
export default function AdminPanel() {
  const [tab, setTab] = useState("texts");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const scrollRef = useRef(null);

  const doSave = async (section) => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setToast("✅ Сохранено!");
    setTimeout(() => setToast(""), 2000);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const btn = el.querySelector(`[data-tab="${tab}"]`);
    if (btn) btn.scrollIntoView({ behavior:"smooth", block:"nearest", inline:"center" });
  }, [tab]);

  return (
    <div style={{ width:"100%", minHeight:"100vh", background:"#f1f5f9", fontFamily:"-apple-system,BlinkMacSystemFont,sans-serif", WebkitFontSmoothing:"antialiased" }}>
      {/* Header */}
      <div style={{ position:"sticky", top:0, zIndex:50, background:"#0f172a", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"16px 16px 0" }}>
        <div style={{ fontSize:18, fontWeight:700, color:"#fff", margin:"0 0 14px", display:"flex", alignItems:"center", gap:8 }}>
          <span>🌿</span><span>Админ-панель</span>
        </div>
        <div ref={scrollRef} style={{ display:"flex", gap:4, overflowX:"auto", scrollbarWidth:"none", paddingBottom:0, WebkitOverflowScrolling:"touch" }}>
          <style>{`div::-webkit-scrollbar{display:none}`}</style>
          {TABS.map(t => {
            const active = tab===t.key;
            return (
              <button key={t.key} data-tab={t.key} onClick={() => setTab(t.key)}
                style={{
                  padding:"8px 14px 12px", borderRadius:"10px 10px 0 0", border:"none",
                  background: active?"#f1f5f9":"transparent", cursor:"pointer", outline:"none",
                  display:"flex", alignItems:"center", gap:4, whiteSpace:"nowrap",
                  WebkitTapHighlightColor:"transparent",
                }}>
                <span style={{ fontSize:14 }}>{t.icon}</span>
                <span style={{ fontSize:12, fontWeight: active?700:500, color: active?"#0f172a":"rgba(255,255,255,0.5)" }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:"20px 16px 100px", maxWidth:520, margin:"0 auto" }}>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.2 }}>
            {tab==="texts" && <TextsTab data={MOCK} saving={saving} doSave={doSave} />}
            {tab==="photos" && <PhotosTab saving={saving} doSave={doSave} />}
            {tab==="author" && <AuthorTab data={MOCK} saving={saving} doSave={doSave} />}
            {tab==="method" && <MethodTab data={MOCK} saving={saving} doSave={doSave} />}
            {tab==="course" && <CourseTab data={MOCK} saving={saving} doSave={doSave} />}
            {tab==="cases" && <CasesTab data={MOCK} saving={saving} doSave={doSave} />}
            {tab==="quiz" && <QuizTab data={MOCK} saving={saving} doSave={doSave} />}
            {tab==="design" && <DesignTab data={MOCK} saving={saving} doSave={doSave} />}
            {tab==="settings" && <SettingsTab data={MOCK} saving={saving} doSave={doSave} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
            style={{ position:"fixed", bottom:32, left:"50%", transform:"translateX(-50%)", zIndex:100,
              padding:"10px 24px", borderRadius:12, background:"#0f172a", color:"#fff",
              fontSize:14, fontWeight:600, boxShadow:"0 8px 32px rgba(0,0,0,0.3)" }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
