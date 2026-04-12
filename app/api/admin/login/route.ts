import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie, clearOtherSessionCookie } from "@/lib/auth/session";
import type { SessionPayload } from "@/lib/auth/jwt";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let step = "init";
  try {
    step = "parse-body";
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    console.log(`[admin-login] email=${email}`);

    step = "validate";
    if (!email || !password) {
      console.log("[admin-login] REJECT: empty email or password");
      return NextResponse.json({ ok: false, message: "أدخل البريد وكلمة المرور." }, { status: 400 });
    }

    step = "find-user";
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`[admin-login] REJECT: user not found for email=${email}`);
      return NextResponse.json({ ok: false, message: "بيانات الدخول غير صحيحة." }, { status: 401 });
    }

    console.log(`[admin-login] user found: id=${user.id} role=${user.role} status=${user.status}`);

    step = "check-role";
    if (user.role !== "ADMIN") {
      console.log(`[admin-login] REJECT: role=${user.role}, expected ADMIN`);
      return NextResponse.json(
        { ok: false, code: "NOT_ADMIN", message: "هذا الحساب ليس حساب إدارة." },
        { status: 403 },
      );
    }

    step = "check-status";
    if (user.status !== "ACTIVE") {
      console.log(`[admin-login] REJECT: status=${user.status}`);
      return NextResponse.json({ ok: false, message: "الحساب غير مفعّل." }, { status: 403 });
    }

    step = "verify-password";
    const passwordOk = await verifyPassword(password, user.passwordHash);
    console.log(`[admin-login] password match=${passwordOk}`);
    if (!passwordOk) {
      console.log("[admin-login] REJECT: password mismatch");
      return NextResponse.json({ ok: false, message: "بيانات الدخول غير صحيحة." }, { status: 401 });
    }

    step = "create-session";
    const session: SessionPayload = { sub: user.id, role: "ADMIN", email: user.email };

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
    clearOtherSessionCookie(response, "ADMIN");
    console.log(`[admin-login] SUCCESS: email=${email}`);
    return response;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[admin-login] FAILED at step="${step}":`, msg);
    if (e instanceof Error && e.stack) console.error("[admin-login] stack:", e.stack);
    return NextResponse.json({ ok: false, message: "تعذّر تسجيل الدخول." }, { status: 500 });
  }
}
