import { NextResponse } from "next/server";
import { getAdminSessionFromCookies, getStudentSessionFromCookies } from "@/lib/auth/session";
import type { SessionPayload } from "@/lib/auth/jwt";

type GuardResult =
  | { ok: true; session: SessionPayload }
  | { ok: false; response: NextResponse };

export async function requireAdminApiSession(): Promise<GuardResult> {
  const admin = await getAdminSessionFromCookies();
  if (admin) return { ok: true, session: admin };

  const student = await getStudentSessionFromCookies();
  if (student) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, message: "غير مصرح لك بهذه العملية." }, { status: 403 }),
    };
  }
  return {
    ok: false,
    response: NextResponse.json({ ok: false, message: "يجب تسجيل الدخول أولًا." }, { status: 401 }),
  };
}

export async function requireStudentApiSession(): Promise<GuardResult> {
  const student = await getStudentSessionFromCookies();
  if (student) return { ok: true, session: student };

  const admin = await getAdminSessionFromCookies();
  if (admin) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, message: "غير مصرح لك بهذه العملية." }, { status: 403 }),
    };
  }
  return {
    ok: false,
    response: NextResponse.json({ ok: false, message: "يجب تسجيل الدخول أولًا." }, { status: 401 }),
  };
}
