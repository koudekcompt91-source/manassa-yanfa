import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CourseAccessType, CourseStatus } from "@prisma/client";
import { getStudentSessionFromCookies } from "@/lib/auth/session";
import { studentSeesPackage } from "@/lib/academic-levels";

export const dynamic = "force-dynamic";

function normalizeCourse(course: {
  id: string;
  slug: string;
  title: string;
  description: string;
  categoryId: string | null;
  teacherId: string | null;
  thumbnailUrl: string | null;
  status: CourseStatus;
  accessType: CourseAccessType;
  price: number;
  isFeatured: boolean;
  order: number;
  academicLevel: string | null;
  level: string | null;
  _count?: { lessons: number };
}) {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    categoryId: course.categoryId,
    teacherId: course.teacherId,
    coverImage: course.thumbnailUrl,
    isPublished: course.status === "PUBLISHED",
    status: course.status,
    accessType: course.accessType,
    priceMad: course.price,
    price: course.price,
    priceType: course.accessType === "PAID" ? "premium" : "free",
    isFeatured: course.isFeatured,
    order: course.order,
    academicLevel: course.academicLevel,
    level: course.level,
    lessonsCount: course._count?.lessons ?? 0,
  };
}

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { _count: { select: { lessons: true } } },
    });

    // Strict per-level isolation: a logged-in student only receives courses
    // matching their assigned level. Anonymous visitors keep browsing the full
    // public catalog (access to content is still gated by enrollment/payment).
    let visible = courses;
    const session = await getStudentSessionFromCookies();
    if (session?.sub) {
      const viewer = await prisma.user.findUnique({
        where: { id: session.sub },
        select: { role: true, level: true, academicLevel: true },
      });
      if (viewer?.role === "STUDENT") {
        visible = courses.filter((course) =>
          studentSeesPackage(viewer.academicLevel, course, viewer.level)
        );
      }
    }

    return NextResponse.json({
      ok: true,
      courses: visible.map(normalizeCourse),
    });
  } catch (e) {
    console.error("[courses][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الدورات." }, { status: 500 });
  }
}
