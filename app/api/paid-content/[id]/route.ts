import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudentApiSession } from "@/lib/auth/api-guards";
import { requirePaidStudentApi } from "@/lib/subscription-server";
import { studentSeesPackage } from "@/lib/academic-levels";
import { normalizePaidFileContent } from "@/lib/paid-file-content";

export const dynamic = "force-dynamic";

/** Student single PAID file item — Enrollment/access gated; hides fileUrl if locked. */
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

    const row = await prisma.paidFileContent.findUnique({
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
      return NextResponse.json({ ok: false, message: "المحتوى غير متاح." }, { status: 404 });
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
      return NextResponse.json({ ok: false, message: "هذا المحتوى غير متاح لمستواك الدراسي." }, { status: 404 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_packageId: { userId: guard.session.sub, packageId: row.course.id } },
      select: { id: true },
    });
    const canAccess = row.course.accessType === "FREE" || Boolean(enrollment);
    if (!canAccess) {
      return NextResponse.json({ ok: false, message: "لا يمكنك الوصول إلى هذا المحتوى." }, { status: 403 });
    }

    const item = normalizePaidFileContent(row);
    return NextResponse.json({ ok: true, item, canAccess: true });
  } catch (e) {
    console.error("[paid-content/:id][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل المحتوى." }, { status: 500 });
  }
}
