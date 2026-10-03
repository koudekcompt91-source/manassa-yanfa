import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteCtx = { params: { courseId: string; studentId: string } };

/** Deletes only the enrollment row. Does not delete the user or touch wallet/status. */
export async function DELETE(req: Request, { params }: RouteCtx) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  const ip = getClientIp(req);
  const rate = checkRateLimit({
    key: `admin-course-unenroll:${ip}:${guard.session.sub}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, message: "عدد الطلبات كبير. حاول بعد قليل." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
    );
  }

  try {
    const courseId = String(params.courseId || "").trim();
    const studentId = String(params.studentId || "").trim();
    if (!courseId || !studentId) {
      return NextResponse.json({ ok: false, message: "بيانات الإلغاء غير صالحة." }, { status: 400 });
    }

    const course = await prisma.course.findFirst({
      where: { id: courseId, system: "PAID" },
      select: { id: true },
    });
    if (!course) {
      return NextResponse.json({ ok: false, message: "الدورة غير موجودة." }, { status: 404 });
    }

    const removed = await prisma.enrollment.deleteMany({
      where: { userId: studentId, packageId: course.id },
    });
    if (removed.count !== 1) {
      return NextResponse.json({ ok: false, message: "هذا الطالب غير مفعّل في هذه الدورة." }, { status: 404 });
    }

    console.info(`[ADMIN_COURSE_UNENROLLED] admin=${guard.session.sub} course=${course.id} student=${studentId}`);

    return NextResponse.json({
      ok: true,
      message: "تم إلغاء تفعيل الدورة لهذا الطالب.",
    });
  } catch {
    console.error("[admin/course-enrollments][DELETE] error");
    return NextResponse.json({ ok: false, message: "تعذّر إلغاء التفعيل." }, { status: 500 });
  }
}
