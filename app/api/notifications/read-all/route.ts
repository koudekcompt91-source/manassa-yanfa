import { NextResponse } from "next/server";
import { requireStudentApiSession } from "@/lib/auth/api-guards";
import { prisma } from "@/lib/prisma";

export async function PATCH() {
  const guard = await requireStudentApiSession();
  if (!guard.ok) return guard.response;
  const session = guard.session;

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
