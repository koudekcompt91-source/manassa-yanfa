import { NextResponse } from "next/server";
import { requireStudentApiSession } from "@/lib/auth/api-guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function normalizeNotification(row: {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function GET(req: Request) {
  const guard = await requireStudentApiSession();
  if (!guard.ok) return guard.response;
  const session = guard.session;

  try {
    const url = new URL(req.url);
    const limitRaw = Number(url.searchParams.get("limit") || 20);
    const limit = Math.max(1, Math.min(100, Number.isFinite(limitRaw) ? limitRaw : 20));

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.sub },
        orderBy: [{ createdAt: "desc" }],
        take: limit,
      }),
      prisma.notification.count({
        where: { userId: session.sub, isRead: false },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      notifications: notifications.map(normalizeNotification),
      unreadCount,
    });
  } catch (e) {
    console.error("[notifications][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الإشعارات." }, { status: 500 });
  }
}
