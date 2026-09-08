import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudentApiSession } from "@/lib/auth/api-guards";
import { requirePaidStudentApi } from "@/lib/subscription-server";
import { studentSeesPackage } from "@/lib/academic-levels";
import { normalizePaidDiagnosticContent } from "@/lib/paid-diagnostic-content";

export const dynamic = "force-dynamic";

/** Student single diagnostic item — Enrollment/access gated. */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireStudentApiSession();
  if (!guard.ok) return guard.response;
  const paid = await requirePaidStudentApi();
  if (!paid.ok) return paid.response;

  try {
    const viewer = await prisma.user.findUnique({
      where: { id: guard.session.sub },
      select: { role: true, level: true, academicLevel: true },
    });
    if (!viewer || viewer.role !== "STUDENT") {
      return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });
    }

    const row = await prisma.paidDiagnosticContent.findUnique({
      where: { id: params.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            system: true,
            accessType: true,
            status: true,
            level: true,
            academicLevel: true,
          },
        },
      },
    });

    if (!row || !row.isPublished || row.course.system !== "PAID" || row.course.status !== "PUBLISHED") {
      return NextResponse.json({ ok: false, message: "التقوية غير متاحة." }, { status: 404 });
    }

    const levelOk = studentSeesPackage(
      viewer.academicLevel,
      {
        academicLevel: row.academicLevel || row.course.academicLevel,
        level: row.level || row.course.level,
      },
      viewer.level
    );
    if (!levelOk) {
      return NextResponse.json({ ok: false, message: "هذه التقوية غير متاحة لمستواك الدراسي." }, { status: 404 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_packageId: { userId: guard.session.sub, packageId: row.course.id } },
      select: { id: true },
    });
    const canAccess = row.course.accessType === "FREE" || Boolean(enrollment);
    if (!canAccess) {
      return NextResponse.json({ ok: false, message: "لا يمكنك الوصول إلى هذه التقوية." }, { status: 403 });
    }

    return NextResponse.json({
      ok: true,
      item: normalizePaidDiagnosticContent(row),
      canAccess: true,
    });
  } catch (e) {
    console.error("[paid-diagnostics/:id][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل التقوية." }, { status: 500 });
  }
}
