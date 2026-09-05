import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireFreeStudentApi } from "@/lib/subscription-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * FREE dashboard data — single source of truth.
 * ONLY filter: status = PUBLISHED. No system / subscription / accessType logic.
 * Returns pre-categorized structures so the UI renders without transforming:
 *   courses     → دروسي
 *   notes       → ملخصاتي (CoursePDF rows)
 *   assignments → فروضي
 */
export async function GET() {
  const guard = await requireFreeStudentApi();
  if (!guard.ok) return guard.response;

  try {
    const courses = await prisma.course.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        level: true,
        academicLevel: true,
        courseVideo: { select: { videoUrl: true } },
        coursePdfs: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          select: { id: true, title: true, url: true, order: true },
        },
      },
    });

    const coursesPayload = courses.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description || "",
      videoUrl: c.courseVideo?.videoUrl || "",
      coverImage: c.thumbnailUrl || "",
      level: c.level || "",
      academicLevel: c.academicLevel || "",
    }));

    const notes = courses.flatMap((c) =>
      (c.coursePdfs || []).map((p) => ({
        id: p.id,
        title: p.title,
        url: p.url,
        courseId: c.id,
        courseTitle: c.title,
      }))
    );

    console.log("FREE COURSES API RESPONSE:", {
      courses: coursesPayload.length,
      notes: notes.length,
    });

    return NextResponse.json({
      ok: true,
      courses: coursesPayload,
      notes,
      assignments: [],
    });
  } catch (e) {
    console.error("[free/courses][GET]", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الدورات المجانية." }, { status: 500 });
  }
}
