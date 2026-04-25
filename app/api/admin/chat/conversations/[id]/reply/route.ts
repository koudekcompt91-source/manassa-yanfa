import { NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notifyStudentAdminReply } from "@/lib/server-notifications";

const MAX_MESSAGE_LEN = 1000;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });

  try {
    const body = await req.json();
    const text = String(body?.body || "").trim();
    if (!text) return NextResponse.json({ ok: false, message: "نص الرد مطلوب." }, { status: 400 });
    if (text.length > MAX_MESSAGE_LEN) {
      return NextResponse.json({ ok: false, message: `أقصى طول للرسالة هو ${MAX_MESSAGE_LEN} حرف.` }, { status: 400 });
    }

    const conversation = await prisma.chatConversation.findUnique({
      where: { id: params.id },
      include: { course: { select: { slug: true } } },
    });
    if (!conversation) return NextResponse.json({ ok: false, message: "المحادثة غير موجودة." }, { status: 404 });
    if (conversation.status === "CLOSED") {
      return NextResponse.json({ ok: false, message: "المحادثة مغلقة. أعد فتحها أولًا." }, { status: 400 });
    }

    const message = await prisma.$transaction(async (tx) => {
      const created = await tx.chatMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: session.sub,
          body: text,
          isRead: false,
        },
      });
      await tx.chatConversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: created.createdAt },
      });
      return created;
    });

    await notifyStudentAdminReply(conversation.studentId, conversation.course?.slug || null);

    return NextResponse.json({
      ok: true,
      message: {
        ...message,
        createdAt: message.createdAt.toISOString(),
      },
    });
  } catch (e) {
    console.error("[admin/chat/conversations/:id/reply][POST] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر إرسال الرد." }, { status: 500 });
  }
}
