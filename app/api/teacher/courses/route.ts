import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeacherApiSession } from "@/lib/auth/api-guards";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const guard = await requireTeacherApiSession();
  if (!guard.ok) return guard.response;

  try {
    const teacher = await prisma.user.findUnique({
      where: { id: guard.session.sub },
      select: { id: true, role: true, status: true },
    });
    if (!teacher || teacher.role !== "TEACHER" || teacher.status !== "ACTIVE") {
      return NextResponse.json({ ok: false, message: "غير مصرح لك بهذه العملية." }, { status: 403 });
    }

    const courses = await prisma.course.findMany({
      where: {
        system: "PAID",
        teacherId: guard.session.sub,
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        accessType: true,
        level: true,
        academicLevel: true,
        createdAt: true,
        _count: { select: { lessons: true } },
      },
    });

    return NextResponse.json({
      ok: true,
      courses: courses.map((course) => ({
        id: course.id,
        slug: course.slug,
        title: course.title,
        status: course.status,
        accessType: course.accessType,
        level: course.level,
        academicLevel: course.academicLevel,
        lessonsCount: course._count.lessons,
        createdAt: course.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    console.error("[teacher/courses][GET] error");
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الدورات." }, { status: 500 });
  }
}
