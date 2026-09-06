import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireFreeStudentApi } from "@/lib/subscription-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * FREE dashboard data — normalized entities, never nested content.
 * ONLY filter: status = PUBLISHED. No system / subscription / accessType logic.
 *
 *   courses → { id, title, description, image, system, videoUrl?, courseVideo?, status }
 *   lessons → { id, courseId, title, videoUrl }
 *   pdfs    → { id, courseId, title, url }
 *   exams   → { id, courseId, title, locked }
 *
 * courseVideo is a nullable relation: every read goes through optional chaining.
 */
export async function GET() {
  const guard = await requireFreeStudentApi();
  if (!guard.ok) return guard.response;

  try {
    const rows = await prisma.course.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        system: true,
        status: true,
        courseVideo: { select: { id: true, videoUrl: true } },
        coursePdfs: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          select: { id: true, title: true, url: true },
        },
      },
    });

    const safeRows = Array.isArray(rows) ? rows : [];

    const courses = safeRows.map((c) => {
      const videoUrl = c.courseVideo?.videoUrl ?? null;
      const videoId = c.courseVideo?.id ?? null;
      return {
        id: c.id,
        title: c.title ?? "",
        description: c.description ?? "",
        image: c.thumbnailUrl ?? "",
        system: c.system ?? null,
        videoUrl,
        courseVideo: videoUrl ? { id: videoId, videoUrl } : null,
        status: c.status ?? "PUBLISHED",
      };
    });

    // flatMap instead of filter+map: no narrowing assumptions on the nullable relation.
    const lessons = safeRows.flatMap((c) => {
      const videoUrl = c.courseVideo?.videoUrl ?? "";
      if (!videoUrl) return [];
      return [
        {
          id: c.courseVideo?.id ?? `${c.id}:video`,
          courseId: c.id,
          title: c.title ?? "",
          videoUrl,
        },
      ];
    });

    const pdfs = safeRows.flatMap((c) =>
      (c.coursePdfs ?? []).flatMap((p) => {
        const url = p?.url ?? "";
        if (!url) return [];
        return [
          {
            id: p?.id ?? `${c.id}:pdf`,
            courseId: c.id,
            title: p?.title ?? "مستند",
            url,
          },
        ];
      })
    );

    console.log("FREE COURSES API RESPONSE:", {
      courses: courses.length,
      lessons: lessons.length,
      pdfs: pdfs.length,
    });

    return NextResponse.json({ ok: true, courses, lessons, pdfs, exams: [] });
  } catch (e) {
    console.error("[free/courses][GET]", e);
    return NextResponse.json(
      { ok: false, message: "تعذّر تحميل الدورات المجانية.", courses: [], lessons: [], pdfs: [], exams: [] },
      { status: 500 }
    );
  }
}
