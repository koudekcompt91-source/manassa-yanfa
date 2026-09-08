import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireFreeStudentApi } from "@/lib/subscription-server";
import { normalizeFreeContentType } from "@/lib/free-content-type";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type FreeCourseRow = {
  id?: string;
  title?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  system?: string | null;
  status?: string | null;
  level?: string | null;
  subject?: string | null;
  freeContentType?: string | null;
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
  assignments: [] as unknown[],
  data: [] as unknown[],
  error: null as string | null,
};

function matchesStudentLevel(rowLevel: string | null | undefined, studentLevel: string) {
  const contentLevel = String(rowLevel || "").trim().toUpperCase();
  if (!contentLevel) return true;
  const student = String(studentLevel || "").trim().toUpperCase();
  if (!student || student === "UNKNOWN") return true;
  return contentLevel === student;
}

/**
 * FREE dashboard data — system=FREE only, split by freeContentType.
 */
export async function GET() {
  const guard = await requireFreeStudentApi();
  if (!guard.ok) return guard.response;

  try {
    const viewer = await prisma.user.findUnique({
      where: { id: guard.ctx.userId },
      select: { level: true, academicLevel: true },
    });
    const studentLevel = String(viewer?.level || viewer?.academicLevel || "").trim();

    let rows: FreeCourseRow[] = [];
    try {
      rows = (await prisma.course.findMany({
        where: { status: "PUBLISHED", system: "FREE" },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          description: true,
          thumbnailUrl: true,
          system: true,
          status: true,
          level: true,
          subject: true,
          freeContentType: true,
          videoUrl: true,
          courseVideo: { select: { id: true, videoUrl: true } },
          coursePdfs: {
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
            select: { id: true, title: true, url: true },
          },
        },
      })) as FreeCourseRow[];
    } catch (queryErr) {
      console.error("[free/courses][GET] relation query failed, falling back:", queryErr);
      try {
        rows = (await prisma.course.findMany({
          where: { status: "PUBLISHED", system: "FREE" },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            system: true,
            status: true,
            level: true,
            videoUrl: true,
          },
        })) as FreeCourseRow[];
      } catch (fallbackErr) {
        console.error("[free/courses][GET] fallback query failed:", fallbackErr);
        return NextResponse.json({
          ...EMPTY,
          ok: false,
          message: "تعذّر تحميل المحتوى المجاني.",
          error: "db_unavailable",
        });
      }
    }

    const safeRows = (Array.isArray(rows) ? rows : []).filter((c) =>
      matchesStudentLevel(c?.level, studentLevel)
    );

    const courses = safeRows
      .filter((c) => normalizeFreeContentType(c?.freeContentType) === "COURSE")
      .map((c) => {
        const videoUrl = c?.courseVideo?.videoUrl ?? c?.videoUrl ?? null;
        const videoId = c?.courseVideo?.id ?? null;
        return {
          id: c?.id ?? "",
          title: c?.title ?? "",
          description: c?.description ?? "",
          image: c?.thumbnailUrl ?? "",
          system: "FREE",
          freeContentType: "COURSE",
          subject: c?.subject ?? "",
          level: c?.level ?? "",
          videoUrl,
          courseVideo: videoUrl ? { id: videoId, videoUrl } : null,
          status: c?.status ?? "PUBLISHED",
        };
      });

    const lessons = safeRows.flatMap((c) => {
      if (normalizeFreeContentType(c?.freeContentType) !== "LESSON") return [];
      const videoUrl = c?.courseVideo?.videoUrl ?? c?.videoUrl ?? "";
      if (!videoUrl) return [];
      return [
        {
          id: c?.courseVideo?.id ?? `${c?.id}:video`,
          courseId: c?.id,
          title: c?.title ?? "",
          description: c?.description ?? "",
          subject: c?.subject ?? "",
          level: c?.level ?? "",
          freeContentType: "LESSON",
          videoUrl,
        },
      ];
    });

    const pdfs = safeRows.flatMap((c) => {
      if (normalizeFreeContentType(c?.freeContentType) !== "SUMMARY") return [];
      return (c?.coursePdfs ?? []).flatMap((p) => {
        const url = p?.url ?? "";
        if (!url) return [];
        return [
          {
            id: p?.id ?? `${c?.id}:pdf`,
            courseId: c?.id,
            title: p?.title || c?.title || "ملخص",
            subject: c?.subject ?? "",
            level: c?.level ?? "",
            freeContentType: "SUMMARY",
            url,
          },
        ];
      });
    });

    const assignments = safeRows.flatMap((c) => {
      if (normalizeFreeContentType(c?.freeContentType) !== "ASSIGNMENT") return [];
      const pdfsList = c?.coursePdfs ?? [];
      if (!pdfsList.length) {
        return [
          {
            id: c?.id ?? "",
            courseId: c?.id,
            title: c?.title ?? "",
            subject: c?.subject ?? "",
            level: c?.level ?? "",
            freeContentType: "ASSIGNMENT",
            url: "",
          },
        ];
      }
      return pdfsList.flatMap((p) => {
        const url = p?.url ?? "";
        if (!url) return [];
        return [
          {
            id: p?.id ?? `${c?.id}:assignment`,
            courseId: c?.id,
            title: p?.title || c?.title || "فرض",
            subject: c?.subject ?? "",
            level: c?.level ?? "",
            freeContentType: "ASSIGNMENT",
            url,
          },
        ];
      });
    });

    const exams = safeRows.flatMap((c) => {
      if (normalizeFreeContentType(c?.freeContentType) !== "EXAM") return [];
      const pdfsList = c?.coursePdfs ?? [];
      if (!pdfsList.length) {
        return [
          {
            id: c?.id ?? "",
            courseId: c?.id,
            title: c?.title ?? "",
            subject: c?.subject ?? "",
            level: c?.level ?? "",
            freeContentType: "EXAM",
            url: "",
          },
        ];
      }
      return pdfsList.flatMap((p) => {
        const url = p?.url ?? "";
        if (!url) return [];
        return [
          {
            id: p?.id ?? `${c?.id}:exam`,
            courseId: c?.id,
            title: p?.title || c?.title || "اختبار",
            subject: c?.subject ?? "",
            level: c?.level ?? "",
            freeContentType: "EXAM",
            url,
          },
        ];
      });
    });

    return NextResponse.json({
      ok: true,
      courses,
      lessons,
      pdfs,
      exams,
      assignments,
      data: courses,
      error: null,
    });
  } catch (e) {
    console.error("[free/courses][GET]", e);
    return NextResponse.json({
      ...EMPTY,
      ok: false,
      message: "تعذّر تحميل المحتوى المجاني.",
      error: "unexpected",
    });
  }
}
