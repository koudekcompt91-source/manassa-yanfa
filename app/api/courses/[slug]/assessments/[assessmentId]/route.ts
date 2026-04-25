import { NextResponse } from "next/server";
import { requireStudentApiSession } from "@/lib/auth/api-guards";
import { resolveStudentCourseAccessByRef } from "@/lib/course-access";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { slug: string; assessmentId: string } }) {
  const guard = await requireStudentApiSession();
  if (!guard.ok) return guard.response;
  const session = guard.session;

  try {
    const ref = decodeURIComponent(String(params.slug || "")).trim();
    const assessmentId = String(params.assessmentId || "").trim();
    if (!ref || !assessmentId) {
      return NextResponse.json({ ok: false, message: "التقييم غير موجود." }, { status: 404 });
    }

    const access = await resolveStudentCourseAccessByRef(ref, session.sub);
    if (!access.ok) {
      const status = access.code === 403 ? 403 : 404;
      return NextResponse.json({ ok: false, message: "لا يمكنك الوصول إلى هذا التقييم." }, { status });
    }

    const assessment = await prisma.assessment.findFirst({
      where: { id: assessmentId, courseId: access.course.id, isPublished: true },
      include: {
        questions: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
      },
    });
    if (!assessment) return NextResponse.json({ ok: false, message: "التقييم غير متاح." }, { status: 404 });

    const latestSubmission = await prisma.assessmentSubmission.findFirst({
      where: { assessmentId: assessment.id, studentId: session.sub },
      orderBy: [{ createdAt: "desc" }],
      include: {
        answers: true,
      },
    });

    const canSubmit = assessment.allowRetake || !latestSubmission;

    return NextResponse.json({
      ok: true,
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        type: assessment.type,
        dueDate: assessment.dueDate ? assessment.dueDate.toISOString() : null,
        allowRetake: assessment.allowRetake,
      },
      questions: assessment.questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        type: q.type,
        points: q.points,
        order: q.order,
        options: q.type === "MULTIPLE_CHOICE" ? q.options : null,
      })),
      canSubmit,
      submission: latestSubmission
        ? {
            id: latestSubmission.id,
            status: latestSubmission.status,
            score: latestSubmission.score,
            maxScore: latestSubmission.maxScore,
            submittedAt: latestSubmission.submittedAt ? latestSubmission.submittedAt.toISOString() : null,
            correctedAt: latestSubmission.correctedAt ? latestSubmission.correctedAt.toISOString() : null,
            answers: latestSubmission.answers.map((ans) => ({
              questionId: ans.questionId,
              answer: ans.answer,
              isCorrect: ans.isCorrect,
              pointsAwarded: ans.pointsAwarded,
              correctionNote: ans.correctionNote,
            })),
          }
        : null,
    });
  } catch (e) {
    console.error("[courses/:slug/assessments/:id][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل التقييم." }, { status: 500 });
  }
}
