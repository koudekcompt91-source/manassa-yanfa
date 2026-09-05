import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CourseAccessType, CourseStatus, SubscriptionType } from "@prisma/client";
import { getStudentSessionFromCookies } from "@/lib/auth/session";
import { studentSeesPackage } from "@/lib/academic-levels";
import { isFreeSubscription, studentSeesCourseBySubscription } from "@/lib/subscription";

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
  minSubscription: SubscriptionType;
  system: SubscriptionType;
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
    minSubscription: course.minSubscription,
    type: course.system,
    system: course.system,
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

/**
 * PAID platform catalog (system/type = PAID).
 * Logged-in FREE students get 403. Anonymous browsing remains for marketing pages.
 */
export async function GET() {
  try {
    const session = await getStudentSessionFromCookies();
    if (session?.sub) {
      const viewerCheck = await prisma.user.findUnique({
        where: { id: session.sub },
        select: { role: true, subscriptionType: true },
      });
      if (viewerCheck?.role === "STUDENT" && isFreeSubscription(viewerCheck.subscriptionType)) {
        return NextResponse.json(
          { ok: false, message: "هذه الميزة متاحة للحساب الكامل فقط.", code: "PAID_REQUIRED" },
          { status: 403 }
        );
      }
    }

    const courses = await prisma.course.findMany({
      where: { status: "PUBLISHED", system: "PAID" },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { _count: { select: { lessons: true } } },
    });

    let visible = courses;
    if (session?.sub) {
      const viewer = await prisma.user.findUnique({
        where: { id: session.sub },
        select: { role: true, level: true, academicLevel: true, subscriptionType: true },
      });
      if (viewer?.role === "STUDENT") {
        visible = courses.filter(
          (course) =>
            studentSeesPackage(viewer.academicLevel, course, viewer.level) &&
            studentSeesCourseBySubscription(viewer.subscriptionType, course.minSubscription)
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
