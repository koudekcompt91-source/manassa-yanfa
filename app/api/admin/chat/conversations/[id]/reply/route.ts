import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import { prisma } from "@/lib/prisma";
import { notifyStudentAdminReply } from "@/lib/server-notifications";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

const MAX_MESSAGE_LEN = 1000;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;
  const session = guard.session;

  try {
    const rate = checkRateLimit({
      key: `admin-chat-reply:${getClientIp(req)}:${session.sub}`,
      limit: 30,
      windowMs: 60_000,
    });
    if (!rate.ok) {
      return NextResponse.json(
        { ok: false, message: "عدد الرسائل كبير. حاول بعد قليل." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
      );
    }

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
