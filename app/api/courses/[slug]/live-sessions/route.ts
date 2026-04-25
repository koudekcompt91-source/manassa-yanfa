import { NextResponse } from "next/server";
import { getStudentSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  try {
    const ref = decodeURIComponent(String(params.slug || "")).trim();
    if (!ref) return NextResponse.json({ ok: false, message: "الدورة غير موجودة." }, { status: 404 });

    const course = await prisma.course.findFirst({
      where: { OR: [{ slug: ref }, { id: ref }] },
      select: { id: true, accessType: true, status: true },
    });

    if (!course || course.status !== "PUBLISHED") {
      return NextResponse.json({ ok: false, message: "الدورة غير متاحة." }, { status: 404 });
    }

    const studentSession = await getStudentSessionFromCookies();
    let enrolled = false;
    if (studentSession?.sub) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_packageId: { userId: studentSession.sub, packageId: course.id } },
        select: { id: true },
      });
      enrolled = Boolean(enrollment);
    }

    const canAccessPaid = course.accessType === "FREE" || enrolled;
    const canJoinZoom = Boolean(studentSession?.sub) && canAccessPaid;

    const liveSessions = await prisma.liveSession.findMany({
      where: {
        courseId: course.id,
        isPublished: true,
      },
      orderBy: [{ startsAt: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        title: true,
        description: true,
        zoomUrl: true,
        startsAt: true,
        durationMin: true,
        status: true,
        isPublished: true,
      },
    });

    return NextResponse.json({
      ok: true,
      liveSessions: liveSessions.map((session) => ({
        ...session,
        startsAt: session.startsAt.toISOString(),
        zoomUrl: canJoinZoom ? session.zoomUrl : null,
        canJoin: canJoinZoom,
        locked: !canJoinZoom,
      })),
      enrolled,
      canAccessPaid,
      canJoinZoom,
      requiresEnrollment: course.accessType === "PAID",
    });
  } catch (e) {
    console.error("[courses/:slug/live-sessions][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الحصص المباشرة." }, { status: 500 });
  }
}
