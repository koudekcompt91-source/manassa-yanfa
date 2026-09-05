import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireFreeStudentApi } from "@/lib/subscription-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Pull .pdf links from course description when no dedicated PDF field exists. */
function extractPdfs(description: string, courseId: string) {
  const text = String(description || "");
  const matches = text.match(/https?:\/\/[^\s"'<>]+\.pdf(?:\?[^\s"'<>]*)?/gi) || [];
  return matches.map((url, i) => ({
    id: `${courseId}-pdf-${i}`,
    title: `مستند PDF ${i + 1}`,
    url,
  }));
}

/**
 * FREE dashboard catalog — FREE_ALLOWED published courses only.
 * FREE_ALLOWED = system FREE | minSubscription FREE | accessType FREE
 * (excludes pure PAID-gated catalog rows). Frontend must not re-filter.
 */
export async function GET() {
  const guard = await requireFreeStudentApi();
  if (!guard.ok) return guard.response;

  try {
    const courses = await prisma.course.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ system: "FREE" }, { minSubscription: "FREE" }, { accessType: "FREE" }],
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        videoUrl: true,
        thumbnailUrl: true,
        level: true,
        academicLevel: true,
        system: true,
        order: true,
        createdAt: true,
      },
    });

    const payload = courses.map((c) => {
      const pdfs = extractPdfs(c.description || "", c.id);
      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description || "",
        videoUrl: c.videoUrl || "",
        type: c.system,
        system: c.system,
        coverImage: c.thumbnailUrl || "",
        level: c.level || "",
        academicLevel: c.academicLevel || "",
        hasVideo: Boolean(c.videoUrl),
        pdfs,
        hasPdf: pdfs.length > 0,
      };
    });

    console.log("FREE COURSES API RESPONSE:", payload);

    return NextResponse.json({
      ok: true,
      courses: payload,
    });
  } catch (e) {
    console.error("[free/courses][GET]", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الدورات المجانية." }, { status: 500 });
  }
}
