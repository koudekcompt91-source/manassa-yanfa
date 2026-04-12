import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import {
  setSessionCookie,
  clearOtherSessionCookie,
  clearAllSessionCookies,
} from "@/lib/auth/session";
import type { SessionPayload } from "@/lib/auth/jwt";

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

    console.log(`[login] intent=${intent} email=${email}`);

    step = "validate";
    if (!email || !password) {
      console.log("[login] REJECT: empty email or password");
      return NextResponse.json({ ok: false, message: "أدخل البريد وكلمة المرور." }, { status: 400 });
    }

    step = "find-user";
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`[login] REJECT: user not found for email=${email}`);
      return NextResponse.json({ ok: false, message: "بيانات الدخول غير صحيحة." }, { status: 401 });
    }

    console.log(`[login] user found: id=${user.id} role=${user.role} status=${user.status}`);

    if (user.status !== "ACTIVE") {
      console.log(`[login] REJECT: user status=${user.status}`);
      return NextResponse.json({ ok: false, message: "الحساب غير مفعّل." }, { status: 403 });
    }

    step = "verify-password";
    const passwordOk = await verifyPassword(password, user.passwordHash);
    console.log(`[login] password match=${passwordOk} hashPrefix=${user.passwordHash.substring(0, 7)}`);
    if (!passwordOk) {
      console.log("[login] REJECT: password mismatch");
      return NextResponse.json({ ok: false, message: "بيانات الدخول غير صحيحة." }, { status: 401 });
    }

    step = "check-intent";
    if (intent === "admin" && user.role !== "ADMIN") {
      console.log(`[login] REJECT: intent=admin but role=${user.role}`);
      const res = NextResponse.json(
        { ok: false, code: "ADMIN_PORTAL_STUDENT_ACCOUNT", message: "هذا الحساب ليس حساب إدارة" },
        { status: 403 },
      );
      clearAllSessionCookies(res);
      return res;
    }
    if (intent === "student" && user.role !== "STUDENT") {
      console.log(`[login] REJECT: intent=student but role=${user.role}`);
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
    console.log(`[login] SUCCESS: role=${role} email=${email}`);
    return response;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[login] FAILED at step="${step}":`, msg);
    if (e instanceof Error && e.stack) console.error("[login] stack:", e.stack);
    return NextResponse.json({ ok: false, message: "تعذّر تسجيل الدخول." }, { status: 500 });
  }
}
