import { NextResponse } from "next/server";
import { requireStudentApiSession } from "@/lib/auth/api-guards";
import { prisma } from "@/lib/prisma";
import { getCourseProgressForStudent } from "@/lib/progress";

export async function GET() {
  const guard = await requireStudentApiSession();
  if (!guard.ok) return guard.response;
  const session = guard.session;

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.sub },
      orderBy: { enrolledAt: "desc" },
      select: { packageId: true, enrolledAt: true },
    });
    const courseIds = enrollments.map((e) => e.packageId);
    if (!courseIds.length) return NextResponse.json({ ok: true, courses: [] });

    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, slug: true, title: true, thumbnailUrl: true },
    });

    const progressRows = await Promise.all(
      courses.map(async (course) => ({
        course,
        progress: await getCourseProgressForStudent(course.id, session.sub),
      }))
    );
    const certificates = await prisma.certificate.findMany({
      where: { studentId: session.sub, courseId: { in: courseIds } },
      select: { courseId: true, certificateCode: true, status: true },
    });
    const certByCourseId = new Map(certificates.map((row) => [row.courseId, row]));

    const lastLessonIds = progressRows
      .map((row) => row.progress.lastLessonId)
      .filter((value): value is string => typeof value === "string" && value.length > 0);
    const lastLessons = lastLessonIds.length
      ? await prisma.lesson.findMany({
          where: { id: { in: lastLessonIds } },
          select: { id: true, title: true },
        })
      : [];
    const lessonTitleById = new Map(lastLessons.map((lesson) => [lesson.id, lesson.title]));

    return NextResponse.json({
      ok: true,
      courses: progressRows.map((row) => ({
        id: row.course.id,
        slug: row.course.slug,
        title: row.course.title,
        coverImage: row.course.thumbnailUrl,
        progressPercent: row.progress.progressPercent,
        completedLessons: row.progress.completedLessons,
        totalLessons: row.progress.totalLessons,
        completedAssessments: row.progress.completedAssessments,
        totalAssessments: row.progress.totalAssessments,
        lastActivityAt: row.progress.lastActivityAt ? row.progress.lastActivityAt.toISOString() : null,
        lastLessonId: row.progress.lastLessonId,
        lastLessonTitle: row.progress.lastLessonId ? lessonTitleById.get(row.progress.lastLessonId) || "" : "",
        isCompleted: row.progress.isCompleted,
        certificateCode: certByCourseId.get(row.course.id)?.certificateCode || null,
        certificateStatus: certByCourseId.get(row.course.id)?.status || null,
      })),
    });
  } catch (e) {
    console.error("[progress/dashboard][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل تقدم الدورات." }, { status: 500 });
  }
}
