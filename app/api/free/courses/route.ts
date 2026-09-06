import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireFreeStudentApi } from "@/lib/subscription-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * FREE dashboard data — normalized entities, never nested content.
 * ONLY filter: status = PUBLISHED. No system / subscription / accessType logic.
 *
 *   courses → { id, title, description, image }
 *   lessons → { id, courseId, title, videoUrl }
 *   pdfs    → { id, courseId, title, url }
 *   exams   → { id, courseId, title, locked }
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
        courseVideo: { select: { id: true, videoUrl: true } },
        coursePdfs: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          select: { id: true, title: true, url: true },
        },
      },
    });

    const courses = rows.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description || "",
      image: c.thumbnailUrl || "",
    }));

    const lessons = rows
      .filter((c) => c.courseVideo?.videoUrl)
      .map((c) => ({
        id: c.courseVideo.id,
        courseId: c.id,
        title: c.title,
        videoUrl: c.courseVideo.videoUrl,
      }));

    const pdfs = rows.flatMap((c) =>
      c.coursePdfs.map((p) => ({
        id: p.id,
        courseId: c.id,
        title: p.title,
        url: p.url,
      }))
    );

    console.log("FREE COURSES API RESPONSE:", {
      courses: courses.length,
      lessons: lessons.length,
      pdfs: pdfs.length,
    });

    return NextResponse.json({ ok: true, courses, lessons, pdfs, exams: [] });
  } catch (e) {
    console.error("[free/courses][GET]", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الدورات المجانية." }, { status: 500 });
  }
}
