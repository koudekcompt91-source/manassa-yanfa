import { LiveSessionStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notifyNewPublishedLiveSession } from "@/lib/server-notifications";

function normalizeLiveSession(session: {
  id: string;
  courseId: string;
  title: string;
  description: string;
  zoomUrl: string;
  startsAt: Date;
  durationMin: number;
  status: LiveSessionStatus;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...session,
    startsAt: session.startsAt.toISOString(),
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

function parseLiveSessionPayload(body: any) {
  const title = String(body?.title || "").trim();
  const description = String(body?.description || "").trim();
  const zoomUrl = String(body?.zoomUrl || "").trim();
  const startsAtRaw = body?.startsAt;
  const durationMin = Math.max(1, Number(body?.durationMin) || 0);
  const statusRaw = String(body?.status || "SCHEDULED").trim().toUpperCase();
  const isPublished = Boolean(body?.isPublished);
  const startsAtDate = startsAtRaw ? new Date(startsAtRaw) : null;

  if (!title) return { ok: false as const, message: "عنوان الحصة مطلوب." };
  if (!zoomUrl) return { ok: false as const, message: "رابط Zoom مطلوب." };
  try {
    const url = new URL(zoomUrl);
    if (!/^https?:$/.test(url.protocol)) {
      return { ok: false as const, message: "رابط Zoom غير صالح." };
    }
  } catch {
    return { ok: false as const, message: "رابط Zoom غير صالح." };
  }
  if (!startsAtDate || Number.isNaN(startsAtDate.getTime())) {
    return { ok: false as const, message: "موعد بدء الحصة غير صالح." };
  }
  if (!Number.isFinite(durationMin) || durationMin < 1) {
    return { ok: false as const, message: "مدة الحصة يجب أن تكون دقيقة واحدة على الأقل." };
  }

  const allowedStatuses = new Set(["SCHEDULED", "LIVE", "ENDED", "CANCELLED"]);
  const status = allowedStatuses.has(statusRaw) ? (statusRaw as LiveSessionStatus) : "SCHEDULED";

  return {
    ok: true as const,
    value: { title, description, zoomUrl, startsAt: startsAtDate, durationMin, status, isPublished },
  };
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });

  const sessions = await prisma.liveSession.findMany({
    where: { courseId: params.id },
    orderBy: [{ startsAt: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ ok: true, liveSessions: sessions.map(normalizeLiveSession) });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });

  try {
    const valid = parseLiveSessionPayload(await req.json());
    if (!valid.ok) return NextResponse.json({ ok: false, message: valid.message }, { status: 400 });

    const course = await prisma.course.findUnique({ where: { id: params.id }, select: { id: true, slug: true } });
    if (!course) return NextResponse.json({ ok: false, message: "الدورة غير موجودة." }, { status: 404 });

    const liveSession = await prisma.liveSession.create({
      data: {
        courseId: params.id,
        ...valid.value,
      },
    });

    if (liveSession.isPublished) {
      await notifyNewPublishedLiveSession(course.id, course.slug);
    }

    return NextResponse.json({
      ok: true,
      message: "تمت إضافة الحصة المباشرة.",
      liveSession: normalizeLiveSession(liveSession),
    });
  } catch (e) {
    console.error("[admin/courses/:id/live-sessions][POST] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر إضافة الحصة المباشرة." }, { status: 500 });
  }
}
