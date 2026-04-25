import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireStudentApiSession } from "@/lib/auth/api-guards";
import { resolveStudentCourseAccessByRef } from "@/lib/course-access";
import { prisma } from "@/lib/prisma";
import { sanitizeAssessmentAnswer } from "@/lib/assessments";

export async function POST(req: Request, { params }: { params: { slug: string; assessmentId: string } }) {
  const guard = await requireStudentApiSession();
  if (!guard.ok) return guard.response;
  const session = guard.session;

  try {
    const ref = decodeURIComponent(String(params.slug || "")).trim();
    const assessmentId = String(params.assessmentId || "").trim();
    if (!ref || !assessmentId) return NextResponse.json({ ok: false, message: "التقييم غير موجود." }, { status: 404 });

    const access = await resolveStudentCourseAccessByRef(ref, session.sub);
    if (!access.ok) {
      const status = access.code === 403 ? 403 : 404;
      return NextResponse.json({ ok: false, message: "لا يمكنك إرسال هذا التقييم." }, { status });
    }

    const assessment = await prisma.assessment.findFirst({
      where: { id: assessmentId, courseId: access.course.id, isPublished: true },
      include: { questions: { orderBy: [{ order: "asc" }] } },
    });
    if (!assessment) return NextResponse.json({ ok: false, message: "التقييم غير متاح." }, { status: 404 });

    const latestSubmission = await prisma.assessmentSubmission.findFirst({
      where: { assessmentId: assessment.id, studentId: session.sub },
      orderBy: [{ createdAt: "desc" }],
      select: { id: true },
    });
    if (latestSubmission && !assessment.allowRetake) {
      return NextResponse.json({ ok: false, message: "تم إرسال هذا التقييم مسبقًا." }, { status: 400 });
    }

    const body = await req.json();
    const answersRaw = Array.isArray(body?.answers) ? body.answers : [];
    const answerMap = new Map<string, any>();
    answersRaw.forEach((row: any) => {
      const questionId = String(row?.questionId || "");
      if (questionId) answerMap.set(questionId, row?.answer);
    });

    const preparedAnswers = assessment.questions.map((question) => {
      const sanitized = sanitizeAssessmentAnswer(question.type, answerMap.get(question.id));
      return { question, answer: sanitized };
    });

    if (!preparedAnswers.some((row) => row.answer !== null)) {
      return NextResponse.json({ ok: false, message: "أدخل إجابة واحدة على الأقل قبل الإرسال." }, { status: 400 });
    }

    let score = 0;
    let maxScore = 0;
    let hasWritten = false;

    const submission = await prisma.$transaction(async (tx) => {
      const createdSubmission = await tx.assessmentSubmission.create({
        data: {
          assessmentId: assessment.id,
          studentId: session.sub,
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
      });

      for (const row of preparedAnswers) {
        const points = Number(row.question.points || 0);
        maxScore += points;

        let isCorrect: boolean | null = null;
        let pointsAwarded = 0;

        if (row.question.type === "WRITTEN") {
          hasWritten = true;
          isCorrect = null;
          pointsAwarded = 0;
        } else if (row.answer) {
          if (row.question.type === "MULTIPLE_CHOICE") {
            const correctOption = Number((row.question.correctAnswer as any)?.correctOption);
            isCorrect = Number((row.answer as any)?.selectedOption) === correctOption;
          } else if (row.question.type === "TRUE_FALSE") {
            isCorrect = Boolean((row.answer as any)?.value) === Boolean((row.question.correctAnswer as any)?.value);
          }
          pointsAwarded = isCorrect ? points : 0;
        }

        score += pointsAwarded;

        await tx.assessmentAnswer.create({
          data: {
            submissionId: createdSubmission.id,
            questionId: row.question.id,
            answer: row.answer ?? Prisma.JsonNull,
            isCorrect,
            pointsAwarded,
          },
        });
      }

      const status = hasWritten ? "PENDING_CORRECTION" : "CORRECTED";
      return tx.assessmentSubmission.update({
        where: { id: createdSubmission.id },
        data: {
          status,
          score,
          maxScore,
          correctedAt: hasWritten ? null : new Date(),
        },
      });
    });

    return NextResponse.json({
      ok: true,
      message: "تم إرسال الإجابات بنجاح.",
      submission: {
        ...submission,
        submittedAt: submission.submittedAt ? submission.submittedAt.toISOString() : null,
        correctedAt: submission.correctedAt ? submission.correctedAt.toISOString() : null,
        createdAt: submission.createdAt.toISOString(),
        updatedAt: submission.updatedAt.toISOString(),
      },
    });
  } catch (e) {
    console.error("[courses/:slug/assessments/:id/submit][POST] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر إرسال الإجابات." }, { status: 500 });
  }
}
