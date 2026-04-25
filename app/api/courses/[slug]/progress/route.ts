import { NextResponse } from "next/server";
import { requireStudentApiSession } from "@/lib/auth/api-guards";
import { resolveStudentCourseAccessByRef } from "@/lib/course-access";
import { getCourseProgressForStudent } from "@/lib/progress";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const guard = await requireStudentApiSession();
  if (!guard.ok) return guard.response;
  const session = guard.session;

  try {
    const ref = decodeURIComponent(String(params.slug || "")).trim();
    if (!ref) return NextResponse.json({ ok: false, message: "الدورة غير موجودة." }, { status: 404 });

    const access = await resolveStudentCourseAccessByRef(ref, session.sub);
    if (!access.ok) {
      const status = access.code === 403 ? 403 : 404;
      return NextResponse.json({ ok: false, message: "لا يمكنك الوصول إلى تقدم الدورة." }, { status });
    }

    const progress = await getCourseProgressForStudent(access.course.id, session.sub);
    const lessonProgressRows = await prisma.lessonProgress.findMany({
      where: { studentId: session.sub, courseId: access.course.id },
      select: { lessonId: true, status: true },
    });
    return NextResponse.json({
      ok: true,
      progress: {
        ...progress,
        lastActivityAt: progress.lastActivityAt ? progress.lastActivityAt.toISOString() : null,
        completedAt: progress.completedAt ? progress.completedAt.toISOString() : null,
        completedLessonIds: lessonProgressRows.filter((row) => row.status === "COMPLETED").map((row) => row.lessonId),
        startedLessonIds: lessonProgressRows.map((row) => row.lessonId),
      },
    });
  } catch (e) {
    console.error("[courses/:slug/progress][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل تقدم الدورة." }, { status: 500 });
  }
}
