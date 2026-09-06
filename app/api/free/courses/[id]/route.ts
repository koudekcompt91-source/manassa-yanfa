import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireFreeStudentApi } from "@/lib/subscription-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * FREE course detail — normalized entities, never nested content.
 * Same rule as catalog: published only, no system/subscription/accessType logic.
 * courseVideo may be missing; all reads use optional chaining.
 */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireFreeStudentApi();
  if (!guard.ok) return guard.response;

  try {
    const ref = decodeURIComponent(String(params?.id ?? "")).trim();
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
        system: true,
        status: true,
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

    const videoUrl = row.courseVideo?.videoUrl ?? null;
    const videoId = row.courseVideo?.id ?? null;

    return NextResponse.json({
      ok: true,
      course: {
        id: row.id,
        title: row.title ?? "",
        description: row.description ?? "",
        image: row.thumbnailUrl ?? "",
        system: row.system ?? null,
        videoUrl,
        courseVideo: videoUrl ? { id: videoId, videoUrl } : null,
        status: row.status ?? "PUBLISHED",
      },
      lessons: videoUrl
        ? [
            {
              id: videoId ?? `${row.id}:video`,
              courseId: row.id,
              title: row.title ?? "",
              videoUrl,
            },
          ]
        : [],
      pdfs: (row.coursePdfs ?? []).flatMap((p) => {
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
      }),
      exams: [],
    });
  } catch (e) {
    console.error("[free/courses/:id][GET]", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الدورة." }, { status: 500 });
  }
}
