import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireFreeStudentApi } from "@/lib/subscription-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * FREE course detail — normalized entities, never nested content.
 * Same rule as catalog: published only, no system/subscription/accessType logic.
 */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireFreeStudentApi();
  if (!guard.ok) return guard.response;

  try {
    const ref = decodeURIComponent(String(params.id || "")).trim();
    if (!ref) {
      return NextResponse.json({ ok: false, message: "الدورة غير موجودة." }, { status: 404 });
    }

    const row = await prisma.course.findFirst({
      where: {
        status: "PUBLISHED",
        OR: [{ id: ref }, { slug: ref }],
      },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        courseVideo: { select: { id: true, videoUrl: true } },
        coursePdfs: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          select: { id: true, title: true, url: true },
        },
      },
    });

    if (!row) {
      return NextResponse.json({ ok: false, message: "الدورة غير متاحة." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      course: {
        id: row.id,
        title: row.title,
        description: row.description || "",
        image: row.thumbnailUrl || "",
      },
      lessons: row.courseVideo?.videoUrl
        ? [
            {
              id: row.courseVideo.id,
              courseId: row.id,
              title: row.title,
              videoUrl: row.courseVideo.videoUrl,
            },
          ]
        : [],
      pdfs: row.coursePdfs.map((p) => ({
        id: p.id,
        courseId: row.id,
        title: p.title,
        url: p.url,
      })),
      exams: [],
    });
  } catch (e) {
    console.error("[free/courses/:id][GET]", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الدورة." }, { status: 500 });
  }
}
