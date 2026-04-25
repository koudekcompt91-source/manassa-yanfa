import { NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });

  try {
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!conversation) return NextResponse.json({ ok: false, message: "المحادثة غير موجودة." }, { status: 404 });

    await prisma.chatMessage.updateMany({
      where: {
        conversationId: params.id,
        isRead: false,
        sender: { role: "STUDENT" },
      },
      data: { isRead: true },
    });
    return NextResponse.json({ ok: true, message: "تم تعليم الرسائل كمقروءة." });
  } catch (e) {
    console.error("[admin/chat/conversations/:id/read][PATCH] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحديث حالة القراءة." }, { status: 500 });
  }
}
