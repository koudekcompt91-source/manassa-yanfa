import { NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });

  try {
    const conversations = await prisma.chatConversation.findMany({
      orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
      include: {
        course: { select: { id: true, title: true, slug: true } },
        student: { select: { id: true, fullName: true, email: true } },
        messages: {
          orderBy: [{ createdAt: "desc" }],
          take: 1,
          select: { body: true, createdAt: true, senderId: true },
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                sender: { role: "STUDENT" },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      conversations: conversations.map((row) => ({
        id: row.id,
        status: row.status,
        course: row.course,
        student: row.student,
        lastMessageAt: row.lastMessageAt ? row.lastMessageAt.toISOString() : null,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        lastMessage: row.messages[0]
          ? {
              ...row.messages[0],
              createdAt: row.messages[0].createdAt.toISOString(),
            }
          : null,
        unreadCount: row._count.messages,
      })),
    });
  } catch (e) {
    console.error("[admin/chat/conversations][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل المحادثات." }, { status: 500 });
  }
}
