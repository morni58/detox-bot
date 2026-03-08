/* ============================================================
 * 🌿 main.tsx — Entry point
 * ============================================================ */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

/* ── Telegram WebApp SDK (инжектим если не загружен) ──── */
function ensureTelegramSDK(): Promise<void> {
  return new Promise((resolve) => {
    // Уже загружен
    if (window.Telegram?.WebApp) {
      resolve();
      return;
    }

    // Проверим, есть ли script tag
    const existing = document.querySelector(
      'script[src*="telegram-web-app"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      // Fallback: если скрипт не загрузится за 3 сек — рендерим всё равно
      setTimeout(resolve, 3000);
      return;
    }

    // Инжектим script
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => resolve(); // Рендерим даже без SDK (desktop preview)
    document.head.appendChild(script);

    // Fallback timeout
    setTimeout(resolve, 3000);
  });
}

/* ── Disable pull-to-refresh (мешает скроллу) ─────────── */
function disablePullToRefresh() {
  document.body.style.overscrollBehaviorY = "none";

  // iOS: prevent rubber-banding
  let startY = 0;
  document.addEventListener(
    "touchstart",
    (e) => {
      startY = e.touches[0].clientY;
    },
    { passive: true },
  );

  document.addEventListener(
    "touchmove",
    (e) => {
      const el = e.target as HTMLElement;
      const scrollable = el.closest("[data-scrollable]");
      if (!scrollable && window.scrollY === 0 && e.touches[0].clientY > startY) {
        e.preventDefault();
      }
    },
    { passive: false },
  );
}

/* ── Bootstrap ────────────────────────────────────────── */

async function bootstrap() {
  disablePullToRefresh();
  await ensureTelegramSDK();

  const container = document.getElementById("root");
  if (!container) throw new Error("Root element not found");

  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap();
