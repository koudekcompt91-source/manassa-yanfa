import { NextResponse } from "next/server";
import { requireStudentApiSession } from "@/lib/auth/api-guards";
import { resolveStudentCourseAccessByRef } from "@/lib/course-access";
import { prisma } from "@/lib/prisma";
import { getCourseProgressForStudent } from "@/lib/progress";
import { issueCertificateIfEligible } from "@/lib/certificates";

export async function POST(req: Request, { params }: { params: { slug: string; lessonId: string } }) {
  const guard = await requireStudentApiSession();
  if (!guard.ok) return guard.response;
  const session = guard.session;

  try {
    const ref = decodeURIComponent(String(params.slug || "")).trim();
    const lessonId = String(params.lessonId || "").trim();
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "").trim().toUpperCase();
    if (!ref || !lessonId) return NextResponse.json({ ok: false, message: "الدرس غير موجود." }, { status: 404 });
    if (action !== "STARTED" && action !== "COMPLETED") {
      return NextResponse.json({ ok: false, message: "الإجراء غير صالح." }, { status: 400 });
    }

    const access = await resolveStudentCourseAccessByRef(ref, session.sub);
    if (!access.ok) {
      const status = access.code === 403 ? 403 : 404;
      return NextResponse.json({ ok: false, message: "لا يمكنك تحديث تقدم هذا الدرس." }, { status });
    }

    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, courseId: access.course.id, isPublished: true },
      select: { id: true },
    });
    if (!lesson) return NextResponse.json({ ok: false, message: "الدرس غير متاح." }, { status: 404 });

    await prisma.lessonProgress.upsert({
      where: { studentId_lessonId: { studentId: session.sub, lessonId: lesson.id } },
      update:
        action === "COMPLETED"
          ? { status: "COMPLETED", completedAt: new Date() }
          : {},
      create: {
        studentId: session.sub,
        courseId: access.course.id,
        lessonId: lesson.id,
        status: action === "COMPLETED" ? "COMPLETED" : "STARTED",
        completedAt: action === "COMPLETED" ? new Date() : null,
      },
    });

    const progress = await getCourseProgressForStudent(access.course.id, session.sub);
    const certificate = progress.isCompleted ? await issueCertificateIfEligible(access.course.id, session.sub) : null;
    return NextResponse.json({
      ok: true,
      progress: {
        ...progress,
        lastActivityAt: progress.lastActivityAt ? progress.lastActivityAt.toISOString() : null,
        completedAt: progress.completedAt ? progress.completedAt.toISOString() : null,
        certificateCode: certificate?.certificateCode || null,
        certificateStatus: certificate?.status || null,
      },
    });
  } catch (e) {
    console.error("[courses/:slug/lessons/:id/progress][POST] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحديث تقدم الدرس." }, { status: 500 });
  }
}
