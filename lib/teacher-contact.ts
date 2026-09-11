/**
 * Teacher contact channel for PAID students awaiting activation.
 * Set TEACHER_TELEGRAM_URL in env (e.g. https://t.me/YOUR_TEACHER_USERNAME).
 * Never invent a real username; placeholder only when unset.
 */
export const TEACHER_TELEGRAM_URL_PLACEHOLDER = "https://t.me/YOUR_TEACHER_USERNAME";

export function getTeacherTelegramUrl(): string {
  const raw = String(process.env.TEACHER_TELEGRAM_URL || "").trim();
  if (!raw) return TEACHER_TELEGRAM_URL_PLACEHOLDER;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return TEACHER_TELEGRAM_URL_PLACEHOLDER;
    }
    return raw;
  } catch {
    return TEACHER_TELEGRAM_URL_PLACEHOLDER;
  }
}
