import { NextResponse } from "next/server";
import { requireStudentApiSession } from "@/lib/auth/api-guards";
import { prisma } from "@/lib/prisma";

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireStudentApiSession();
  if (!guard.ok) return guard.response;
  const session = guard.session;

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
