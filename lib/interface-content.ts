import { AnnouncementType } from "@prisma/client";

type UrlValidationOptions = {
  requireHttps?: boolean;
  allowRelativePath?: boolean;
};

function looksLikeRelativePath(value: string) {
  return value.startsWith("/") && !value.startsWith("//");
}

export function normalizeText(value: unknown, maxLength: number): string {
  const text = String(value ?? "").trim();
  if (!text) return "";
  return text.slice(0, maxLength);
}

export function normalizeOptionalText(value: unknown, maxLength: number): string | null {
  const text = normalizeText(value, maxLength);
  return text || null;
}

export function normalizeOrder(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
}

export function parseDateOrNull(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isDateRangeActive(now: Date, startsAt: Date | null, endsAt: Date | null): boolean {
  if (startsAt && startsAt.getTime() > now.getTime()) return false;
  if (endsAt && endsAt.getTime() < now.getTime()) return false;
  return true;
}

export function validateOptionalUrl(
  value: unknown,
  options: UrlValidationOptions = {}
): { value: string | null; error: string | null } {
  const text = normalizeOptionalText(value, 500);
  if (!text) return { value: null, error: null };

  if (options.allowRelativePath && looksLikeRelativePath(text)) {
    return { value: text, error: null };
  }

  try {
    const parsed = new URL(text);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { value: null, error: "الرابط يجب أن يبدأ بـ http أو https." };
    }
    if (options.requireHttps && parsed.protocol !== "https:") {
      return { value: null, error: "الرجاء استخدام رابط https." };
    }
    return { value: text, error: null };
  } catch {
    return { value: null, error: "صيغة الرابط غير صحيحة." };
  }
}

export function normalizeAnnouncementType(value: unknown): AnnouncementType {
  const raw = String(value ?? "").toUpperCase().trim();
  if (raw === "SUCCESS") return "SUCCESS";
  if (raw === "WARNING") return "WARNING";
  if (raw === "URGENT") return "URGENT";
  return "INFO";
}
