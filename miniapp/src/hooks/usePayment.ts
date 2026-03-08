/* ============================================================
 * 🌿 usePayment — Telegram Stars Payment Hook
 * ============================================================
 *
 * Полный flow оплаты через Telegram Stars:
 *
 *   1. User нажимает «Купить курс»
 *   2. → POST /api/payment/create-invoice → получаем invoiceUrl
 *   3. → Telegram WebApp.openInvoice(url) — нативное окно оплаты
 *   4. → Callback: status = "paid" | "cancelled" | "failed"
 *   5. → POST /api/payment/confirm → сервер проверяет
 *   6. → Редирект на SuccessScreen с ссылкой на чат
 *
 * Состояния:
 *   idle → loading → invoiceOpened → confirming → success | error
 *
 * ============================================================ */

import { useState, useCallback, useRef } from "react";
import { useTelegram } from "./useTelegram";
import { createInvoice, confirmPayment, checkPaymentStatus } from "../api/endpoints";

/* ── Types ────────────────────────────────────────────── */

export type PaymentStatus =
  | "idle"
  | "loading"
  | "invoiceOpened"
  | "confirming"
  | "success"
  | "error"
  | "cancelled";

export interface PaymentState {
  status: PaymentStatus;
  error: string | null;
  chatLink: string | null;
}

export interface UsePaymentReturn {
  state: PaymentState;
  /** Запустить flow оплаты */
  startPayment: () => Promise<void>;
  /** Проверить статус оплаты (для восстановления) */
  checkStatus: () => Promise<boolean>;
  /** Сбросить состояние */
  reset: () => void;
}

/* ── Hook ─────────────────────────────────────────────── */

export function usePayment(): UsePaymentReturn {
  const { webapp, haptic } = useTelegram();

  const [state, setState] = useState<PaymentState>({
    status: "idle",
    error: null,
    chatLink: null,
  });

  // Предотвращаем двойной клик
  const isProcessing = useRef(false);

  /* ── Start Payment Flow ─────────────────────────────── */
  const startPayment = useCallback(async () => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    setState({ status: "loading", error: null, chatLink: null });

    try {
      // 1. Создаём invoice на сервере
      const { invoiceUrl } = await createInvoice();

      if (!invoiceUrl) {
        throw new Error("Не удалось создать счёт для оплаты");
      }

      // 2. Открываем нативное окно оплаты Telegram
      if (webapp?.openInvoice) {
        setState((prev) => ({ ...prev, status: "invoiceOpened" }));

        webapp.openInvoice(invoiceUrl, async (invoiceStatus: string) => {
          switch (invoiceStatus) {
            case "paid": {
              // 3. Подтверждаем оплату на сервере
              setState((prev) => ({ ...prev, status: "confirming" }));
              haptic.success();

              try {
                // Polling: ждём webhook от Telegram → наш сервер
                const result = await pollPaymentConfirmation();

                setState({
                  status: "success",
                  error: null,
                  chatLink: result.chatLink,
                });
                haptic.success();
              } catch (confirmErr) {
                // Оплата прошла, но confirmation не пришёл —
                // всё равно success, сервер обработает webhook позже
                setState({
                  status: "success",
                  error: null,
                  chatLink: null,
                });
              }
              break;
            }

            case "cancelled":
              haptic.warning();
              setState({
                status: "cancelled",
                error: "Оплата отменена",
                chatLink: null,
              });
              break;

            case "failed":
              haptic.error();
              setState({
                status: "error",
                error: "Оплата не прошла. Попробуйте ещё раз.",
                chatLink: null,
              });
              break;

            case "pending":
              setState((prev) => ({ ...prev, status: "confirming" }));
              break;

            default:
              setState({
                status: "error",
                error: `Неизвестный статус: ${invoiceStatus}`,
                chatLink: null,
              });
          }

          isProcessing.current = false;
        });
      } else {
        // Fallback: нет openInvoice (старый клиент / десктоп)
        // Открываем invoiceUrl как обычную ссылку
        webapp?.openTelegramLink(invoiceUrl);
        setState((prev) => ({ ...prev, status: "invoiceOpened" }));
        isProcessing.current = false;
      }
    } catch (err) {
      haptic.error();
      setState({
        status: "error",
        error: err instanceof Error ? err.message : "Ошибка создания платежа",
        chatLink: null,
      });
      isProcessing.current = false;
    }
  }, [webapp, haptic]);

  /* ── Poll for payment confirmation ──────────────────── */
  async function pollPaymentConfirmation(
    maxAttempts = 10,
    intervalMs = 2000,
  ): Promise<{ chatLink: string | null }> {
    for (let i = 0; i < maxAttempts; i++) {
      await sleep(intervalMs);

      try {
        const result = await checkPaymentStatus();
        if (result.paid) {
          return { chatLink: result.chatLink };
        }
      } catch {
        // Продолжаем пробовать
      }
    }

    // Таймаут — оплата скорее всего прошла, webhook придёт позже
    return { chatLink: null };
  }

  /* ── Check Status (для восстановления сессии) ───────── */
  const checkStatus = useCallback(async (): Promise<boolean> => {
    try {
      const result = await checkPaymentStatus();
      if (result.paid) {
        setState({
          status: "success",
          error: null,
          chatLink: result.chatLink,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  /* ── Reset ──────────────────────────────────────────── */
  const reset = useCallback(() => {
    isProcessing.current = false;
    setState({ status: "idle", error: null, chatLink: null });
  }, []);

  return { state, startPayment, checkStatus, reset };
}

/* ── Helpers ──────────────────────────────────────────── */

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ── Extend TelegramWebApp type ──────────────────────── */

declare global {
  interface TelegramWebApp {
    openInvoice(
      url: string,
      callback: (status: string) => void,
    ): void;
  }
}
