/* ============================================================
 * 🌿 App.tsx — Главный компонент Mini App
 * ============================================================
 *
 * Роутинг (hash-based, без react-router):
 *   #/         → Landing (все секции)
 *   #/admin    → AdminPanel
 *   #/success  → SuccessScreen (после оплаты)
 *
 * Flow:
 *   1. Telegram WebApp init (ready, expand, colors)
 *   2. Fetch /api/content → LandingContent
 *   3. Проверка: paid? → SuccessScreen
 *   4. Проверка: admin? → показать кнопку «Админ»
 *   5. Рендер лендинга из секций (по blocks visibility)
 *   6. Клик «Купить» → usePayment → openInvoice → Success
 *
 * Telegram WebApp интеграция:
 *   • setHeaderColor / setBackgroundColor
 *   • BackButton (на admin и success)
 *   • MainButton (скрыт — используем свои кнопки)
 *   • Haptic Feedback на всех действиях
 *
 * ============================================================ */

import { useState, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ── Screens ──────────────────────────────────────────── */
import LoadingScreen from "./components/screens/LoadingScreen";
import HeroSection from "./components/screens/HeroSection";
import AboutAuthor from "./components/screens/AboutAuthor";
import MethodSection from "./components/screens/MethodSection";
import CourseSection from "./components/screens/CourseSection";
import CasesSection from "./components/screens/CasesSection";
import QuizSection from "./components/screens/QuizSection";
import FinalCTA from "./components/screens/FinalCTA";
import SuccessScreen from "./components/screens/SuccessScreen";
import AdminPanel from "./components/admin/AdminPanel";

/* ── Hooks & API ──────────────────────────────────────── */
import { useTelegram } from "./hooks/useTelegram";
import { usePayment } from "./hooks/usePayment";
import { fetchContent, submitQuizResult, adminApi } from "./api/endpoints";
import type { LandingContent } from "./types";

/* ── Route type ───────────────────────────────────────── */
type Route = "landing" | "admin" | "success";

function getRoute(): Route {
  const hash = window.location.hash;
  if (hash.startsWith("#/admin")) return "admin";
  if (hash.startsWith("#/success")) return "success";
  return "landing";
}

/* ════════════════════════════════════════════════════════════
 * APP COMPONENT
 * ════════════════════════════════════════════════════════════ */

export default function App() {
  const { webapp, haptic, user } = useTelegram();
  const payment = usePayment();

  /* ── State ──────────────────────────────────────────── */
  const [route, setRoute] = useState<Route>(getRoute);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<LandingContent | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── Hash-based routing ─────────────────────────────── */
  const navigate = useCallback((r: Route) => {
    const hash = r === "landing" ? "#/" : `#/${r}`;
    window.location.hash = hash;
    setRoute(r);
  }, []);

  useEffect(() => {
    const handler = () => setRoute(getRoute());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  /* ── Telegram WebApp styling ────────────────────────── */
  useEffect(() => {
    if (!webapp) return;

    try {
      webapp.setHeaderColor("#0f172a");
      webapp.setBackgroundColor("#0f172a");
    } catch {
      // Методы недоступны на старых клиентах
    }
  }, [webapp]);

  /* ── BackButton (admin / success) ───────────────────── */
  useEffect(() => {
    if (!webapp?.BackButton) return;

    if (route !== "landing") {
      webapp.BackButton.show();
      const handler = () => navigate("landing");
      webapp.BackButton.onClick(handler);
      return () => {
        webapp.BackButton.offClick(handler);
        webapp.BackButton.hide();
      };
    } else {
      webapp.BackButton.hide();
    }
  }, [webapp, route, navigate]);

  /* ── Fetch content on mount ─────────────────────────── */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Параллельно: контент + проверка оплаты + проверка админ
        const [contentData, paid] = await Promise.all([
          fetchContent(),
          payment.checkStatus(),
          checkAdmin(),
        ]);

        if (cancelled) return;

        setContent(contentData);

        // Если уже оплачено — сразу на success
        if (paid) {
          setRoute("success");
        }
      } catch (err) {
        if (!cancelled) {
          setError("Не удалось загрузить данные");
          console.error("Content fetch error:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    async function checkAdmin() {
      try {
        // Сначала проверим по env (быстрый путь)
        const adminIds = (import.meta.env.VITE_ADMIN_IDS ?? "").split(",");
        if (user?.id && adminIds.includes(String(user.id))) {
          setIsAdmin(true);
          return;
        }

        // Потом по API
        const { isAdmin: adminFromApi } = await adminApi.checkAdmin();
        setIsAdmin(adminFromApi);
      } catch {
        // Не админ — ок
      }
    }

    load();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Payment success → navigate ─────────────────────── */
  useEffect(() => {
    if (payment.state.status === "success") {
      navigate("success");
    }
  }, [payment.state.status, navigate]);

  /* ── Buy handler ────────────────────────────────────── */
  const handleBuy = useCallback(() => {
    haptic.heavy();
    payment.startPayment();
  }, [haptic, payment]);

  /* ── Quiz complete handler ──────────────────────────── */
  const handleQuizComplete = useCallback(
    (totalScore: number, answers: Record<number, number>) => {
      submitQuizResult({
        totalScore,
        maxScore: (content?.quizQuestions?.length ?? 5) * 3,
        answers,
      }).catch(() => {});
    },
    [content],
  );

  /* ── Admin save handler ─────────────────────────────── */
  const handleAdminSave = useCallback(
    async (section: string, payload: unknown) => {
      const handlers: Record<string, (data: any) => Promise<unknown>> = {
        texts: adminApi.saveTexts,
        photos: adminApi.savePhotos,
        author_cards: adminApi.saveAuthorCards,
        method_items: adminApi.saveMethodItems,
        course_info: adminApi.saveCourseInfo,
        course_days: adminApi.saveCourseDays,
        course_results: adminApi.saveCourseResults,
        cases: adminApi.saveCases,
        quiz_questions: adminApi.saveQuizQuestions,
        design: adminApi.saveDesign,
        settings: adminApi.saveSettings,
      };
      const handler = handlers[section];
      if (handler) await handler(payload);
    },
    [],
  );

  /* ── Admin upload handler ──────────────────────────── */
  const handleAdminUpload = useCallback(
    async (slot: string, file: File): Promise<string> => {
      const { url } = await adminApi.uploadPhoto(slot, file);
      return url;
    },
    [],
  );

  /* ── Visible blocks ─────────────────────────────────── */
  const blocks = content?.blocks ?? {};

  /* ── Scroll to course section ───────────────────────── */
  const scrollToCourse = useCallback(() => {
    const el = document.getElementById("course");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else handleBuy();
  }, [handleBuy]);

  /* ════════════════════════════════════════════════════════
   *  RENDER
   * ════════════════════════════════════════════════════════ */

  // Loading
  if (loading) {
    return <LoadingScreen />;
  }

  // Error
  if (error && !content) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: "#0f172a",
          color: "#ffffff",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48 }}>😔</div>
        <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{error}</h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: 0 }}>
          Попробуйте перезагрузить страницу
        </p>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => window.location.reload()}
          style={{
            marginTop: 8,
            padding: "12px 32px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            outline: "none",
          }}
        >
          Обновить
        </motion.button>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {/* ══════════════════════════════════════════════
       *  ROUTE: SUCCESS
       * ══════════════════════════════════════════════ */}
      {route === "success" && (
        <motion.div
          key="success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <SuccessScreen
            chatLink={payment.state.chatLink || content?.courseInfo?.privateChatLink}
            onClose={() => navigate("landing")}
          />
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════
       *  ROUTE: ADMIN
       * ══════════════════════════════════════════════ */}
      {route === "admin" && isAdmin && content && (
        <motion.div
          key="admin"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <AdminPanel
            data={content}
            onSave={handleAdminSave}
            onUpload={handleAdminUpload}
          />
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════
       *  ROUTE: LANDING
       * ══════════════════════════════════════════════ */}
      {route === "landing" && content && (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* ── Admin FAB ────────────────────────────── */}
          {isAdmin && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("admin")}
              style={{
                position: "fixed",
                bottom: 24,
                right: 24,
                zIndex: 50,
                width: 52,
                height: 52,
                borderRadius: 16,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                outline: "none",
                WebkitTapHighlightColor: "transparent",
              }}
              aria-label="Админ-панель"
            >
              ⚙️
            </motion.button>
          )}

          {/* ── Payment overlay (loading / confirming) ── */}
          <PaymentOverlay status={payment.state.status} error={payment.state.error} onRetry={handleBuy} onReset={payment.reset} />

          {/* ── Sections ─────────────────────────────── */}
          <div style={{ width: "100%", overflowX: "hidden" }}>

            {blocks.hero !== false && (
              <HeroSection
                onPrimaryClick={handleBuy}
                onSecondaryClick={scrollToCourse}
              />
            )}

            {blocks.author !== false && (
              <AboutAuthor
                cards={content.authorCards}
              />
            )}

            {blocks.method !== false && (
              <MethodSection
                items={content.methodItems}
                onItemCtaClick={handleBuy}
              />
            )}

            {blocks.course !== false && (
              <CourseSection
                info={content.courseInfo}
                results={content.courseResults}
                days={content.courseDays}
                onBuyClick={handleBuy}
              />
            )}

            {blocks.cases !== false && (
              <CasesSection
                cases={content.cases}
              />
            )}

            {blocks.quiz !== false && (
              <QuizSection
                questions={content.quizQuestions}
                onComplete={handleQuizComplete}
                onCtaClick={handleBuy}
              />
            )}

            {blocks.final_cta !== false && (
              <FinalCTA
                priceStars={content.courseInfo?.priceStars}
                oldPriceStars={content.courseInfo?.oldPriceStars}
                guaranteeDays={content.courseInfo?.guaranteeDays}
                onBuyClick={handleBuy}
              />
            )}

            {/* ── Footer ─────────────────────────────── */}
            <footer
              style={{
                width: "100%",
                padding: "24px 24px 40px",
                background: "#0f172a",
                textAlign: "center",
                borderTop: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.25)",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                © {new Date().getFullYear()} Детокс-курс
                <br />
                Оплата через Telegram Stars
              </p>
            </footer>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ════════════════════════════════════════════════════════════
 * Payment Overlay (loading / confirming states)
 * ════════════════════════════════════════════════════════════ */

function PaymentOverlay({
  status,
  error,
  onRetry,
  onReset,
}: {
  status: string;
  error: string | null;
  onRetry: () => void;
  onReset: () => void;
}) {
  const isVisible =
    status === "loading" ||
    status === "confirming" ||
    status === "error" ||
    status === "cancelled";

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 90,
          background: "rgba(15,23,42,0.92)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          padding: 32,
        }}
      >
        {(status === "loading" || status === "confirming") && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "3px solid rgba(255,255,255,0.1)",
                borderTopColor: "#10b981",
              }}
            />
            <p style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: 0 }}>
              {status === "loading" ? "Создаю счёт для оплаты…" : "Подтверждаю оплату…"}
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>
              Не закрывайте приложение
            </p>
          </>
        )}

        {(status === "error" || status === "cancelled") && (
          <>
            <div style={{ fontSize: 48 }}>
              {status === "error" ? "😔" : "🔙"}
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: 0, textAlign: "center" }}>
              {error || "Оплата отменена"}
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onRetry}
                style={{
                  padding: "12px 28px",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                Попробовать снова
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onReset}
                style={{
                  padding: "12px 28px",
                  borderRadius: 12,
                  border: "1.5px solid rgba(255,255,255,0.15)",
                  background: "transparent",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                Закрыть
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
