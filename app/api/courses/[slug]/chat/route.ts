import { NextResponse } from "next/server";
import { getStudentSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notifyAdminsStudentChatMessage } from "@/lib/server-notifications";

export const dynamic = "force-dynamic";

const MAX_MESSAGE_LEN = 1000;

async function resolveStudentCourseAccess(slugOrId: string, studentId: string) {
  const course = await prisma.course.findFirst({
    where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      accessType: true,
    },
  });
  if (!course || course.status !== "PUBLISHED") return { ok: false as const, code: 404 };

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_packageId: { userId: studentId, packageId: course.id } },
    select: { id: true },
  });
  const enrolled = Boolean(enrollment);
  const canAccessPaid = course.accessType === "FREE" || enrolled;
  if (!canAccessPaid) return { ok: false as const, code: 403 };
  return { ok: true as const, course, enrolled };
}

function normalizeMessage(row: {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
}) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const session = await getStudentSessionFromCookies();
  if (!session) return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 401 });

  try {
    const ref = decodeURIComponent(String(params.slug || "")).trim();
    if (!ref) return NextResponse.json({ ok: false, message: "الدورة غير موجودة." }, { status: 404 });

    const access = await resolveStudentCourseAccess(ref, session.sub);
    if (!access.ok) {
      const status = access.code === 403 ? 403 : 404;
      return NextResponse.json({ ok: false, message: "لا يمكنك الوصول إلى المحادثة." }, { status });
    }

    const conversation = await prisma.chatConversation.upsert({
      where: { courseId_studentId: { courseId: access.course.id, studentId: session.sub } },
      update: {},
      create: {
        courseId: access.course.id,
        studentId: session.sub,
        status: "OPEN",
      },
      select: {
        id: true,
        status: true,
        courseId: true,
        studentId: true,
        createdAt: true,
        updatedAt: true,
        lastMessageAt: true,
      },
    });

    await prisma.chatMessage.updateMany({
      where: {
        conversationId: conversation.id,
        isRead: false,
        senderId: { not: session.sub },
      },
      data: { isRead: true },
    });

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: [{ createdAt: "asc" }],
      select: {
        id: true,
        conversationId: true,
        senderId: true,
        body: true,
        isRead: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      conversation: {
        ...conversation,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
        lastMessageAt: conversation.lastMessageAt ? conversation.lastMessageAt.toISOString() : null,
      },
      messages: messages.map(normalizeMessage),
    });
  } catch (e) {
    console.error("[courses/:slug/chat][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل المحادثة." }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const session = await getStudentSessionFromCookies();
  if (!session) return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 401 });

  try {
    const body = await req.json();
    const text = String(body?.body || "").trim();
    if (!text) return NextResponse.json({ ok: false, message: "نص الرسالة مطلوب." }, { status: 400 });
    if (text.length > MAX_MESSAGE_LEN) {
      return NextResponse.json({ ok: false, message: `أقصى طول للرسالة هو ${MAX_MESSAGE_LEN} حرف.` }, { status: 400 });
    }

    const ref = decodeURIComponent(String(params.slug || "")).trim();
    if (!ref) return NextResponse.json({ ok: false, message: "الدورة غير موجودة." }, { status: 404 });

    const access = await resolveStudentCourseAccess(ref, session.sub);
    if (!access.ok) {
      const status = access.code === 403 ? 403 : 404;
      return NextResponse.json({ ok: false, message: "لا يمكنك الإرسال في هذه المحادثة." }, { status });
    }

    const conversation = await prisma.chatConversation.upsert({
      where: { courseId_studentId: { courseId: access.course.id, studentId: session.sub } },
      update: {},
      create: {
        courseId: access.course.id,
        studentId: session.sub,
        status: "OPEN",
      },
      select: { id: true, status: true },
    });

    if (conversation.status === "CLOSED") {
      return NextResponse.json({ ok: false, message: "تم إغلاق المحادثة من طرف الإدارة." }, { status: 400 });
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

    await notifyAdminsStudentChatMessage(access.course.title, conversation.id);

    return NextResponse.json({
      ok: true,
      message: normalizeMessage(message),
    });
  } catch (e) {
    console.error("[courses/:slug/chat][POST] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر إرسال الرسالة." }, { status: 500 });
  }
}
