import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentSessionFromCookies } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  try {
    const ref = decodeURIComponent(String(params.slug || "")).trim();
    if (!ref) return NextResponse.json({ ok: false, message: "الدورة غير موجودة." }, { status: 404 });

    const course = await prisma.course.findFirst({
      where: {
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

    const session = await getStudentSessionFromCookies();
    let enrolled = false;
    if (session?.sub) {
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
