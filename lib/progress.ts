import { prisma } from "@/lib/prisma";

export async function getCourseProgressForStudent(courseId: string, studentId: string) {
  const [totalLessons, completedLessons, totalAssessments, submittedAssessmentsRows, latestLessonProgress, latestSubmission] =
    await Promise.all([
      prisma.lesson.count({ where: { courseId, isPublished: true } }),
      prisma.lessonProgress.count({ where: { courseId, studentId, status: "COMPLETED" } }),
      prisma.assessment.count({ where: { courseId, isPublished: true } }),
      prisma.assessmentSubmission.findMany({
        where: { studentId, assessment: { courseId, isPublished: true } },
        distinct: ["assessmentId"],
        select: { assessmentId: true },
      }),
      prisma.lessonProgress.findFirst({
        where: { courseId, studentId },
        orderBy: { updatedAt: "desc" },
        select: { lessonId: true, updatedAt: true },
      }),
      prisma.assessmentSubmission.findFirst({
        where: { studentId, assessment: { courseId, isPublished: true } },
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
    ]);

  const submittedAssessments = submittedAssessmentsRows.length;
  const totalItems = totalLessons + totalAssessments;
  const doneItems = completedLessons + submittedAssessments;
  const progressPercent = totalItems > 0 ? Math.min(100, Math.round((doneItems / totalItems) * 100)) : 0;
  const isCompleted = totalItems > 0 && doneItems >= totalItems;

  const lastActivityAt = (() => {
    const lessonAt = latestLessonProgress?.updatedAt?.getTime() || 0;
    const assessAt = latestSubmission?.updatedAt?.getTime() || 0;
    const best = Math.max(lessonAt, assessAt);
    return best > 0 ? new Date(best) : null;
  })();

  return {
    progressPercent,
    completedLessons,
    totalLessons,
    completedAssessments: submittedAssessments,
    totalAssessments,
    lastActivityAt,
    lastLessonId: latestLessonProgress?.lessonId || null,
    isCompleted,
    completedAt: isCompleted ? lastActivityAt : null,
  };
}
