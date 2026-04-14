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

export async function POST(req: Request) {
  let step = "init";

  try {
    step = "parse-body";
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    console.log(`[admin-login] email=${email}`);
    console.log("[admin-login] entered password length=", password.length);

    step = "validate";
    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "أدخل البريد وكلمة المرور." },
        { status: 400 }
      );
    }

    step = "find-user";
    const user = await prisma.user.findUnique({ where: { email } });

    console.log("[admin-login] user exists=", !!user);

    if (!user) {
      console.log("[admin-login] user-not-found");
      return NextResponse.json(
        { ok: false, message: "بيانات الدخول غير صحيحة." },
        { status: 401 }
      );
    }

    console.log("[admin-login] db role=", user.role);
    console.log("[admin-login] db status=", user.status);
    console.log(
      "[admin-login] hash prefix=",
      String(user.passwordHash || "").slice(0, 20)
    );

    if (user.role !== "ADMIN") {
      console.log(`[admin-login] role-not-admin role=${user.role}`);
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
      console.log(`[admin-login] inactive-user status=${user.status}`);
      return NextResponse.json(
        { ok: false, message: "الحساب غير مفعّل." },
        { status: 403 }
      );
    }

    step = "verify-password";
    const passwordOk = await verifyPassword(password, user.passwordHash);
    console.log("[admin-login] passwordOk=", passwordOk);

    if (!passwordOk) {
      console.log("[admin-login] password-mismatch");
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

    console.log("[admin-login] SUCCESS");
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[admin-login] FAILED at step="${step}":`, msg);
    if (e instanceof Error && e.stack) {
      console.error("[admin-login] stack:", e.stack);
    }
    return NextResponse.json(
      { ok: false, message: "تعذّر تسجيل دخول الإدارة." },
      { status: 500 }
    );
  }
}