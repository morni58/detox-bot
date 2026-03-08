/* ============================================================
 * 🌿 Format Utilities — Форматирование цен, дат, множественное
 * ============================================================ */

/** Формат числа с пробелами: 1500 → «1 500» */
export function formatNumber(n: number): string {
  return n.toLocaleString("ru-RU");
}

/** Формат цены Stars: 1500 → «⭐ 1 500 Stars» */
export function formatStars(amount: number): string {
  return `⭐ ${formatNumber(amount)} Stars`;
}

/** Формат цены в рублях: 5000 → «5 000 ₽» */
export function formatRub(amount: number): string {
  return `${formatNumber(amount)} ₽`;
}

/**
 * Русские множественные формы:
 *   plural(1, "день", "дня", "дней") → "1 день"
 *   plural(5, "день", "дня", "дней") → "5 дней"
 */
export function plural(
  count: number,
  one: string,
  few: string,
  many: string,
): string {
  const abs = Math.abs(count) % 100;
  const lastDigit = abs % 10;

  if (abs >= 11 && abs <= 19) return `${count} ${many}`;
  if (lastDigit === 1) return `${count} ${one}`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${count} ${few}`;
  return `${count} ${many}`;
}

/** Форматировать дату: "2026-01-15T..." → "15 января 2026" */
export function formatDate(iso: string): string {
  const months = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
  ];
  const d = new Date(iso);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** Сокращённый процент скидки: (2500, 1500) → "–40%" */
export function formatDiscount(oldPrice: number, newPrice: number): string {
  if (!oldPrice || oldPrice <= newPrice) return "";
  const pct = Math.round((1 - newPrice / oldPrice) * 100);
  return `–${pct}%`;
}

/** Клэмп строки до N символов с «…» */
export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1).trimEnd() + "…";
}
