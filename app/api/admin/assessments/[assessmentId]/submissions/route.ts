import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { assessmentId: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const submissions = await prisma.assessmentSubmission.findMany({
      where: { assessmentId: params.assessmentId },
      orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }],
      include: {
        student: { select: { id: true, fullName: true, email: true } },
        answers: {
          include: {
            question: { select: { id: true, questionText: true, type: true, points: true } },
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      submissions: submissions.map((row) => ({
        ...row,
        submittedAt: row.submittedAt ? row.submittedAt.toISOString() : null,
        correctedAt: row.correctedAt ? row.correctedAt.toISOString() : null,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        answers: row.answers.map((ans) => ({
          ...ans,
          createdAt: ans.createdAt.toISOString(),
          updatedAt: ans.updatedAt.toISOString(),
        })),
      })),
    });
  } catch (e) {
    console.error("[admin/assessments/:id/submissions][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الإجابات." }, { status: 500 });
  }
}
