/* ============================================================
 * 🌿 Detox Course — TypeScript Types
 * ============================================================ */

/* ── Design System Tokens ─────────────────────────────── */

export interface DesignTokens {
  primaryColor: string;
  successColor: string;
  bgLight: string;
  bgDark: string;
  fontFamily: string;
  borderRadius: number;
}

export const DEFAULT_TOKENS: DesignTokens = {
  primaryColor: "#10b981",
  successColor: "#22c55e",
  bgLight: "#f8fafc",
  bgDark: "#0f172a",
  fontFamily: "'Telegram Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  borderRadius: 16,
};

/* ── Button Variants ──────────────────────────────────── */

export type ButtonVariant = "primary" | "success" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "xl" | "hero";

/* ── Texts (from DB) ──────────────────────────────────── */

export interface TextEntry {
  section: string;
  field: string;
  value: string;
}

export interface TextsMap {
  [section: string]: {
    [field: string]: string;
  };
}

/* ── Photos ───────────────────────────────────────────── */

export interface Photo {
  slot: string;
  filePath: string;
  altText: string;
  width?: number;
  height?: number;
}

/* ── Author ───────────────────────────────────────────── */

export interface AuthorCard {
  id: number;
  icon: string;
  title: string;
  description: string;
  sortOrder: number;
  isVisible: boolean;
}

/* ── Method ───────────────────────────────────────────── */

export interface MethodItem {
  id: number;
  icon: string;
  title: string;
  description: string;
  sortOrder: number;
  isVisible: boolean;
}

/* ── Course ───────────────────────────────────────────── */

export interface CourseInfo {
  title: string;
  targetAudience: string;
  whyDetoxText: string;
  conditionsText: string;
  guaranteeText: string;
  guaranteeDays: number;
  priceStars: number;
  priceRub?: number;
  oldPriceStars?: number;
  privateChatLink: string;
}

export interface CourseDay {
  id: number;
  dayNumber: number;
  title: string;
  shortDesc: string;
  fullDesc: string;
  tasks: string[];
  icon: string;
  weekNumber: number;
  isVisible: boolean;
}

export interface CourseResult {
  id: number;
  icon: string;
  metricValue: string;
  metricLabel: string;
  description: string;
  sortOrder: number;
}

/* ── Cases ────────────────────────────────────────────── */

export interface CaseStudy {
  id: number;
  clientName: string;
  clientAge?: number;
  resultText: string;
  reviewText: string;
  photoBefore: string;
  photoAfter: string;
  sortOrder: number;
  isVisible: boolean;
}

/* ── Quiz ─────────────────────────────────────────────── */

export interface QuizOption {
  text: string;
  score: number;
}

export interface QuizQuestion {
  id: number;
  questionText: string;
  options: QuizOption[];
  sortOrder: number;
}

/* ── Blocks Visibility ────────────────────────────────── */

export interface BlockVisibility {
  blockKey: string;
  isVisible: boolean;
  sortOrder: number;
  label: string;
}

/* ── Landing Content (full API response) ──────────────── */

export interface LandingContent {
  texts: TextsMap;
  photos: Record<string, Photo>;
  authorCards: AuthorCard[];
  methodItems: MethodItem[];
  courseInfo: CourseInfo;
  courseDays: CourseDay[];
  courseResults: CourseResult[];
  cases: CaseStudy[];
  quizQuestions: QuizQuestion[];
  blocks: Record<string, boolean>;
  settings: Record<string, string>;
}
