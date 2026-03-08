/* ============================================================
 * 🌿 useTelegram — Telegram Mini App SDK Hook
 * ============================================================ */

import { useEffect, useMemo, useCallback } from "react";

export function useTelegram() {
  const webapp = useMemo(() => window.Telegram?.WebApp, []);

  /* ── Init ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!webapp) return;

    // Сообщаем Telegram, что приложение готово
    webapp.ready();

    // Раскрываем на полный экран
    webapp.expand();

    // Полноэкранный режим (Telegram Mini Apps 2.0)
    try {
      webapp.requestFullscreen();
    } catch {
      // Метод недоступен на старых клиентах
    }
  }, [webapp]);

  /* ── User ─────────────────────────────────────────────── */
  const user = useMemo(() => webapp?.initDataUnsafe?.user ?? null, [webapp]);

  /* ── Theme ────────────────────────────────────────────── */
  const colorScheme = webapp?.colorScheme ?? "light";
  const themeParams = webapp?.themeParams ?? {};
  const isDark = colorScheme === "dark";

  /* ── Haptic Feedback ──────────────────────────────────── */
  const haptic = useMemo(
    () => ({
      light: () => webapp?.HapticFeedback?.impactOccurred("light"),
      medium: () => webapp?.HapticFeedback?.impactOccurred("medium"),
      heavy: () => webapp?.HapticFeedback?.impactOccurred("heavy"),
      success: () => webapp?.HapticFeedback?.notificationOccurred("success"),
      warning: () => webapp?.HapticFeedback?.notificationOccurred("warning"),
      error: () => webapp?.HapticFeedback?.notificationOccurred("error"),
      selection: () => webapp?.HapticFeedback?.selectionChanged(),
    }),
    [webapp],
  );

  /* ── Actions ──────────────────────────────────────────── */
  const close = useCallback(() => webapp?.close(), [webapp]);

  const openLink = useCallback(
    (url: string) => webapp?.openLink(url),
    [webapp],
  );

  const openTelegramLink = useCallback(
    (url: string) => webapp?.openTelegramLink(url),
    [webapp],
  );

  const sendData = useCallback(
    (data: string) => webapp?.sendData(data),
    [webapp],
  );

  /* ── Viewport ─────────────────────────────────────────── */
  const viewportHeight = webapp?.viewportStableHeight ?? window.innerHeight;

  return {
    webapp,
    user,
    colorScheme,
    isDark,
    themeParams,
    haptic,
    viewportHeight,
    initData: webapp?.initData ?? "",
    close,
    openLink,
    openTelegramLink,
    sendData,
  };
}
