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

export async function PATCH(req: Request, { params }: { params: { questionId: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const valid = validateQuestionPayload(await req.json());
    if (!valid.ok) return NextResponse.json({ ok: false, message: valid.message }, { status: 400 });

    const question = await prisma.assessmentQuestion.update({
      where: { id: params.questionId },
      data: {
        questionText: valid.value.questionText,
        type: valid.value.type,
        points: valid.value.points,
        order: valid.value.order,
        options: valid.value.options ?? Prisma.JsonNull,
        correctAnswer: valid.value.correctAnswer ?? Prisma.JsonNull,
      },
    });
    return NextResponse.json({ ok: true, message: "تم تحديث السؤال.", question: normalizeQuestion(question) });
  } catch (e) {
    console.error("[admin/assessment-questions/:id][PATCH] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحديث السؤال." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { questionId: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    await prisma.assessmentQuestion.delete({ where: { id: params.questionId } });
    return NextResponse.json({ ok: true, message: "تم حذف السؤال." });
  } catch (e) {
    console.error("[admin/assessment-questions/:id][DELETE] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر حذف السؤال." }, { status: 500 });
  }
}
