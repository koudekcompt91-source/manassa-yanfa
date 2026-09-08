import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireFreeStudentApi } from "@/lib/subscription-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type FreeCourseRow = {
  id: string;
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
  ok: false,
  course: null as null,
  lessons: [] as unknown[],
  pdfs: [] as unknown[],
  exams: [] as unknown[],
  data: [] as unknown[],
  error: null as string | null,
};

/**
 * FREE course detail — normalized entities.
 * Null-safe for missing courseVideo / coursePdfs.
 */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireFreeStudentApi();
  if (!guard.ok) return guard.response;

  try {
    const ref = decodeURIComponent(String(params?.id ?? "")).trim();
    if (!ref) {
      return NextResponse.json({ ...EMPTY, message: "الدورة غير موجودة.", error: "not_found" }, { status: 404 });
    }

    let row: FreeCourseRow | null = null;
    try {
      row = (await prisma.course.findFirst({
        where: {
          status: "PUBLISHED",
          system: "FREE",
          OR: [{ id: ref }, { slug: ref }],
        },
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
      })) as FreeCourseRow | null;
    } catch (queryErr) {
      console.error("[free/courses/:id][GET] relation query failed, falling back:", queryErr);
      try {
        row = (await prisma.course.findFirst({
          where: {
            status: "PUBLISHED",
            system: "FREE",
            OR: [{ id: ref }, { slug: ref }],
          },
          select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            system: true,
            status: true,
            videoUrl: true,
          },
        })) as FreeCourseRow | null;
      } catch (fallbackErr) {
        console.error("[free/courses/:id][GET] fallback failed:", fallbackErr);
        return NextResponse.json(
          { ...EMPTY, message: "تعذّر تحميل الدورة.", error: "db_unavailable" },
          { status: 500 }
        );
      }
    }

    if (!row) {
      return NextResponse.json({ ...EMPTY, message: "الدورة غير متاحة.", error: "not_found" }, { status: 404 });
    }

    const videoUrl = row?.courseVideo?.videoUrl ?? row?.videoUrl ?? null;
    const videoId = row?.courseVideo?.id ?? null;

    const course = {
      id: row.id,
      title: row.title ?? "",
      description: row.description ?? "",
      image: row.thumbnailUrl ?? "",
      system: row.system ?? null,
      videoUrl,
      courseVideo: videoUrl ? { id: videoId, videoUrl } : null,
      status: row.status ?? "PUBLISHED",
    };

    const lessons = videoUrl
      ? [
          {
            id: videoId ?? `${row.id}:video`,
            courseId: row.id,
            title: row.title ?? "",
            videoUrl,
          },
        ]
      : [];

    const pdfs = (row?.coursePdfs ?? []).flatMap((p) => {
      const url = p?.url ?? "";
      if (!url) return [];
      return [
        {
          id: p?.id ?? `${row.id}:pdf`,
          courseId: row.id,
          title: p?.title ?? "مستند",
          url,
        },
      ];
    });

    return NextResponse.json({
      ok: true,
      course,
      lessons,
      pdfs,
      exams: [],
      data: [course],
      error: null,
    });
  } catch (e) {
    console.error("[free/courses/:id][GET]", e);
    return NextResponse.json(
      { ...EMPTY, message: "تعذّر تحميل الدورة.", error: "unexpected" },
      { status: 500 }
    );
  }
}
