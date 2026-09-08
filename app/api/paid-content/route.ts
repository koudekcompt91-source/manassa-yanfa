import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudentApiSession } from "@/lib/auth/api-guards";
import { requirePaidStudentApi } from "@/lib/subscription-server";
import { studentSeesPackage } from "@/lib/academic-levels";
import {
  normalizePaidFileContent,
  normalizePaidFileContentType,
} from "@/lib/paid-file-content";

export const dynamic = "force-dynamic";

/**
 * Student list of PAID file content (e.g. SUMMARY).
 * Filters: contentType, isPublished, Course.system=PAID, level, Enrollment/accessType.
 */
export async function GET(req: Request) {
  const guard = await requireStudentApiSession();
  if (!guard.ok) return guard.response;
  const paid = await requirePaidStudentApi();
  if (!paid.ok) return paid.response;

  try {
    const { searchParams } = new URL(req.url);
    const typeRaw = searchParams.get("contentType") || "SUMMARY";
    const contentType = normalizePaidFileContentType(typeRaw);
    if (!contentType) {
      return NextResponse.json({ ok: false, message: "نوع المحتوى غير صالح." }, { status: 400 });
    }

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

    const rows = await prisma.paidFileContent.findMany({
      where: {
        contentType,
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
      const canAccess = course.accessType === "FREE" || enrolledIds.has(course.id);
      return canAccess;
    });

    return NextResponse.json({
      ok: true,
      items: visible.map((row) => normalizePaidFileContent(row)),
    });
  } catch (e) {
    console.error("[paid-content][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل المحتوى." }, { status: 500 });
  }
}
