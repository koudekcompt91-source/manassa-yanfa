import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import { prisma } from "@/lib/prisma";
import { getCourseProgressForStudent } from "@/lib/progress";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const url = new URL(req.url);
    const filter = String(url.searchParams.get("filter") || "all").toLowerCase();

    const course = await prisma.course.findUnique({
      where: { id: params.id },
      select: { id: true, title: true },
    });
    if (!course) return NextResponse.json({ ok: false, message: "الدورة غير موجودة." }, { status: 404 });

    const enrollments = await prisma.enrollment.findMany({
      where: { packageId: course.id },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { enrolledAt: "desc" },
    });

    const rows = await Promise.all(
      enrollments.map(async (enrollment) => {
        const p = await getCourseProgressForStudent(course.id, enrollment.userId);
        return {
          studentId: enrollment.user.id,
          studentName: enrollment.user.fullName,
          studentEmail: enrollment.user.email,
          progressPercent: p.progressPercent,
          completedLessons: p.completedLessons,
          totalLessons: p.totalLessons,
          submittedAssessments: p.completedAssessments,
          totalAssessments: p.totalAssessments,
          lastActivityAt: p.lastActivityAt ? p.lastActivityAt.toISOString() : null,
          isCompleted: p.isCompleted,
          completionStatus: p.isCompleted ? "completed" : p.progressPercent > 0 ? "in_progress" : "not_started",
        };
      })
    );

    const filtered = rows.filter((row) => {
      if (filter === "completed") return row.completionStatus === "completed";
      if (filter === "in_progress") return row.completionStatus === "in_progress";
      if (filter === "not_started") return row.completionStatus === "not_started";
      return true;
    });

    return NextResponse.json({
      ok: true,
      course: { id: course.id, title: course.title },
      students: filtered,
    });
  } catch (e) {
    console.error("[admin/courses/:id/progress][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل تقدم الطلاب." }, { status: 500 });
  }
}
