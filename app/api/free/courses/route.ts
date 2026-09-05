import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireFreeStudentApi } from "@/lib/subscription-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * FREE dashboard catalog — single source of truth.
 * ONLY filter: status = PUBLISHED.
 * No system / subscription / accessType business logic.
 * Media fields come from CourseVideo + CoursePDF tables (shape only).
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
        order: true,
        createdAt: true,
        courseVideo: { select: { videoUrl: true } },
        coursePdfs: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          select: { id: true, title: true, url: true, order: true },
        },
      },
    });

    const payload = courses.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description || "",
      videoUrl: c.courseVideo?.videoUrl || "",
      coverImage: c.thumbnailUrl || "",
      level: c.level || "",
      academicLevel: c.academicLevel || "",
      pdfs: (c.coursePdfs || []).map((p) => ({
        id: p.id,
        title: p.title,
        url: p.url,
        order: p.order,
      })),
    }));

    console.log("FREE COURSES API RESPONSE:", payload);

    return NextResponse.json({ ok: true, courses: payload });
  } catch (e) {
    console.error("[free/courses][GET]", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الدورات المجانية." }, { status: 500 });
  }
}
