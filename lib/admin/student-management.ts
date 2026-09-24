import type { Prisma } from "@prisma/client";
import { getDisplayLevelLabel } from "@/lib/student-level-codes";

/** Max length for admin student search query. */
export const STUDENT_SEARCH_MAX_LEN = 120;

/** Default / max page size for student list. */
export const STUDENT_LIST_DEFAULT_PAGE_SIZE = 20;
export const STUDENT_LIST_MAX_PAGE_SIZE = 50;

/** Exact phrase required in DELETE body for hard delete. */
export const STUDENT_HARD_DELETE_PHRASE = "حذف نهائي";

export const studentSafeSelect = {
  id: true,
  email: true,
  fullName: true,
  academicLevel: true,
  level: true,
  phone: true,
  subscriptionType: true,
  status: true,
  walletBalance: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export type StudentSafeRow = {
  id: string;
  email: string;
  fullName: string;
  academicLevel: string | null;
  level: string;
  phone: string | null;
  subscriptionType: string;
  status: string;
  walletBalance: number;
  createdAt: Date;
};

export function mapStudentSafe(u: StudentSafeRow, extra?: { enrollmentsCount?: number }) {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    academicLevel: u.academicLevel,
    level: u.level,
    levelLabel: getDisplayLevelLabel(u) || u.academicLevel || u.level || "—",
    phone: u.phone,
    subscriptionType: u.subscriptionType,
    status: u.status,
    walletBalance: u.walletBalance,
    createdAt: u.createdAt.toISOString(),
    ...(typeof extra?.enrollmentsCount === "number"
      ? { enrollmentsCount: extra.enrollmentsCount }
      : {}),
  };
}

export function parseStudentSearchQuery(raw: string | null): string {
  return String(raw || "")
    .trim()
    .slice(0, STUDENT_SEARCH_MAX_LEN);
}

export function parsePage(raw: string | null): number {
  const n = Number.parseInt(String(raw || "1"), 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, 10_000);
}

export function parsePageSize(raw: string | null): number {
  const n = Number.parseInt(String(raw || String(STUDENT_LIST_DEFAULT_PAGE_SIZE)), 10);
  if (!Number.isFinite(n) || n < 1) return STUDENT_LIST_DEFAULT_PAGE_SIZE;
  return Math.min(n, STUDENT_LIST_MAX_PAGE_SIZE);
}

/**
 * Server-side search on email / fullName only.
 * Exact email match when query contains @; otherwise case-insensitive contains.
 */
export function studentSearchWhere(q: string): Prisma.UserWhereInput {
  if (!q) return {};
  const lower = q.toLowerCase();
  if (lower.includes("@")) {
    return { email: { equals: lower, mode: "insensitive" } };
  }
  return {
    OR: [
      { email: { contains: lower, mode: "insensitive" } },
      { fullName: { contains: q, mode: "insensitive" } },
    ],
  };
}
