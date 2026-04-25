import { NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function normalizeMessage(row: {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
  sender: { id: string; fullName: string; email: string; role: string };
}) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });

  try {
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: params.id },
      include: {
        course: { select: { id: true, slug: true, title: true } },
        student: { select: { id: true, fullName: true, email: true } },
      },
    });
    if (!conversation) return NextResponse.json({ ok: false, message: "المحادثة غير موجودة." }, { status: 404 });

    await prisma.chatMessage.updateMany({
      where: {
        conversationId: conversation.id,
        isRead: false,
        sender: { role: "STUDENT" },
      },
      data: { isRead: true },
    });

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: [{ createdAt: "asc" }],
      include: {
        sender: { select: { id: true, fullName: true, email: true, role: true } },
      },
    });

    return NextResponse.json({
      ok: true,
      conversation: {
        id: conversation.id,
        status: conversation.status,
        lastMessageAt: conversation.lastMessageAt ? conversation.lastMessageAt.toISOString() : null,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
        course: conversation.course,
        student: conversation.student,
      },
      messages: messages.map(normalizeMessage),
    });
  } catch (e) {
    console.error("[admin/chat/conversations/:id][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل تفاصيل المحادثة." }, { status: 500 });
  }
}
