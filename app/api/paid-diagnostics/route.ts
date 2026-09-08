import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudentApiSession } from "@/lib/auth/api-guards";
import { requirePaidStudentApi } from "@/lib/subscription-server";
import { studentSeesPackage } from "@/lib/academic-levels";
import { normalizePaidDiagnosticContent } from "@/lib/paid-diagnostic-content";

export const dynamic = "force-dynamic";

/**
 * Student list of PAID diagnostic content.
 * Filters: isPublished, Course.system=PAID, level, Enrollment/accessType.
 */
export async function GET() {
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

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: guard.session.sub },
      select: { packageId: true },
    });
    const enrolledIds = new Set(enrollments.map((e) => e.packageId));

    const rows = await prisma.paidDiagnosticContent.findMany({
      where: {
        isPublished: true,
        course: {
          system: "PAID",
          status: "PUBLISHED",
        },
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
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

    const visible = rows.filter((row) => {
      const course = row.course;
      const levelOk = studentSeesPackage(
        viewer.academicLevel,
        {
          academicLevel: row.academicLevel || course.academicLevel,
          level: row.level || course.level,
        },
        viewer.level
      );
      if (!levelOk) return false;
      return course.accessType === "FREE" || enrolledIds.has(course.id);
    });

    return NextResponse.json({
      ok: true,
      items: visible.map((row) => normalizePaidDiagnosticContent(row)),
    });
  } catch (e) {
    console.error("[paid-diagnostics][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل التقويات التشخيصية." }, { status: 500 });
  }
}
