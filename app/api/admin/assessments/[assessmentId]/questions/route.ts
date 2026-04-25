import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import { validateQuestionPayload } from "@/lib/assessments";

function normalizeQuestion(row: {
  id: string;
  assessmentId: string;
  questionText: string;
  type: string;
  options: any;
  correctAnswer: any;
  points: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function GET(_: Request, { params }: { params: { assessmentId: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  const questions = await prisma.assessmentQuestion.findMany({
    where: { assessmentId: params.assessmentId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ ok: true, questions: questions.map(normalizeQuestion) });
}

export async function POST(req: Request, { params }: { params: { assessmentId: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: params.assessmentId },
      select: { id: true },
    });
    if (!assessment) return NextResponse.json({ ok: false, message: "الواجب/الاختبار غير موجود." }, { status: 404 });

    const valid = validateQuestionPayload(await req.json());
    if (!valid.ok) return NextResponse.json({ ok: false, message: valid.message }, { status: 400 });

    const question = await prisma.assessmentQuestion.create({
      data: {
        assessmentId: assessment.id,
        questionText: valid.value.questionText,
        type: valid.value.type,
        points: valid.value.points,
        order: valid.value.order,
        options: valid.value.options ?? Prisma.JsonNull,
        correctAnswer: valid.value.correctAnswer ?? Prisma.JsonNull,
      },
    });

    return NextResponse.json({ ok: true, message: "تمت إضافة السؤال.", question: normalizeQuestion(question) });
  } catch (e) {
    console.error("[admin/assessments/:id/questions][POST] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر إضافة السؤال." }, { status: 500 });
  }
}
