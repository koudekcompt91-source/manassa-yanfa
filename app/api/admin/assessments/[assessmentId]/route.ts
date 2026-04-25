import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import { normalizeAssessmentType } from "@/lib/assessments";
import { notifyNewPublishedAssessment } from "@/lib/server-notifications";

function normalizeAssessment(row: {
  id: string;
  courseId: string;
  title: string;
  description: string;
  type: "QUIZ" | "ASSIGNMENT";
  isPublished: boolean;
  dueDate: Date | null;
  allowRetake: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...row,
    dueDate: row.dueDate ? row.dueDate.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function PATCH(req: Request, { params }: { params: { assessmentId: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const existing = await prisma.assessment.findUnique({
      where: { id: params.assessmentId },
      include: { course: { select: { id: true, slug: true } } },
    });
    if (!existing) return NextResponse.json({ ok: false, message: "الواجب/الاختبار غير موجود." }, { status: 404 });

    const body = await req.json();
    const data: any = {};

    if (body?.title !== undefined) {
      const title = String(body.title || "").trim();
      if (!title) return NextResponse.json({ ok: false, message: "العنوان مطلوب." }, { status: 400 });
      data.title = title;
    }
    if (body?.description !== undefined) data.description = String(body.description || "").trim();
    if (body?.type !== undefined) data.type = normalizeAssessmentType(body.type);
    if (body?.allowRetake !== undefined) data.allowRetake = Boolean(body.allowRetake);
    if (body?.isPublished !== undefined) data.isPublished = Boolean(body.isPublished);
    if (body?.dueDate !== undefined) {
      if (!body.dueDate) data.dueDate = null;
      else {
        const date = new Date(body.dueDate);
        if (Number.isNaN(date.getTime())) {
          return NextResponse.json({ ok: false, message: "تاريخ الاستحقاق غير صالح." }, { status: 400 });
        }
        data.dueDate = date;
      }
    }

    const assessment = await prisma.assessment.update({
      where: { id: params.assessmentId },
      data,
    });

    if (!existing.isPublished && assessment.isPublished) {
      await notifyNewPublishedAssessment(existing.course.id, existing.course.slug);
    }

    return NextResponse.json({ ok: true, message: "تم تحديث الواجب/الاختبار.", assessment: normalizeAssessment(assessment) });
  } catch (e) {
    console.error("[admin/assessments/:id][PATCH] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحديث الواجب/الاختبار." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { assessmentId: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    await prisma.assessment.delete({ where: { id: params.assessmentId } });
    return NextResponse.json({ ok: true, message: "تم حذف الواجب/الاختبار." });
  } catch (e) {
    console.error("[admin/assessments/:id][DELETE] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر حذف الواجب/الاختبار." }, { status: 500 });
  }
}
