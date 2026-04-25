import { NextResponse } from "next/server";
import { requireStudentApiSession } from "@/lib/auth/api-guards";
import { resolveStudentCourseAccessByRef } from "@/lib/course-access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const guard = await requireStudentApiSession();
  if (!guard.ok) return guard.response;
  const session = guard.session;

  try {
    const ref = decodeURIComponent(String(params.slug || "")).trim();
    if (!ref) return NextResponse.json({ ok: false, message: "الدورة غير موجودة." }, { status: 404 });

    const access = await resolveStudentCourseAccessByRef(ref, session.sub);
    if (!access.ok) {
      const status = access.code === 403 ? 403 : 404;
      return NextResponse.json({ ok: false, message: "لا يمكنك الوصول إلى التقييمات." }, { status });
    }

    const assessments = await prisma.assessment.findMany({
      where: { courseId: access.course.id, isPublished: true },
      orderBy: [{ createdAt: "desc" }],
      include: {
        _count: { select: { questions: true, submissions: true } },
        submissions: {
          where: { studentId: session.sub },
          orderBy: [{ createdAt: "desc" }],
          take: 1,
          select: { id: true, status: true, score: true, maxScore: true, submittedAt: true, correctedAt: true },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      assessments: assessments.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        type: row.type,
        isPublished: row.isPublished,
        dueDate: row.dueDate ? row.dueDate.toISOString() : null,
        allowRetake: row.allowRetake,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        questionsCount: row._count.questions,
        mySubmission: row.submissions[0]
          ? {
              ...row.submissions[0],
              submittedAt: row.submissions[0].submittedAt ? row.submissions[0].submittedAt.toISOString() : null,
              correctedAt: row.submissions[0].correctedAt ? row.submissions[0].correctedAt.toISOString() : null,
            }
          : null,
      })),
    });
  } catch (e) {
    console.error("[courses/:slug/assessments][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الواجبات والاختبارات." }, { status: 500 });
  }
}
