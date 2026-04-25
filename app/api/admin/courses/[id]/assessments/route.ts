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
  _count?: { questions: number; submissions: number };
}) {
  return {
    ...row,
    dueDate: row.dueDate ? row.dueDate.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    questionsCount: row._count?.questions ?? 0,
    submissionsCount: row._count?.submissions ?? 0,
  };
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  const assessments = await prisma.assessment.findMany({
    where: { courseId: params.id },
    orderBy: [{ createdAt: "desc" }],
    include: { _count: { select: { questions: true, submissions: true } } },
  });

  return NextResponse.json({ ok: true, assessments: assessments.map(normalizeAssessment) });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const body = await req.json();
    const title = String(body?.title || "").trim();
    const description = String(body?.description || "").trim();
    const type = normalizeAssessmentType(body?.type);
    const isPublished = Boolean(body?.isPublished);
    const allowRetake = Boolean(body?.allowRetake);
    const dueDateRaw = body?.dueDate;
    const dueDate = dueDateRaw ? new Date(dueDateRaw) : null;

    if (!title) return NextResponse.json({ ok: false, message: "عنوان الواجب/الاختبار مطلوب." }, { status: 400 });
    if (dueDateRaw && (!dueDate || Number.isNaN(dueDate.getTime()))) {
      return NextResponse.json({ ok: false, message: "تاريخ الاستحقاق غير صالح." }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: params.id },
      select: { id: true, slug: true },
    });
    if (!course) return NextResponse.json({ ok: false, message: "الدورة غير موجودة." }, { status: 404 });

    const assessment = await prisma.assessment.create({
      data: {
        courseId: course.id,
        title,
        description,
        type,
        isPublished,
        dueDate,
        allowRetake,
      },
      include: { _count: { select: { questions: true, submissions: true } } },
    });

    if (assessment.isPublished) {
      await notifyNewPublishedAssessment(course.id, course.slug);
    }

    return NextResponse.json({ ok: true, message: "تم إنشاء الواجب/الاختبار.", assessment: normalizeAssessment(assessment) });
  } catch (e) {
    console.error("[admin/courses/:id/assessments][POST] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر إنشاء الواجب/الاختبار." }, { status: 500 });
  }
}
