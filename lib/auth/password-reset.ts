import { createHash, randomBytes } from "crypto";

/** Password reset links expire after 1 hour. */
export const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export const PASSWORD_RESET_GENERIC_MESSAGE =
  "إذا كان البريد الإلكتروني مرتبطًا بحساب، فسيتم إرسال رابط إعادة تعيين كلمة المرور.";

export const MIN_PASSWORD_LENGTH = 6;

/** Generate a high-entropy opaque token (never store raw value). */
export function generatePasswordResetToken(): string {
  return randomBytes(32).toString("base64url");
}

/** SHA-256 hex digest — store this in PasswordResetToken.tokenHash only. */
export function hashPasswordResetToken(rawToken: string): string {
  return createHash("sha256").update(String(rawToken || ""), "utf8").digest("hex");
}

export function passwordResetExpiryDate(from = new Date()): Date {
  return new Date(from.getTime() + PASSWORD_RESET_TOKEN_TTL_MS);
}
