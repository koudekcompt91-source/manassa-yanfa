import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import {
  setSessionCookie,
  clearOtherSessionCookie,
  clearAllSessionCookies,
} from "@/lib/auth/session";
import type { SessionPayload } from "@/lib/auth/jwt";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let step = "init";

  try {
    step = "parse-body";
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    const ip = getClientIp(req);

    step = "validate";
    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "أدخل البريد وكلمة المرور." },
        { status: 400 }
      );
    }

    const rate = checkRateLimit({
      key: `admin-login:${ip}:${email || "unknown"}`,
      limit: 8,
      windowMs: 60_000,
    });
    if (!rate.ok) {
      return NextResponse.json(
        { ok: false, message: "عدد محاولات تسجيل الدخول كبير. حاول بعد قليل." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
      );
    }

    step = "find-user";
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "بيانات الدخول غير صحيحة." },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      const res = NextResponse.json(
        {
          ok: false,
          code: "NOT_ADMIN",
          message: "هذا الحساب ليس حساب إدارة.",
        },
        { status: 403 }
      );
      clearAllSessionCookies(res);
      return res;
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { ok: false, message: "الحساب غير مفعّل." },
        { status: 403 }
      );
    }

    step = "verify-password";
    const passwordOk = await verifyPassword(password, user.passwordHash);

    if (!passwordOk) {
      return NextResponse.json(
        { ok: false, message: "بيانات الدخول غير صحيحة." },
        { status: 401 }
      );
    }

    step = "create-session";
    const session: SessionPayload = {
      sub: user.id,
      role: "ADMIN",
      email: user.email,
    };

    const res = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });

    await setSessionCookie(res, session);
    clearOtherSessionCookie(res, "ADMIN");
    return res;
  } catch (e) {
    console.error(`[admin-login] failed at step="${step}"`);
    return NextResponse.json(
      { ok: false, message: "تعذّر تسجيل دخول الإدارة." },
      { status: 500 }
    );
  }
}