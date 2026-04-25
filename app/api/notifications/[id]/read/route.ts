import { NextResponse } from "next/server";
import { getStudentSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const session = await getStudentSessionFromCookies();
  if (!session) return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 401 });

  try {
    const notification = await prisma.notification.findFirst({
      where: { id: params.id, userId: session.sub },
      select: { id: true },
    });
    if (!notification) {
      return NextResponse.json({ ok: false, message: "الإشعار غير موجود." }, { status: 404 });
    }

    await prisma.notification.update({
      where: { id: params.id },
      data: { isRead: true },
    });

    return NextResponse.json({ ok: true, message: "تم تعليم الإشعار كمقروء." });
  } catch (e) {
    console.error("[notifications/:id/read][PATCH] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحديث الإشعار." }, { status: 500 });
  }
}
