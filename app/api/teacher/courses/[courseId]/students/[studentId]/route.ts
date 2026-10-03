import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeacherApiSession } from "@/lib/auth/api-guards";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { loadTeacherOwnedPaidCourse } from "@/lib/teacher-course-enrollment";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteCtx = { params: { courseId: string; studentId: string } };

/**
 * Remove only the enrollment row. Does not delete the student or touch wallet/status.
 */
export async function DELETE(req: Request, { params }: RouteCtx) {
  const guard = await requireTeacherApiSession();
  if (!guard.ok) return guard.response;

  const ip = getClientIp(req);
  const rate = checkRateLimit({
    key: `teacher-unenroll:${ip}:${guard.session.sub}`,
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
    const course = await loadTeacherOwnedPaidCourse(guard.session.sub, params.courseId);
    if (!course) {
      return NextResponse.json({ ok: false, message: "لا يمكنك إدارة هذه الدورة." }, { status: 403 });
    }

    const studentId = String(params.studentId || "").trim();
    if (!studentId) {
      return NextResponse.json({ ok: false, message: "معرّف الطالب غير صالح." }, { status: 400 });
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, role: true },
    });
    if (!student || student.role !== "STUDENT") {
      return NextResponse.json({ ok: false, message: "هذا الطالب غير مفعّل في هذه الدورة." }, { status: 404 });
    }

    const removed = await prisma.enrollment.deleteMany({
      where: { userId: student.id, packageId: course.id },
    });
    if (removed.count !== 1) {
      return NextResponse.json({ ok: false, message: "هذا الطالب غير مفعّل في هذه الدورة." }, { status: 404 });
    }

    console.info(
      `[TEACHER_COURSE_UNENROLLED] teacher=${guard.session.sub} course=${course.id} student=${student.id}`
    );

    return NextResponse.json({
      ok: true,
      message: "تم إلغاء تفعيل الدورة لهذا الطالب.",
    });
  } catch (e) {
    console.error("[teacher/courses/:id/students/:studentId][DELETE] error");
    return NextResponse.json({ ok: false, message: "تعذّر إلغاء التفعيل." }, { status: 500 });
  }
}
