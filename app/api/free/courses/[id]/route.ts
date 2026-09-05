import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireFreeStudentApi } from "@/lib/subscription-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * FREE dashboard course detail.
 * TEMP: system filter disabled to match catalog fallback.
 */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireFreeStudentApi();
  if (!guard.ok) return guard.response;

  try {
    const ref = decodeURIComponent(String(params.id || "")).trim();
    if (!ref) {
      return NextResponse.json({ ok: false, message: "الدورة غير موجودة." }, { status: 404 });
    }

    const course = await prisma.course.findFirst({
      where: {
        status: "PUBLISHED",
        OR: [{ id: ref }, { slug: ref }],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        videoUrl: true,
        thumbnailUrl: true,
        level: true,
        academicLevel: true,
      },
    });

    if (!course) {
      return NextResponse.json({ ok: false, message: "الدورة غير متاحة." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      course: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description || "",
        videoUrl: course.videoUrl || "",
        coverImage: course.thumbnailUrl || "",
        level: course.level || "",
        academicLevel: course.academicLevel || "",
      },
    });
  } catch (e) {
    console.error("[free/courses/:id][GET]", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الدورة." }, { status: 500 });
  }
}
