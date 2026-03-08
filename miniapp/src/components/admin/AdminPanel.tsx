/* ============================================================
 * 🌿 AdminPanel — Полная админ-панель Mini App
 * ============================================================
 *
 * 9 вкладок:
 *   1. 📝 Тексты — редактирование всех текстовых полей
 *   2. 📸 Фото — загрузка / управление фотографиями
 *   3. 👤 Автор — CRUD карточек автора
 *   4. 🔬 Метод — CRUD пунктов метода
 *   5. 📚 Курс — инфо, дни, результаты
 *   6. 💼 Кейсы — CRUD кейсов (до/после)
 *   7. 🧩 Квиз — CRUD вопросов / вариантов
 *   8. 🎨 Дизайн — color picker, токены
 *   9. ⚙️ Настройки — видимость блоков, цена, ссылки
 *
 * ============================================================ */

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";

import { useTelegram } from "../../hooks/useTelegram";
import type {
  TextsMap,
  Photo,
  AuthorCard,
  MethodItem,
  CourseInfo,
  CourseDay,
  CourseResult,
  CaseStudy,
  QuizQuestion,
  QuizOption,
  BlockVisibility,
  DesignTokens,
  LandingContent,
} from "../../types";
import { DEFAULT_TOKENS } from "../../types";

/* ════════════════════════════════════════════════════════════
 * TYPES
 * ════════════════════════════════════════════════════════════ */

type TabKey =
  | "texts"
  | "photos"
  | "author"
  | "method"
  | "course"
  | "cases"
  | "quiz"
  | "design"
  | "settings";

interface Tab {
  key: TabKey;
  icon: string;
  label: string;
}

interface AdminPanelProps {
  /** Полные данные лендинга (загружаются из API) */
  data: LandingContent;
  /** Callback: сохранение изменений */
  onSave: (section: string, payload: unknown) => Promise<void>;
  /** Callback: загрузка файла */
  onUpload?: (slot: string, file: File) => Promise<string>;
}

/* ════════════════════════════════════════════════════════════
 * TABS CONFIG
 * ════════════════════════════════════════════════════════════ */

const TABS: Tab[] = [
  { key: "texts", icon: "📝", label: "Тексты" },
  { key: "photos", icon: "📸", label: "Фото" },
  { key: "author", icon: "👤", label: "Автор" },
  { key: "method", icon: "🔬", label: "Метод" },
  { key: "course", icon: "📚", label: "Курс" },
  { key: "cases", icon: "💼", label: "Кейсы" },
  { key: "quiz", icon: "🧩", label: "Квиз" },
  { key: "design", icon: "🎨", label: "Дизайн" },
  { key: "settings", icon: "⚙️", label: "Настройки" },
];

/* ════════════════════════════════════════════════════════════
 * SHARED STYLES
 * ════════════════════════════════════════════════════════════ */

const S = {
  page: {
    width: "100%",
    minHeight: "100vh",
    background: "#f1f5f9",
    fontFamily: "'Telegram Sans', -apple-system, sans-serif",
    WebkitFontSmoothing: "antialiased" as const,
  },
  header: {
    position: "sticky" as const,
    top: 0,
    zIndex: 50,
    background: "#0f172a",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    padding: "16px 16px 0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 700 as const,
    color: "#ffffff",
    margin: "0 0 14px",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  tabStrip: {
    display: "flex",
    gap: 4,
    overflowX: "auto" as const,
    scrollbarWidth: "none" as const,
    paddingBottom: 0,
    WebkitOverflowScrolling: "touch" as const,
  },
  content: {
    padding: "20px 16px 100px",
    maxWidth: 520,
    margin: "0 auto",
  },
  card: {
    background: "#ffffff",
    borderRadius: 14,
    padding: 20,
    marginBottom: 14,
    border: "1px solid rgba(0,0,0,0.04)",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  label: {
    fontSize: 13,
    fontWeight: 600 as const,
    color: "#64748b",
    marginBottom: 6,
    display: "block" as const,
    letterSpacing: "0.02em",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    fontSize: 15,
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.2s ease",
    boxSizing: "border-box" as const,
    backgroundColor: "#fafbfc",
  },
  textarea: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    fontSize: 15,
    fontFamily: "inherit",
    outline: "none",
    resize: "vertical" as const,
    minHeight: 80,
    boxSizing: "border-box" as const,
    backgroundColor: "#fafbfc",
    lineHeight: 1.5,
  },
  saveBtn: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 600 as const,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: "0 4px 16px rgba(16,185,129,0.3)",
    outline: "none",
  },
  deleteBtn: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "1.5px solid #fca5a5",
    background: "rgba(239,68,68,0.05)",
    color: "#ef4444",
    fontSize: 13,
    fontWeight: 600 as const,
    cursor: "pointer",
    outline: "none",
  },
  addBtn: {
    width: "100%",
    height: 44,
    borderRadius: 12,
    border: "2px dashed #cbd5e1",
    background: "transparent",
    color: "#64748b",
    fontSize: 14,
    fontWeight: 600 as const,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    outline: "none",
    transition: "border-color 0.2s, color 0.2s",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700 as const,
    color: "#0f172a",
    margin: "0 0 14px",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  toggle: {
    position: "relative" as const,
    width: 48,
    height: 28,
    borderRadius: 14,
    cursor: "pointer",
    transition: "background 0.2s ease",
    border: "none",
    outline: "none",
    padding: 0,
    flexShrink: 0,
  },
  toggleDot: {
    position: "absolute" as const,
    top: 3,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#ffffff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
    transition: "left 0.2s ease",
  },
} as const;

/* ════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ════════════════════════════════════════════════════════════ */

export default function AdminPanel({ data, onSave, onUpload }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("texts");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const { haptic } = useTelegram();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const save = async (section: string, payload: unknown) => {
    setSaving(true);
    try {
      await onSave(section, payload);
      haptic.success();
      showToast("✅ Сохранено");
    } catch {
      haptic.error();
      showToast("❌ Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={S.page}>
      {/* ══ HEADER ══ */}
      <div style={S.header}>
        <div style={S.headerTitle}>
          <span>🌿</span>
          <span>Админ-панель</span>
        </div>
        <TabStrip active={activeTab} onSelect={(t) => { setActiveTab(t); haptic.selection(); }} />
      </div>

      {/* ══ CONTENT ══ */}
      <div style={S.content}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "texts" && <TextsTab texts={data.texts} onSave={save} saving={saving} />}
            {activeTab === "photos" && <PhotosTab photos={data.photos} onSave={save} onUpload={onUpload} saving={saving} />}
            {activeTab === "author" && <AuthorTab cards={data.authorCards} onSave={save} saving={saving} />}
            {activeTab === "method" && <MethodTab items={data.methodItems} onSave={save} saving={saving} />}
            {activeTab === "course" && <CourseTab info={data.courseInfo} days={data.courseDays} results={data.courseResults} onSave={save} saving={saving} />}
            {activeTab === "cases" && <CasesTab cases={data.cases} onSave={save} onUpload={onUpload} saving={saving} />}
            {activeTab === "quiz" && <QuizTab questions={data.quizQuestions} onSave={save} saving={saving} />}
            {activeTab === "design" && <DesignTab settings={data.settings} onSave={save} saving={saving} />}
            {activeTab === "settings" && <SettingsTab blocks={data.blocks} settings={data.settings} courseInfo={data.courseInfo} onSave={save} saving={saving} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ══ TOAST ══ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: "fixed",
              bottom: 32,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 100,
              padding: "10px 24px",
              borderRadius: 12,
              background: "#0f172a",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 * TAB STRIP
 * ════════════════════════════════════════════════════════════ */

function TabStrip({ active, onSelect }: { active: TabKey; onSelect: (t: TabKey) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const btn = el.querySelector(`[data-tab="${active}"]`) as HTMLElement;
    if (btn) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active]);

  return (
    <div ref={scrollRef} style={S.tabStrip}>
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            data-tab={tab.key}
            onClick={() => onSelect(tab.key)}
            style={{
              padding: "8px 14px 12px",
              borderRadius: "10px 10px 0 0",
              border: "none",
              background: isActive ? "#f1f5f9" : "transparent",
              cursor: "pointer",
              outline: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
              whiteSpace: "nowrap",
              transition: "background 0.2s",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span style={{ fontSize: 14 }}>{tab.icon}</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "#0f172a" : "rgba(255,255,255,0.5)",
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 * REUSABLE: Toggle Switch
 * ════════════════════════════════════════════════════════════ */

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        ...S.toggle,
        background: value ? "#10b981" : "#cbd5e1",
      }}
    >
      <div style={{ ...S.toggleDot, left: value ? 23 : 3 }} />
    </button>
  );
}

/* ════════════════════════════════════════════════════════════
 * REUSABLE: Color Picker
 * ════════════════════════════════════════════════════════════ */

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={S.label}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            position: "relative",
            width: 44,
            height: 44,
            borderRadius: 12,
            overflow: "hidden",
            border: "2px solid #e2e8f0",
            flexShrink: 0,
          }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              position: "absolute",
              inset: -8,
              width: "calc(100% + 16px)",
              height: "calc(100% + 16px)",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={7}
          style={{ ...S.input, width: 100, fontFamily: "monospace", fontSize: 14 }}
        />
        {/* Preset swatches */}
        <div style={{ display: "flex", gap: 4 }}>
          {["#10b981", "#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"].map((c) => (
            <button
              key={c}
              onClick={() => onChange(c)}
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                backgroundColor: c,
                border: value === c ? "2px solid #0f172a" : "2px solid transparent",
                cursor: "pointer",
                outline: "none",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 * REUSABLE: Emoji Picker (simple)
 * ════════════════════════════════════════════════════════════ */

function EmojiField({
  label,
  value,
  onChange,
  presets = [],
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  presets?: string[];
}) {
  const defaults = presets.length
    ? presets
    : ["👋", "📊", "🎓", "🔬", "💚", "🧪", "🥗", "💆", "🏃", "🧘", "✨", "⚡", "🛡", "🎉", "🌿"];
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={S.label}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={4}
          style={{ ...S.input, width: 60, textAlign: "center", fontSize: 22, padding: "6px 8px" }}
        />
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {defaults.map((e) => (
            <button
              key={e}
              onClick={() => onChange(e)}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                border: value === e ? "2px solid #10b981" : "1px solid #e2e8f0",
                background: value === e ? "rgba(16,185,129,0.08)" : "#fff",
                cursor: "pointer",
                fontSize: 16,
                outline: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 * REUSABLE: Photo Uploader
 * ════════════════════════════════════════════════════════════ */

function PhotoUploader({
  label,
  currentUrl,
  onUpload,
}: {
  label: string;
  currentUrl?: string;
  onUpload?: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const has = currentUrl && !currentUrl.includes("placeholder") && currentUrl.length > 0;

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={S.label}>{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          width: "100%",
          height: has ? 120 : 80,
          borderRadius: 12,
          border: "2px dashed #cbd5e1",
          background: has ? "none" : "#f8fafc",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          transition: "border-color 0.2s",
        }}
      >
        {has ? (
          <img
            src={currentUrl}
            alt={label}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>📷</div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>Нажмите для загрузки</div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload?.(f);
          }}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 * REUSABLE: Save Button
 * ════════════════════════════════════════════════════════════ */

function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={saving}
      style={{
        ...S.saveBtn,
        opacity: saving ? 0.7 : 1,
        marginTop: 20,
      }}
    >
      {saving ? "⏳ Сохраняю…" : "💾 Сохранить изменения"}
    </motion.button>
  );
}

/* ════════════════════════════════════════════════════════════
 * TAB 1: TEXTS
 * ════════════════════════════════════════════════════════════ */

function TextsTab({
  texts: initial,
  onSave,
  saving,
}: {
  texts: TextsMap;
  onSave: (s: string, p: unknown) => Promise<void>;
  saving: boolean;
}) {
  const [texts, setTexts] = useState<TextsMap>(initial);

  const SECTIONS = [
    { key: "hero", label: "🏠 Главный экран", fields: ["title", "subtitle", "badge", "cta_primary", "cta_secondary"] },
    { key: "author", label: "👤 Об авторе", fields: ["section_title", "section_subtitle"] },
    { key: "method", label: "🔬 Метод", fields: ["section_title", "section_subtitle", "badge", "button_text"] },
    { key: "course", label: "📚 Курс", fields: ["badge", "why_detox_title"] },
    { key: "cases", label: "💼 Кейсы", fields: ["section_title", "section_subtitle", "badge"] },
    { key: "quiz", label: "🧩 Квиз", fields: ["section_title", "badge", "result_high", "result_medium", "result_low", "result_button"] },
    { key: "final_cta", label: "🎯 Финальный CTA", fields: ["title", "subtitle", "button_text"] },
  ];

  const update = (section: string, field: string, value: string) => {
    setTexts((prev) => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [field]: value },
    }));
  };

  return (
    <div>
      <h3 style={S.sectionTitle}>📝 Редактирование текстов</h3>
      {SECTIONS.map((sec) => (
        <div key={sec.key} style={S.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>
            {sec.label}
          </div>
          {sec.fields.map((field) => (
            <div key={field} style={{ marginBottom: 12 }}>
              <label style={S.label}>{field.replace(/_/g, " ").toUpperCase()}</label>
              {field.includes("subtitle") || field.includes("text") || field.includes("result") ? (
                <textarea
                  style={S.textarea}
                  value={texts[sec.key]?.[field] || ""}
                  onChange={(e) => update(sec.key, field, e.target.value)}
                  rows={3}
                />
              ) : (
                <input
                  type="text"
                  style={S.input}
                  value={texts[sec.key]?.[field] || ""}
                  onChange={(e) => update(sec.key, field, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      ))}
      <SaveButton saving={saving} onClick={() => onSave("texts", texts)} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 * TAB 2: PHOTOS
 * ════════════════════════════════════════════════════════════ */

function PhotosTab({
  photos: initial,
  onSave,
  onUpload,
  saving,
}: {
  photos: Record<string, Photo>;
  onSave: (s: string, p: unknown) => Promise<void>;
  onUpload?: (slot: string, file: File) => Promise<string>;
  saving: boolean;
}) {
  const [photos, setPhotos] = useState(initial);

  const SLOTS = [
    { key: "hero_bg", label: "Фон главного экрана", desc: "1080×1920, портрет" },
    { key: "author_avatar", label: "Фото автора (круглое)", desc: "600×600, квадрат" },
    { key: "og_image", label: "OG-картинка", desc: "1200×630" },
  ];

  const handleUpload = async (slot: string, file: File) => {
    if (!onUpload) return;
    const url = await onUpload(slot, file);
    setPhotos((prev) => ({
      ...prev,
      [slot]: { slot, filePath: url, altText: slot, width: 0, height: 0 },
    }));
  };

  return (
    <div>
      <h3 style={S.sectionTitle}>📸 Управление фото</h3>
      {SLOTS.map((slot) => (
        <div key={slot.key} style={S.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
            {slot.label}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>{slot.desc}</div>
          <PhotoUploader
            label=""
            currentUrl={photos[slot.key]?.filePath}
            onUpload={(f) => handleUpload(slot.key, f)}
          />
          <div style={{ marginTop: 8 }}>
            <label style={S.label}>Alt-текст</label>
            <input
              type="text"
              style={S.input}
              value={photos[slot.key]?.altText || ""}
              onChange={(e) =>
                setPhotos((prev) => ({
                  ...prev,
                  [slot.key]: { ...(prev[slot.key] || { slot: slot.key, filePath: "", width: 0, height: 0 }), altText: e.target.value },
                }))
              }
            />
          </div>
        </div>
      ))}
      <SaveButton saving={saving} onClick={() => onSave("photos", photos)} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 * TAB 3: AUTHOR CARDS (CRUD)
 * ════════════════════════════════════════════════════════════ */

function AuthorTab({
  cards: initial,
  onSave,
  saving,
}: {
  cards: AuthorCard[];
  onSave: (s: string, p: unknown) => Promise<void>;
  saving: boolean;
}) {
  const [cards, setCards] = useState(initial.sort((a, b) => a.sortOrder - b.sortOrder));

  const update = (id: number, patch: Partial<AuthorCard>) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const add = () => {
    const maxId = cards.reduce((m, c) => Math.max(m, c.id), 0);
    setCards((prev) => [
      ...prev,
      { id: maxId + 1, icon: "✨", title: "", description: "", sortOrder: prev.length + 1, isVisible: true },
    ]);
  };

  const remove = (id: number) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div>
      <h3 style={S.sectionTitle}>👤 Карточки автора</h3>
      {cards.map((card, idx) => (
        <div key={card.id} style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8" }}>#{idx + 1}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Toggle value={card.isVisible} onChange={(v) => update(card.id, { isVisible: v })} />
              <button style={S.deleteBtn} onClick={() => remove(card.id)}>Удалить</button>
            </div>
          </div>
          <EmojiField label="Иконка" value={card.icon} onChange={(v) => update(card.id, { icon: v })} />
          <div style={{ marginBottom: 12 }}>
            <label style={S.label}>Заголовок</label>
            <input type="text" style={S.input} value={card.title} onChange={(e) => update(card.id, { title: e.target.value })} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={S.label}>Описание</label>
            <textarea style={S.textarea} value={card.description} onChange={(e) => update(card.id, { description: e.target.value })} rows={3} />
          </div>
          <div>
            <label style={S.label}>Порядок сортировки</label>
            <input type="number" style={{ ...S.input, width: 80 }} value={card.sortOrder} onChange={(e) => update(card.id, { sortOrder: +e.target.value })} />
          </div>
        </div>
      ))}
      <button style={S.addBtn} onClick={add}>＋ Добавить карточку</button>
      <SaveButton saving={saving} onClick={() => onSave("author_cards", cards)} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 * TAB 4: METHOD ITEMS (CRUD)
 * ════════════════════════════════════════════════════════════ */

function MethodTab({
  items: initial,
  onSave,
  saving,
}: {
  items: MethodItem[];
  onSave: (s: string, p: unknown) => Promise<void>;
  saving: boolean;
}) {
  const [items, setItems] = useState(initial.sort((a, b) => a.sortOrder - b.sortOrder));

  const update = (id: number, patch: Partial<MethodItem>) => {
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const add = () => {
    const maxId = items.reduce((m, i) => Math.max(m, i.id), 0);
    setItems((prev) => [
      ...prev,
      { id: maxId + 1, icon: "🧪", title: "", description: "", sortOrder: prev.length + 1, isVisible: true },
    ]);
  };

  const remove = (id: number) => {
    setItems((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div>
      <h3 style={S.sectionTitle}>🔬 Пункты метода</h3>
      {items.map((item, idx) => (
        <div key={item.id} style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8" }}>Шаг {idx + 1}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Toggle value={item.isVisible} onChange={(v) => update(item.id, { isVisible: v })} />
              <button style={S.deleteBtn} onClick={() => remove(item.id)}>Удалить</button>
            </div>
          </div>
          <EmojiField label="Иконка" value={item.icon} onChange={(v) => update(item.id, { icon: v })} />
          <div style={{ marginBottom: 12 }}>
            <label style={S.label}>Заголовок</label>
            <input type="text" style={S.input} value={item.title} onChange={(e) => update(item.id, { title: e.target.value })} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={S.label}>Описание</label>
            <textarea style={S.textarea} value={item.description} onChange={(e) => update(item.id, { description: e.target.value })} rows={3} />
          </div>
          <div>
            <label style={S.label}>Порядок</label>
            <input type="number" style={{ ...S.input, width: 80 }} value={item.sortOrder} onChange={(e) => update(item.id, { sortOrder: +e.target.value })} />
          </div>
        </div>
      ))}
      <button style={S.addBtn} onClick={add}>＋ Добавить пункт</button>
      <SaveButton saving={saving} onClick={() => onSave("method_items", items)} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 * TAB 5: COURSE (Info + Days + Results)
 * ════════════════════════════════════════════════════════════ */

function CourseTab({
  info: initialInfo,
  days: initialDays,
  results: initialResults,
  onSave,
  saving,
}: {
  info: CourseInfo;
  days: CourseDay[];
  results: CourseResult[];
  onSave: (s: string, p: unknown) => Promise<void>;
  saving: boolean;
}) {
  const [info, setInfo] = useState(initialInfo);
  const [days, setDays] = useState(initialDays.sort((a, b) => a.dayNumber - b.dayNumber));
  const [results, setResults] = useState(initialResults.sort((a, b) => a.sortOrder - b.sortOrder));
  const [subTab, setSubTab] = useState<"info" | "days" | "results">("info");
  const [editDay, setEditDay] = useState<number | null>(null);

  const updateDay = (id: number, patch: Partial<CourseDay>) => {
    setDays((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  const updateResult = (id: number, patch: Partial<CourseResult>) => {
    setResults((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  return (
    <div>
      <h3 style={S.sectionTitle}>📚 Курс</h3>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["info", "days", "results"] as const).map((t) => {
          const labels = { info: "Общее", days: "21 день", results: "Метрики" };
          const isActive = subTab === t;
          return (
            <button
              key={t}
              onClick={() => setSubTab(t)}
              style={{
                flex: 1,
                padding: "10px 8px",
                borderRadius: 10,
                border: isActive ? "1.5px solid #10b981" : "1.5px solid #e2e8f0",
                background: isActive ? "rgba(16,185,129,0.06)" : "#fff",
                color: isActive ? "#10b981" : "#64748b",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                outline: "none",
              }}
            >
              {labels[t]}
            </button>
          );
        })}
      </div>

      {/* ── Info ──────────────────────────────────── */}
      {subTab === "info" && (
        <div style={S.card}>
          {([
            ["title", "Название курса", false],
            ["targetAudience", "Целевая аудитория", false],
            ["whyDetoxText", "Почему детокс?", true],
            ["conditionsText", "Условия участия", true],
            ["guaranteeText", "Гарантия (текст)", true],
            ["guaranteeDays", "Гарантия (дней)", false],
            ["privateChatLink", "Ссылка на чат", false],
          ] as [keyof CourseInfo, string, boolean][]).map(([key, label, multi]) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={S.label}>{label}</label>
              {multi ? (
                <textarea
                  style={S.textarea}
                  value={String(info[key] || "")}
                  onChange={(e) => setInfo((p) => ({ ...p, [key]: e.target.value }))}
                  rows={3}
                />
              ) : (
                <input
                  type={key === "guaranteeDays" ? "number" : "text"}
                  style={S.input}
                  value={String(info[key] || "")}
                  onChange={(e) =>
                    setInfo((p) => ({
                      ...p,
                      [key]: key === "guaranteeDays" ? +e.target.value : e.target.value,
                    }))
                  }
                />
              )}
            </div>
          ))}
          <SaveButton saving={saving} onClick={() => onSave("course_info", info)} />
        </div>
      )}

      {/* ── Days ──────────────────────────────────── */}
      {subTab === "days" && (
        <div>
          {days.map((day) => (
            <div key={day.id} style={S.card}>
              <div
                onClick={() => setEditDay((prev) => (prev === day.id ? null : day.id))}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{day.icon}</span>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>ДЕНЬ {day.dayNumber}</span>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>{day.title}</div>
                  </div>
                </div>
                <Toggle value={day.isVisible} onChange={(v) => updateDay(day.id, { isVisible: v })} />
              </div>

              {editDay === day.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  style={{ overflow: "hidden", marginTop: 14, borderTop: "1px solid #f1f5f9", paddingTop: 14 }}
                >
                  <EmojiField
                    label="Иконка"
                    value={day.icon}
                    onChange={(v) => updateDay(day.id, { icon: v })}
                    presets={["🌅","💧","🥣","🧖","✨","🧘","📊","🥗","💆","🫒","🦠","🌺","🏃","🏆","📝","🪞","🕊","🚴","📸","🎉"]}
                  />
                  <div style={{ marginBottom: 12 }}>
                    <label style={S.label}>Заголовок</label>
                    <input type="text" style={S.input} value={day.title} onChange={(e) => updateDay(day.id, { title: e.target.value })} />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={S.label}>Краткое описание</label>
                    <input type="text" style={S.input} value={day.shortDesc} onChange={(e) => updateDay(day.id, { shortDesc: e.target.value })} />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={S.label}>Полное описание</label>
                    <textarea style={S.textarea} value={day.fullDesc} onChange={(e) => updateDay(day.id, { fullDesc: e.target.value })} rows={3} />
                  </div>
                  <div>
                    <label style={S.label}>Задачи (по одной на строку)</label>
                    <textarea
                      style={S.textarea}
                      value={day.tasks.join("\n")}
                      onChange={(e) => updateDay(day.id, { tasks: e.target.value.split("\n").filter(Boolean) })}
                      rows={4}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          ))}
          <SaveButton saving={saving} onClick={() => onSave("course_days", days)} />
        </div>
      )}

      {/* ── Results (Metrics) ─────────────────────── */}
      {subTab === "results" && (
        <div>
          {results.map((r, idx) => (
            <div key={r.id} style={S.card}>
              <EmojiField label="Иконка" value={r.icon} onChange={(v) => updateResult(r.id, { icon: v })} presets={["✨","⚖️","⚡","💆","🧬","🧪","💪","🌟"]} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={S.label}>Значение</label>
                  <input type="text" style={S.input} value={r.metricValue} onChange={(e) => updateResult(r.id, { metricValue: e.target.value })} />
                </div>
                <div>
                  <label style={S.label}>Подпись</label>
                  <input type="text" style={S.input} value={r.metricLabel} onChange={(e) => updateResult(r.id, { metricLabel: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={S.label}>Описание</label>
                <input type="text" style={S.input} value={r.description} onChange={(e) => updateResult(r.id, { description: e.target.value })} />
              </div>
            </div>
          ))}
          <SaveButton saving={saving} onClick={() => onSave("course_results", results)} />
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 * TAB 6: CASES (CRUD with photos)
 * ════════════════════════════════════════════════════════════ */

function CasesTab({
  cases: initial,
  onSave,
  onUpload,
  saving,
}: {
  cases: CaseStudy[];
  onSave: (s: string, p: unknown) => Promise<void>;
  onUpload?: (slot: string, file: File) => Promise<string>;
  saving: boolean;
}) {
  const [cases, setCases] = useState(initial.sort((a, b) => a.sortOrder - b.sortOrder));

  const update = (id: number, patch: Partial<CaseStudy>) => {
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const add = () => {
    const maxId = cases.reduce((m, c) => Math.max(m, c.id), 0);
    setCases((prev) => [
      ...prev,
      {
        id: maxId + 1,
        clientName: "",
        clientAge: undefined,
        resultText: "",
        reviewText: "",
        photoBefore: "",
        photoAfter: "",
        sortOrder: prev.length + 1,
        isVisible: true,
      },
    ]);
  };

  const remove = (id: number) => {
    setCases((prev) => prev.filter((c) => c.id !== id));
  };

  const handlePhotoUpload = async (caseId: number, slot: "before" | "after", file: File) => {
    if (!onUpload) return;
    const url = await onUpload(`case_${caseId}_${slot}`, file);
    update(caseId, slot === "before" ? { photoBefore: url } : { photoAfter: url });
  };

  return (
    <div>
      <h3 style={S.sectionTitle}>💼 Кейсы клиенток</h3>
      {cases.map((cs, idx) => (
        <div key={cs.id} style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Кейс #{idx + 1}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Toggle value={cs.isVisible} onChange={(v) => update(cs.id, { isVisible: v })} />
              <button style={S.deleteBtn} onClick={() => remove(cs.id)}>Удалить</button>
            </div>
          </div>

          {/* Name + Age */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 10, marginBottom: 12 }}>
            <div>
              <label style={S.label}>Имя клиентки</label>
              <input type="text" style={S.input} value={cs.clientName} onChange={(e) => update(cs.id, { clientName: e.target.value })} />
            </div>
            <div>
              <label style={S.label}>Возраст</label>
              <input type="number" style={S.input} value={cs.clientAge || ""} onChange={(e) => update(cs.id, { clientAge: +e.target.value || undefined })} />
            </div>
          </div>

          {/* Result */}
          <div style={{ marginBottom: 12 }}>
            <label style={S.label}>Результат (краткий)</label>
            <input type="text" style={S.input} value={cs.resultText} onChange={(e) => update(cs.id, { resultText: e.target.value })} placeholder="Минус 6 кг, чистая кожа" />
          </div>

          {/* Review */}
          <div style={{ marginBottom: 12 }}>
            <label style={S.label}>Отзыв</label>
            <textarea style={S.textarea} value={cs.reviewText} onChange={(e) => update(cs.id, { reviewText: e.target.value })} rows={4} />
          </div>

          {/* Photos: Before / After */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <PhotoUploader label="Фото ДО" currentUrl={cs.photoBefore} onUpload={(f) => handlePhotoUpload(cs.id, "before", f)} />
            <PhotoUploader label="Фото ПОСЛЕ" currentUrl={cs.photoAfter} onUpload={(f) => handlePhotoUpload(cs.id, "after", f)} />
          </div>

          {/* Sort */}
          <div style={{ marginTop: 8 }}>
            <label style={S.label}>Порядок</label>
            <input type="number" style={{ ...S.input, width: 80 }} value={cs.sortOrder} onChange={(e) => update(cs.id, { sortOrder: +e.target.value })} />
          </div>
        </div>
      ))}
      <button style={S.addBtn} onClick={add}>＋ Добавить кейс</button>
      <SaveButton saving={saving} onClick={() => onSave("cases", cases)} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 * TAB 7: QUIZ (CRUD questions + options)
 * ════════════════════════════════════════════════════════════ */

function QuizTab({
  questions: initial,
  onSave,
  saving,
}: {
  questions: QuizQuestion[];
  onSave: (s: string, p: unknown) => Promise<void>;
  saving: boolean;
}) {
  const [questions, setQuestions] = useState(initial.sort((a, b) => a.sortOrder - b.sortOrder));

  const updateQ = (id: number, patch: Partial<QuizQuestion>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const updateOpt = (qId: number, optIdx: number, patch: Partial<QuizOption>) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, options: q.options.map((o, i) => (i === optIdx ? { ...o, ...patch } : o)) }
          : q,
      ),
    );
  };

  const addOption = (qId: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId ? { ...q, options: [...q.options, { text: "", score: 0 }] } : q,
      ),
    );
  };

  const removeOption = (qId: number, optIdx: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId ? { ...q, options: q.options.filter((_, i) => i !== optIdx) } : q,
      ),
    );
  };

  const addQuestion = () => {
    const maxId = questions.reduce((m, q) => Math.max(m, q.id), 0);
    setQuestions((prev) => [
      ...prev,
      {
        id: maxId + 1,
        questionText: "",
        options: [
          { text: "", score: 3 },
          { text: "", score: 2 },
          { text: "", score: 1 },
          { text: "", score: 0 },
        ],
        sortOrder: prev.length + 1,
      },
    ]);
  };

  const removeQuestion = (id: number) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div>
      <h3 style={S.sectionTitle}>🧩 Вопросы квиза</h3>
      {questions.map((q, qIdx) => (
        <div key={q.id} style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Вопрос {qIdx + 1}</span>
            <button style={S.deleteBtn} onClick={() => removeQuestion(q.id)}>Удалить</button>
          </div>

          {/* Question text */}
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>Текст вопроса</label>
            <textarea
              style={S.textarea}
              value={q.questionText}
              onChange={(e) => updateQ(q.id, { questionText: e.target.value })}
              rows={2}
            />
          </div>

          {/* Options */}
          <div style={{ marginBottom: 10 }}>
            <label style={S.label}>Варианты ответов</label>
            {q.options.map((opt, oIdx) => (
              <div
                key={oIdx}
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  marginBottom: 8,
                  padding: "8px 10px",
                  borderRadius: 10,
                  backgroundColor: "#f8fafc",
                  border: "1px solid #f1f5f9",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#94a3b8",
                    width: 20,
                    textAlign: "center",
                    flexShrink: 0,
                  }}
                >
                  {["A", "B", "C", "D", "E"][oIdx] || oIdx + 1}
                </span>
                <input
                  type="text"
                  placeholder="Текст варианта"
                  style={{ ...S.input, flex: 1, border: "1px solid #e2e8f0" }}
                  value={opt.text}
                  onChange={(e) => updateOpt(q.id, oIdx, { text: e.target.value })}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Балл</label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    style={{ ...S.input, width: 48, padding: "6px 8px", textAlign: "center", fontSize: 14 }}
                    value={opt.score}
                    onChange={(e) => updateOpt(q.id, oIdx, { score: +e.target.value })}
                  />
                </div>
                {q.options.length > 2 && (
                  <button
                    onClick={() => removeOption(q.id, oIdx)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      border: "1px solid #fca5a5",
                      background: "#fff",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      outline: "none",
                      padding: 0,
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {q.options.length < 5 && (
              <button
                onClick={() => addOption(q.id)}
                style={{
                  ...S.addBtn,
                  height: 36,
                  border: "1.5px dashed #cbd5e1",
                  fontSize: 12,
                }}
              >
                ＋ Вариант
              </button>
            )}
          </div>

          {/* Sort */}
          <div>
            <label style={S.label}>Порядок</label>
            <input type="number" style={{ ...S.input, width: 80 }} value={q.sortOrder} onChange={(e) => updateQ(q.id, { sortOrder: +e.target.value })} />
          </div>
        </div>
      ))}
      <button style={S.addBtn} onClick={addQuestion}>＋ Добавить вопрос</button>
      <SaveButton saving={saving} onClick={() => onSave("quiz_questions", questions)} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 * TAB 8: DESIGN (Color Picker + Tokens)
 * ════════════════════════════════════════════════════════════ */

function DesignTab({
  settings: initial,
  onSave,
  saving,
}: {
  settings: Record<string, string>;
  onSave: (s: string, p: unknown) => Promise<void>;
  saving: boolean;
}) {
  const [tokens, setTokens] = useState<DesignTokens>({
    primaryColor: initial.primaryColor || DEFAULT_TOKENS.primaryColor,
    successColor: initial.successColor || DEFAULT_TOKENS.successColor,
    bgLight: initial.bgLight || DEFAULT_TOKENS.bgLight,
    bgDark: initial.bgDark || DEFAULT_TOKENS.bgDark,
    fontFamily: initial.fontFamily || DEFAULT_TOKENS.fontFamily,
    borderRadius: +(initial.borderRadius || DEFAULT_TOKENS.borderRadius),
  });

  return (
    <div>
      <h3 style={S.sectionTitle}>🎨 Дизайн-система</h3>

      <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>
          Цветовая палитра
        </div>
        <ColorPicker label="Primary Color" value={tokens.primaryColor} onChange={(v) => setTokens((p) => ({ ...p, primaryColor: v }))} />
        <ColorPicker label="Success Color" value={tokens.successColor} onChange={(v) => setTokens((p) => ({ ...p, successColor: v }))} />
        <ColorPicker label="Фон (светлый)" value={tokens.bgLight} onChange={(v) => setTokens((p) => ({ ...p, bgLight: v }))} />
        <ColorPicker label="Фон (тёмный)" value={tokens.bgDark} onChange={(v) => setTokens((p) => ({ ...p, bgDark: v }))} />
      </div>

      <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>
          Типографика & форма
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={S.label}>Шрифт</label>
          <input type="text" style={S.input} value={tokens.fontFamily} onChange={(e) => setTokens((p) => ({ ...p, fontFamily: e.target.value }))} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={S.label}>Border Radius (px)</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="range"
              min={4}
              max={24}
              value={tokens.borderRadius}
              onChange={(e) => setTokens((p) => ({ ...p, borderRadius: +e.target.value }))}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", width: 40 }}>{tokens.borderRadius}px</span>
          </div>
        </div>

        {/* Preview */}
        <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>Превью</div>
        <div
          style={{
            padding: 20,
            borderRadius: tokens.borderRadius,
            background: `linear-gradient(135deg, ${tokens.primaryColor}, ${tokens.successColor})`,
            color: "#ffffff",
            fontFamily: tokens.fontFamily,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Preview Button</div>
          <div style={{ fontSize: 13, opacity: 0.7 }}>border-radius: {tokens.borderRadius}px</div>
        </div>
      </div>

      <SaveButton saving={saving} onClick={() => onSave("design", tokens)} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 * TAB 9: SETTINGS (Blocks Visibility + Pricing + Links)
 * ════════════════════════════════════════════════════════════ */

function SettingsTab({
  blocks: initialBlocks,
  settings: initialSettings,
  courseInfo: initialCourseInfo,
  onSave,
  saving,
}: {
  blocks: Record<string, boolean>;
  settings: Record<string, string>;
  courseInfo: CourseInfo;
  onSave: (s: string, p: unknown) => Promise<void>;
  saving: boolean;
}) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [pricing, setPricing] = useState({
    priceStars: initialCourseInfo.priceStars,
    oldPriceStars: initialCourseInfo.oldPriceStars || 0,
    priceRub: initialCourseInfo.priceRub || 0,
  });
  const [links, setLinks] = useState({
    privateChatLink: initialCourseInfo.privateChatLink || "",
    supportBot: initialSettings.supportBot || "",
    channelLink: initialSettings.channelLink || "",
  });

  const BLOCK_LABELS: Record<string, string> = {
    hero: "🏠 Главный экран",
    author: "👤 Об авторе",
    method: "🔬 Метод работы",
    course: "📚 Программа курса",
    cases: "💼 Кейсы клиенток",
    quiz: "🧩 Мини-квиз",
    final_cta: "🎯 Финальный CTA",
  };

  return (
    <div>
      <h3 style={S.sectionTitle}>⚙️ Настройки</h3>

      {/* ── Blocks Visibility ──────────────────────── */}
      <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>
          Видимость секций
        </div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>
          Скрытые секции не показываются пользователям
        </div>
        {Object.entries(BLOCK_LABELS).map(([key, label]) => (
          <div
            key={key}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 500, color: "#334155" }}>{label}</span>
            <Toggle
              value={blocks[key] !== false}
              onChange={(v) => setBlocks((prev) => ({ ...prev, [key]: v }))}
            />
          </div>
        ))}
      </div>

      {/* ── Pricing ───────────────────────────────── */}
      <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>
          💰 Цена
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div>
            <label style={S.label}>Stars ⭐</label>
            <input
              type="number"
              style={S.input}
              value={pricing.priceStars}
              onChange={(e) => setPricing((p) => ({ ...p, priceStars: +e.target.value }))}
            />
          </div>
          <div>
            <label style={S.label}>Старая цена</label>
            <input
              type="number"
              style={S.input}
              value={pricing.oldPriceStars}
              onChange={(e) => setPricing((p) => ({ ...p, oldPriceStars: +e.target.value }))}
            />
          </div>
          <div>
            <label style={S.label}>₽ (опц.)</label>
            <input
              type="number"
              style={S.input}
              value={pricing.priceRub}
              onChange={(e) => setPricing((p) => ({ ...p, priceRub: +e.target.value }))}
            />
          </div>
        </div>
        {pricing.oldPriceStars > pricing.priceStars && (
          <div
            style={{
              marginTop: 10,
              padding: "6px 12px",
              borderRadius: 8,
              backgroundColor: "rgba(34,197,94,0.08)",
              fontSize: 13,
              fontWeight: 600,
              color: "#059669",
              display: "inline-block",
            }}
          >
            Выгода: {pricing.oldPriceStars - pricing.priceStars} Stars ({Math.round((1 - pricing.priceStars / pricing.oldPriceStars) * 100)}%)
          </div>
        )}
      </div>

      {/* ── Links ─────────────────────────────────── */}
      <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>
          🔗 Ссылки
        </div>
        {([
          ["privateChatLink", "Ссылка на закрытый чат", "https://t.me/+..."],
          ["supportBot", "Бот поддержки", "@support_bot"],
          ["channelLink", "Канал", "https://t.me/channel"],
        ] as [string, string, string][]).map(([key, label, ph]) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label style={S.label}>{label}</label>
            <input
              type="text"
              style={S.input}
              placeholder={ph}
              value={links[key as keyof typeof links]}
              onChange={(e) => setLinks((p) => ({ ...p, [key]: e.target.value }))}
            />
          </div>
        ))}
      </div>

      <SaveButton
        saving={saving}
        onClick={() => onSave("settings", { blocks, pricing, links })}
      />
    </div>
  );
}
