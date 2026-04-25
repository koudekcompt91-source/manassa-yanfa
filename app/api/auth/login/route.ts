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

type Intent = "student" | "admin";

function parseIntent(value: unknown, req: Request): Intent {
  const s = String(value ?? "").trim().toLowerCase();
  if (s === "admin") return "admin";
  if (s === "student") return "student";

  const referer = req.headers.get("referer") || "";
  const pathname = (() => {
    try {
      return new URL(referer).pathname;
    } catch {
      return "";
    }
  })();

  if (pathname.startsWith("/admin")) return "admin";
  return "student";
}

export async function POST(req: Request) {
  let step = "init";
  try {
    step = "parse-body";
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const intent = parseIntent(body.intent, req);

    const ip = getClientIp(req);

    step = "validate";
    if (!email || !password) {
      console.log("[login] REJECT: empty email or password");
      return NextResponse.json({ ok: false, message: "أدخل البريد وكلمة المرور." }, { status: 400 });
    }

    const rate = checkRateLimit({
      key: `login:${ip}:${email || "unknown"}`,
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
      return NextResponse.json({ ok: false, message: "بيانات الدخول غير صحيحة." }, { status: 401 });
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json({ ok: false, message: "الحساب غير مفعّل." }, { status: 403 });
    }

    step = "verify-password";
    const passwordOk = await verifyPassword(password, user.passwordHash);
    if (!passwordOk) {
      return NextResponse.json({ ok: false, message: "بيانات الدخول غير صحيحة." }, { status: 401 });
    }

    step = "check-intent";
    if (intent === "admin" && user.role !== "ADMIN") {
      const res = NextResponse.json(
        { ok: false, code: "ADMIN_PORTAL_STUDENT_ACCOUNT", message: "هذا الحساب ليس حساب إدارة" },
        { status: 403 },
      );
      clearAllSessionCookies(res);
      return res;
    }
    if (intent === "student" && user.role !== "STUDENT") {
      const res = NextResponse.json(
        { ok: false, code: "STUDENT_PORTAL_ADMIN_ACCOUNT", message: "هذا الحساب خاص بالإدارة" },
        { status: 403 },
      );
      clearAllSessionCookies(res);
      return res;
    }

    step = "create-session";
    const role = user.role === "ADMIN" ? "ADMIN" as const : "STUDENT" as const;
    const session: SessionPayload = { sub: user.id, role, email: user.email };

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        academicLevel: user.academicLevel,
        level: user.level,
        walletBalance: user.walletBalance,
      },
    });

    await setSessionCookie(response, session);
    clearOtherSessionCookie(response, role);
    return response;
  } catch (e) {
    console.error(`[login] failed at step="${step}"`);
    return NextResponse.json({ ok: false, message: "تعذّر تسجيل الدخول." }, { status: 500 });
  }
}
