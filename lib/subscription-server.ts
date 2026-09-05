import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentSessionFromCookies } from "@/lib/auth/session";
import {
  getStudentHomePath,
  isFreeSubscription,
  normalizeSubscriptionType,
  type SubscriptionType,
} from "@/lib/subscription";

export type StudentSubscriptionContext = {
  userId: string;
  subscriptionType: SubscriptionType;
};

/** Resolve logged-in student subscription from DB (JWT unchanged). */
export async function resolveStudentSubscription(): Promise<StudentSubscriptionContext | null> {
  const session = await getStudentSessionFromCookies();
  if (!session?.sub) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, role: true, status: true, subscriptionType: true },
  });

  if (!user || user.role !== "STUDENT" || user.status !== "ACTIVE") return null;

  return {
    userId: user.id,
    subscriptionType: normalizeSubscriptionType(user.subscriptionType),
  };
}

/** Server layout guard: PAID-only routes (/dashboard, /store). */
export async function requirePaidStudentPage() {
  const ctx = await resolveStudentSubscription();
  if (!ctx) redirect("/login");
  if (isFreeSubscription(ctx.subscriptionType)) redirect("/free-dashboard");
  return ctx;
}

/** Server layout guard: FREE-only routes (/free-dashboard). */
export async function requireFreeStudentPage() {
  const ctx = await resolveStudentSubscription();
  if (!ctx) redirect("/login");
  if (!isFreeSubscription(ctx.subscriptionType)) redirect(getStudentHomePath(ctx.subscriptionType));
  return ctx;
}

/** API guard: block FREE students from paid-only APIs (store, etc.). */
export async function requirePaidStudentApi(): Promise<
  | { ok: true; ctx: StudentSubscriptionContext }
  | { ok: false; response: NextResponse }
> {
  const ctx = await resolveStudentSubscription();
  if (!ctx) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, message: "يجب تسجيل الدخول أولًا." }, { status: 401 }),
    };
  }
  if (isFreeSubscription(ctx.subscriptionType)) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "هذه الميزة متاحة للحساب الكامل فقط.", code: "PAID_REQUIRED" },
        { status: 403 }
      ),
    };
  }
  return { ok: true, ctx };
}

/** API guard: FREE LMS endpoints — students with FREE subscription only. */
export async function requireFreeStudentApi(): Promise<
  | { ok: true; ctx: StudentSubscriptionContext }
  | { ok: false; response: NextResponse }
> {
  const ctx = await resolveStudentSubscription();
  if (!ctx) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, message: "يجب تسجيل الدخول أولًا." }, { status: 401 }),
    };
  }
  if (!isFreeSubscription(ctx.subscriptionType)) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "هذه الميزة متاحة للحساب المجاني فقط.", code: "FREE_REQUIRED" },
        { status: 403 }
      ),
    };
  }
  return { ok: true, ctx };
}
