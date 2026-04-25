import { NextResponse } from "next/server";
import { getStudentSessionFromCookies } from "@/lib/auth/session";
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
  const session = await getStudentSessionFromCookies();
  if (!session) return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 401 });

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
