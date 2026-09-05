import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentSessionFromCookies } from "@/lib/auth/session";
import { studentSeesPackage } from "@/lib/academic-levels";
import { isFreeSubscription, studentSeesCourseBySubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  try {
    const ref = decodeURIComponent(String(params.slug || "")).trim();
    if (!ref) return NextResponse.json({ ok: false, message: "الدورة غير موجودة." }, { status: 404 });

    const session = await getStudentSessionFromCookies();
    if (session?.sub) {
      const earlyViewer = await prisma.user.findUnique({
        where: { id: session.sub },
        select: { role: true, subscriptionType: true },
      });
      if (earlyViewer?.role === "STUDENT" && isFreeSubscription(earlyViewer.subscriptionType)) {
        return NextResponse.json(
          { ok: false, message: "هذه الميزة متاحة للحساب الكامل فقط.", code: "PAID_REQUIRED" },
          { status: 403 }
        );
      }
    }

    const course = await prisma.course.findFirst({
      where: {
        system: "PAID",
        OR: [{ slug: ref }, { id: ref }],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        categoryId: true,
        teacherId: true,
        thumbnailUrl: true,
        status: true,
        accessType: true,
        minSubscription: true,
        system: true,
        price: true,
        isFeatured: true,
        order: true,
        academicLevel: true,
        level: true,
      },
    });

    if (!course || course.status !== "PUBLISHED") {
      return NextResponse.json({ ok: false, message: "الدورة غير متاحة." }, { status: 404 });
    }

    let enrolled = false;
    if (session?.sub) {
      const viewer = await prisma.user.findUnique({
        where: { id: session.sub },
        select: { role: true, level: true, academicLevel: true, subscriptionType: true },
      });

      // Block direct-URL access to another level's course for logged-in students.
      if (viewer?.role === "STUDENT" && !studentSeesPackage(viewer.academicLevel, course, viewer.level)) {
        return NextResponse.json(
          { ok: false, message: "هذه الدورة غير متاحة لمستواك الدراسي." },
          { status: 404 }
        );
      }

      // Defense in depth: PAID catalog rows must stay PAID-system only.
      if (
        viewer?.role === "STUDENT" &&
        !studentSeesCourseBySubscription(viewer.subscriptionType, course.minSubscription)
      ) {
        return NextResponse.json(
          { ok: false, message: "هذه الدورة غير متاحة في الحساب المجاني." },
          { status: 403 }
        );
      }

      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_packageId: { userId: session.sub, packageId: course.id } },
        select: { id: true },
      });
      enrolled = !!enrollment;
    }

    const lessons = await prisma.lesson.findMany({
      where: { courseId: course.id, isPublished: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        title: true,
        youtubeUrl: true,
        youtubeVideoId: true,
        description: true,
        order: true,
        isPublished: true,
        durationSec: true,
        isFreePreview: true,
      },
    });

    const canAccessPaid = course.accessType === "FREE" || enrolled;
    const mappedLessons = lessons.map((lesson) => {
      const canWatch = canAccessPaid || lesson.isFreePreview;
      return {
        ...lesson,
        youtubeUrl: canWatch ? lesson.youtubeUrl : null,
        youtubeVideoId: canWatch ? lesson.youtubeVideoId : null,
        locked: !canWatch,
      };
    });

    return NextResponse.json({
      ok: true,
      course: {
        ...course,
        type: course.system,
        coverImage: course.thumbnailUrl,
        isPublished: true,
        priceMad: course.price,
        priceType: course.accessType === "PAID" ? "premium" : "free",
      },
      lessons: mappedLessons,
      enrolled,
      canAccessPaid,
    });
  } catch (e) {
    console.error("[courses/:slug][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الدورة." }, { status: 500 });
  }
}
