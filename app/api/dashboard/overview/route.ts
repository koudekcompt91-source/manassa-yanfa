import { NextResponse } from "next/server";
import { requireStudentApiSession } from "@/lib/auth/api-guards";
import { prisma } from "@/lib/prisma";
import { getCourseProgressForStudent } from "@/lib/progress";

export async function GET() {
  const guard = await requireStudentApiSession();
  if (!guard.ok) return guard.response;
  const studentId = guard.session.sub;

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: studentId },
      select: { packageId: true },
      orderBy: { enrolledAt: "desc" },
    });
    const courseIds = enrollments.map((row) => row.packageId);
    if (!courseIds.length) {
      return NextResponse.json({
        ok: true,
        summary: {
          myCourses: 0,
          completedCourses: 0,
          inProgressCourses: 0,
          certificatesAvailable: 0,
          upcomingLiveSessions: 0,
          unreadNotifications: 0,
          pendingAssessments: 0,
        },
        upcomingLiveSessions: [],
        pendingAssessments: [],
      });
    }

    const [courses, notificationsUnread, certificatesCount, liveRows, publishedAssessments, submissions] = await Promise.all([
      prisma.course.findMany({
        where: { id: { in: courseIds } },
        select: { id: true, slug: true, title: true },
      }),
      prisma.notification.count({ where: { userId: studentId, isRead: false } }),
      prisma.certificate.count({ where: { studentId, status: "ACTIVE", courseId: { in: courseIds } } }),
      prisma.liveSession.findMany({
        where: {
          courseId: { in: courseIds },
          isPublished: true,
          status: { in: ["SCHEDULED", "LIVE"] },
        },
        select: {
          id: true,
          title: true,
          startsAt: true,
          status: true,
          courseId: true,
          course: { select: { title: true, slug: true } },
        },
        orderBy: [{ startsAt: "asc" }],
        take: 8,
      }),
      prisma.assessment.findMany({
        where: { courseId: { in: courseIds }, isPublished: true },
        select: { id: true, title: true, dueDate: true, courseId: true, course: { select: { title: true, slug: true } } },
      }),
      prisma.assessmentSubmission.findMany({
        where: { studentId, assessment: { courseId: { in: courseIds }, isPublished: true } },
        select: { assessmentId: true },
        distinct: ["assessmentId"],
      }),
    ]);

    const progressRows = await Promise.all(courses.map((course) => getCourseProgressForStudent(course.id, studentId)));
    let completedCourses = 0;
    let inProgressCourses = 0;
    for (const row of progressRows) {
      if (row.isCompleted) completedCourses += 1;
      else if ((row.progressPercent || 0) > 0) inProgressCourses += 1;
    }

    const submittedAssessmentIds = new Set(submissions.map((row) => row.assessmentId));
    const pendingAssessments = publishedAssessments
      .filter((row) => !submittedAssessmentIds.has(row.id))
      .slice(0, 8)
      .map((row) => ({
        id: row.id,
        title: row.title,
        dueDate: row.dueDate ? row.dueDate.toISOString() : null,
        courseTitle: row.course.title,
        courseSlug: row.course.slug,
      }));

    return NextResponse.json({
      ok: true,
      summary: {
        myCourses: courses.length,
        completedCourses,
        inProgressCourses,
        certificatesAvailable: certificatesCount,
        upcomingLiveSessions: liveRows.length,
        unreadNotifications: notificationsUnread,
        pendingAssessments: pendingAssessments.length,
      },
      upcomingLiveSessions: liveRows.map((row) => ({
        id: row.id,
        title: row.title,
        startsAt: row.startsAt.toISOString(),
        status: row.status,
        courseTitle: row.course.title,
        courseSlug: row.course.slug,
      })),
      pendingAssessments,
    });
  } catch (e) {
    console.error("[dashboard/overview][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل بيانات لوحة الطالب." }, { status: 500 });
  }
}
