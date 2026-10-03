import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import type { SessionPayload } from "@/lib/auth/jwt";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GENERIC_INVALID = "بيانات الدخول غير صحيحة.";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const ip = getClientIp(req);

    if (!email || !password) {
      return NextResponse.json({ ok: false, message: "أدخل البريد وكلمة المرور." }, { status: 400 });
    }

    const rate = checkRateLimit({
      key: `teacher-login:${ip}:${email || "unknown"}`,
      limit: 8,
      windowMs: 60_000,
    });
    if (!rate.ok) {
      return NextResponse.json(
        { ok: false, message: "عدد محاولات تسجيل الدخول كبير. حاول بعد قليل." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ ok: false, message: GENERIC_INVALID }, { status: 401 });
    }

    const passwordOk = await verifyPassword(password, user.passwordHash);
    if (!passwordOk) {
      return NextResponse.json({ ok: false, message: GENERIC_INVALID }, { status: 401 });
    }

    if (user.role !== "TEACHER") {
      return NextResponse.json({ ok: false, message: GENERIC_INVALID }, { status: 401 });
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json({ ok: false, message: "الحساب غير مفعّل." }, { status: 403 });
    }

    const session: SessionPayload = {
      sub: user.id,
      role: "TEACHER",
      email: user.email,
    };

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });

    await setSessionCookie(response, session);
    return response;
  } catch (e) {
    console.error("[teacher/login] error");
    return NextResponse.json({ ok: false, message: "تعذّر تسجيل الدخول." }, { status: 500 });
  }
}
