import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { submissionId: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const body = await req.json();
    const answers = Array.isArray(body?.answers) ? body.answers : [];
    const scoreOverride = body?.scoreOverride;

    const submission = await prisma.assessmentSubmission.findUnique({
      where: { id: params.submissionId },
      include: {
        answers: { include: { question: { select: { id: true, type: true, points: true } } } },
      },
    });
    if (!submission) return NextResponse.json({ ok: false, message: "الإرسال غير موجود." }, { status: 404 });

    const answerMap = new Map(submission.answers.map((row) => [row.id, row]));
    const updates = answers
      .map((item: any) => {
        const answerId = String(item?.answerId || "");
        const existing = answerMap.get(answerId);
        if (!existing) return null;

        const pointsAwarded = Math.max(0, Number(item?.pointsAwarded) || 0);
        const correctionNote = String(item?.correctionNote || "").trim() || null;
        return prisma.assessmentAnswer.update({
          where: { id: answerId },
          data: {
            pointsAwarded: pointsAwarded > existing.question.points ? existing.question.points : pointsAwarded,
            correctionNote,
            isCorrect: existing.question.type === "WRITTEN" ? null : existing.isCorrect,
          },
        });
      })
      .filter(Boolean) as any[];

    if (updates.length) {
      await prisma.$transaction(updates);
    }

    const updatedAnswers = await prisma.assessmentAnswer.findMany({
      where: { submissionId: submission.id },
      include: { question: { select: { points: true } } },
    });

    const computedScore = updatedAnswers.reduce((acc, row) => acc + (Number(row.pointsAwarded) || 0), 0);
    const maxScore = updatedAnswers.reduce((acc, row) => acc + (Number(row.question.points) || 0), 0);
    const hasWritten = updatedAnswers.some((row) => row.isCorrect === null);
    const score = scoreOverride !== undefined ? Math.max(0, Math.round(Number(scoreOverride) || 0)) : computedScore;

    const nextStatus = hasWritten ? "CORRECTED" : "CORRECTED";
    const updated = await prisma.assessmentSubmission.update({
      where: { id: submission.id },
      data: {
        status: nextStatus,
        score,
        maxScore,
        correctedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      message: "تم حفظ التصحيح.",
      submission: {
        ...updated,
        submittedAt: updated.submittedAt ? updated.submittedAt.toISOString() : null,
        correctedAt: updated.correctedAt ? updated.correctedAt.toISOString() : null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (e) {
    console.error("[admin/submissions/:id/correct][PATCH] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر حفظ التصحيح." }, { status: 500 });
  }
}
