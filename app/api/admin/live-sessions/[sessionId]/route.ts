import { LiveSessionStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

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

export async function PATCH(req: Request, { params }: { params: { sessionId: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });

  try {
    const body = await req.json();
    const data: any = {};

    if (body?.title !== undefined) {
      const title = String(body.title || "").trim();
      if (!title) return NextResponse.json({ ok: false, message: "عنوان الحصة مطلوب." }, { status: 400 });
      data.title = title;
    }
    if (body?.description !== undefined) data.description = String(body.description || "").trim();
    if (body?.zoomUrl !== undefined) {
      const zoomUrl = String(body.zoomUrl || "").trim();
      if (!zoomUrl) return NextResponse.json({ ok: false, message: "رابط Zoom مطلوب." }, { status: 400 });
      try {
        const url = new URL(zoomUrl);
        if (!/^https?:$/.test(url.protocol)) {
          return NextResponse.json({ ok: false, message: "رابط Zoom غير صالح." }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ ok: false, message: "رابط Zoom غير صالح." }, { status: 400 });
      }
      data.zoomUrl = zoomUrl;
    }
    if (body?.startsAt !== undefined) {
      const startsAt = new Date(body.startsAt);
      if (Number.isNaN(startsAt.getTime())) {
        return NextResponse.json({ ok: false, message: "موعد بدء الحصة غير صالح." }, { status: 400 });
      }
      data.startsAt = startsAt;
    }
    if (body?.durationMin !== undefined) {
      const durationMin = Math.max(1, Number(body.durationMin) || 0);
      if (!Number.isFinite(durationMin) || durationMin < 1) {
        return NextResponse.json({ ok: false, message: "مدة الحصة يجب أن تكون دقيقة واحدة على الأقل." }, { status: 400 });
      }
      data.durationMin = durationMin;
    }
    if (body?.status !== undefined) {
      const statusRaw = String(body.status || "").trim().toUpperCase();
      const allowed = new Set(["SCHEDULED", "LIVE", "ENDED", "CANCELLED"]);
      if (!allowed.has(statusRaw)) {
        return NextResponse.json({ ok: false, message: "حالة الحصة غير صالحة." }, { status: 400 });
      }
      data.status = statusRaw as LiveSessionStatus;
    }
    if (body?.isPublished !== undefined) data.isPublished = Boolean(body.isPublished);

    const liveSession = await prisma.liveSession.update({
      where: { id: params.sessionId },
      data,
    });
    return NextResponse.json({
      ok: true,
      message: "تم تحديث الحصة المباشرة.",
      liveSession: normalizeLiveSession(liveSession),
    });
  } catch (e) {
    console.error("[admin/live-sessions/:id][PATCH] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحديث الحصة المباشرة." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { sessionId: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });

  try {
    await prisma.liveSession.delete({ where: { id: params.sessionId } });
    return NextResponse.json({ ok: true, message: "تم حذف الحصة المباشرة." });
  } catch (e) {
    console.error("[admin/live-sessions/:id][DELETE] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر حذف الحصة المباشرة." }, { status: 500 });
  }
}
