import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session";
import type { SessionPayload } from "@/lib/auth/jwt";

type Intent = "student" | "admin";

function parseIntent(value: unknown): Intent {
  const s = String(value ?? "")
    .trim()
    .toLowerCase();
  return s === "admin" ? "admin" : "student";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const intent = parseIntent(body.intent);

    if (!email || !password) {
      return NextResponse.json({ ok: false, message: "أدخل البريد وكلمة المرور." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ ok: false, message: "بيانات الدخول غير صحيحة." }, { status: 401 });
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json({ ok: false, message: "الحساب غير مفعّل." }, { status: 403 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ ok: false, message: "بيانات الدخول غير صحيحة." }, { status: 401 });
    }

    if (intent === "admin" && user.role !== Role.ADMIN) {
      clearSessionCookie();
      return NextResponse.json(
        {
          ok: false,
          code: "ADMIN_PORTAL_STUDENT_ACCOUNT",
          message: "هذا الحساب ليس حساب إدارة",
        },
        { status: 403 }
      );
    }
    if (intent === "student" && user.role !== Role.STUDENT) {
      clearSessionCookie();
      return NextResponse.json(
        {
          ok: false,
          code: "STUDENT_PORTAL_ADMIN_ACCOUNT",
          message: "هذا الحساب خاص بالإدارة",
        },
        { status: 403 }
      );
    }

    const session: SessionPayload = {
      sub: user.id,
      role: user.role === Role.ADMIN ? "ADMIN" : "STUDENT",
      email: user.email,
    };
    await setSessionCookie(session);

    return NextResponse.json({
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
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, message: "تعذّر تسجيل الدخول." }, { status: 500 });
  }
}
