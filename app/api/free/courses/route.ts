import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireFreeStudentApi } from "@/lib/subscription-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type FreeCourseRow = {
  id?: string;
  title?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  system?: string | null;
  status?: string | null;
  videoUrl?: string | null;
  courseVideo?: { id?: string | null; videoUrl?: string | null } | null;
  coursePdfs?: Array<{ id?: string | null; title?: string | null; url?: string | null }> | null;
};

const EMPTY = {
  ok: true,
  courses: [] as unknown[],
  lessons: [] as unknown[],
  pdfs: [] as unknown[],
  exams: [] as unknown[],
  data: [] as unknown[],
  error: null as string | null,
};

/**
 * FREE dashboard data — normalized entities, never nested content.
 * ONLY filter: status = PUBLISHED.
 * All DB access is null-safe; failures return empty arrays (never crash).
 */
export async function GET() {
  const guard = await requireFreeStudentApi();
  if (!guard.ok) return guard.response;

  try {
    let rows: FreeCourseRow[] = [];
    try {
      rows = (await prisma.course.findMany({
        where: { status: "PUBLISHED" },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          description: true,
          thumbnailUrl: true,
          system: true,
          status: true,
          videoUrl: true,
          courseVideo: { select: { id: true, videoUrl: true } },
          coursePdfs: {
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
            select: { id: true, title: true, url: true },
          },
        },
      })) as FreeCourseRow[];
    } catch (queryErr) {
      // Fallback if CourseVideo / CoursePDF tables are not ready yet.
      console.error("[free/courses][GET] relation query failed, falling back:", queryErr);
      try {
        rows = (await prisma.course.findMany({
          where: { status: "PUBLISHED" },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            system: true,
            status: true,
            videoUrl: true,
          },
        })) as FreeCourseRow[];
      } catch (fallbackErr) {
        console.error("[free/courses][GET] fallback query failed:", fallbackErr);
        return NextResponse.json({
          ...EMPTY,
          ok: false,
          message: "تعذّر تحميل الدورات المجانية.",
          error: "db_unavailable",
        });
      }
    }

    const safeRows = Array.isArray(rows) ? rows : [];

    const courses = safeRows.map((c) => {
      const videoUrl = c?.courseVideo?.videoUrl ?? c?.videoUrl ?? null;
      const videoId = c?.courseVideo?.id ?? null;
      return {
        id: c?.id ?? "",
        title: c?.title ?? "",
        description: c?.description ?? "",
        image: c?.thumbnailUrl ?? "",
        system: c?.system ?? null,
        videoUrl,
        courseVideo: videoUrl ? { id: videoId, videoUrl } : null,
        status: c?.status ?? "PUBLISHED",
      };
    });

    const lessons = safeRows.flatMap((c) => {
      const videoUrl = c?.courseVideo?.videoUrl ?? c?.videoUrl ?? "";
      if (!videoUrl) return [];
      return [
        {
          id: c?.courseVideo?.id ?? `${c?.id}:video`,
          courseId: c?.id,
          title: c?.title ?? "",
          videoUrl,
        },
      ];
    });

    const pdfs = safeRows.flatMap((c) =>
      (c?.coursePdfs ?? []).flatMap((p) => {
        const url = p?.url ?? "";
        if (!url) return [];
        return [
          {
            id: p?.id ?? `${c?.id}:pdf`,
            courseId: c?.id,
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

    return NextResponse.json({
      ok: true,
      courses,
      lessons,
      pdfs,
      exams: [],
      data: courses,
      error: null,
    });
  } catch (e) {
    console.error("[free/courses][GET]", e);
    return NextResponse.json({
      ...EMPTY,
      ok: false,
      message: "تعذّر تحميل الدورات المجانية.",
      error: "unexpected",
    });
  }
}
