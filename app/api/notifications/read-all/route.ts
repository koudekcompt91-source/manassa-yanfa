import { NextResponse } from "next/server";
import { getStudentSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function PATCH() {
  const session = await getStudentSessionFromCookies();
  if (!session) return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 401 });

  try {
    await prisma.notification.updateMany({
      where: { userId: session.sub, isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ ok: true, message: "تم تعليم كل الإشعارات كمقروءة." });
  } catch (e) {
    console.error("[notifications/read-all][PATCH] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحديث الإشعارات." }, { status: 500 });
  }
}
