import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CourseAccessType, CourseStatus } from "@prisma/client";

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

    return NextResponse.json({
      ok: true,
      courses: courses.map(normalizeCourse),
    });
  } catch (e) {
    console.error("[courses][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الدورات." }, { status: 500 });
  }
}
