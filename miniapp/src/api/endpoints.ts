/* ============================================================
 * 🌿 API Endpoints — Типизированные вызовы к FastAPI бэкенду
 * ============================================================ */

import { api } from "./client";
import type {
  LandingContent,
  AuthorCard,
  MethodItem,
  CourseInfo,
  CourseDay,
  CourseResult,
  CaseStudy,
  QuizQuestion,
  TextsMap,
  Photo,
  DesignTokens,
} from "../types";

/* ── Public (для пользователей) ───────────────────────── */

/** Получить весь контент лендинга */
export const fetchContent = () =>
  api.get<LandingContent>("/content");

/** Сохранить результат квиза */
export const submitQuizResult = (data: {
  totalScore: number;
  maxScore: number;
  answers: Record<number, number>;
}) => api.post<{ ok: boolean }>("/quiz/result", data);

/* ── Payment ──────────────────────────────────────────── */

/** Создать invoice для Telegram Stars */
export const createInvoice = () =>
  api.post<{ invoiceUrl: string }>("/payment/create-invoice");

/** Подтвердить оплату (после successful_payment) */
export const confirmPayment = (data: {
  telegramPaymentChargeId: string;
  providerPaymentChargeId: string;
}) => api.post<{ ok: boolean; chatLink: string }>("/payment/confirm", data);

/** Проверить статус оплаты */
export const checkPaymentStatus = () =>
  api.get<{
    paid: boolean;
    chatLink: string | null;
    paidAt: string | null;
  }>("/payment/status");

/* ── Admin ────────────────────────────────────────────── */

export const adminApi = {
  /** Проверить, является ли пользователь админом */
  checkAdmin: () =>
    api.get<{ isAdmin: boolean }>("/admin/check"),

  /** Сохранить тексты */
  saveTexts: (texts: TextsMap) =>
    api.put("/admin/texts", texts),

  /** Загрузить фото */
  uploadPhoto: (slot: string, file: File) =>
    api.upload<{ url: string }>(`/admin/photos/${slot}`, file),

  /** Обновить данные фото */
  savePhotos: (photos: Record<string, Photo>) =>
    api.put("/admin/photos", photos),

  /** Сохранить карточки автора */
  saveAuthorCards: (cards: AuthorCard[]) =>
    api.put("/admin/author-cards", cards),

  /** Сохранить пункты метода */
  saveMethodItems: (items: MethodItem[]) =>
    api.put("/admin/method-items", items),

  /** Сохранить инфо курса */
  saveCourseInfo: (info: CourseInfo) =>
    api.put("/admin/course-info", info),

  /** Сохранить дни курса */
  saveCourseDays: (days: CourseDay[]) =>
    api.put("/admin/course-days", days),

  /** Сохранить метрики */
  saveCourseResults: (results: CourseResult[]) =>
    api.put("/admin/course-results", results),

  /** Сохранить кейсы */
  saveCases: (cases: CaseStudy[]) =>
    api.put("/admin/cases", cases),

  /** Сохранить вопросы квиза */
  saveQuizQuestions: (questions: QuizQuestion[]) =>
    api.put("/admin/quiz-questions", questions),

  /** Сохранить дизайн-токены */
  saveDesign: (tokens: DesignTokens) =>
    api.put("/admin/design", tokens),

  /** Сохранить настройки (блоки, цена, ссылки) */
  saveSettings: (settings: {
    blocks: Record<string, boolean>;
    pricing: { priceStars: number; oldPriceStars: number; priceRub: number };
    links: { privateChatLink: string; supportBot: string; channelLink: string };
  }) => api.put("/admin/settings", settings),
};
