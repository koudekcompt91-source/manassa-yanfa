import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireFreeStudentApi } from "@/lib/subscription-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** FREE LMS catalog — system=FREE published courses only. */
export async function GET() {
  const guard = await requireFreeStudentApi();
  if (!guard.ok) return guard.response;

  try {
    const courses = await prisma.course.findMany({
      where: { system: "FREE", status: "PUBLISHED" },
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
        order: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      courses: courses.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description,
        videoUrl: c.videoUrl || "",
        coverImage: c.thumbnailUrl,
        level: c.level,
        academicLevel: c.academicLevel,
        hasVideo: Boolean(c.videoUrl),
      })),
    });
  } catch (e) {
    console.error("[free/courses][GET]", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الدورات المجانية." }, { status: 500 });
  }
}
