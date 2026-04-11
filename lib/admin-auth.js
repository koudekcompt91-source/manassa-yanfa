/** Seeded accounts (see prisma/seed.ts). UI hints only — real auth is cookie + DB. */

export const SEEDED_ADMIN = { email: "admin@yanfa.app", passwordHint: "admin123" };
export const SEEDED_STUDENT = { email: "student@yanfa.app", passwordHint: "student123" };

export async function logoutSession() {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}
