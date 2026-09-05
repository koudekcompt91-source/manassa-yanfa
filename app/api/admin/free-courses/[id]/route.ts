import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import { isValidYoutubeUrl } from "@/lib/youtube";
import { loadFreeCourseMedia, syncCoursePdfs, syncCourseVideo } from "@/lib/free-course-media";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isValidVideoUrl(url: string): boolean {
  if (isValidYoutubeUrl(url)) return true;
  return /\.mp4(\?|$)/i.test(url);
}

function parsePdfsFromBody(body: any) {
  if (Array.isArray(body?.pdfs)) return body.pdfs;
  const lines = String(body?.pdfUrls || "")
    .split("\n")
    .map((s: string) => s.trim())
    .filter(Boolean);
  return lines.map((url: string, i: number) => ({ title: `مستند PDF ${i + 1}`, url }));
}

async function normalizeWithMedia(course: {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  status: string;
  order: number;
  level: string | null;
  academicLevel: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  const media = await loadFreeCourseMedia(course.id);
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    videoUrl: media.videoUrl,
    pdfs: media.pdfs,
    pdfUrls: media.pdfs.map((p) => p.url).join("\n"),
    type: "FREE" as const,
    system: "FREE" as const,
    coverImage: course.thumbnailUrl,
    status: course.status,
    isPublished: course.status === "PUBLISHED",
    order: course.order,
    level: course.level,
    academicLevel: course.academicLevel,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
  };
}

/** Update FREE LMS course only (refuse PAID system rows). */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const existing = await prisma.course.findUnique({
      where: { id: params.id },
      select: { id: true, system: true, status: true, videoUrl: true },
    });
    if (!existing || existing.system !== "FREE") {
      return NextResponse.json({ ok: false, message: "دورة مجانية غير موجودة." }, { status: 404 });
    }

    const media = await loadFreeCourseMedia(existing.id);
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body?.title !== undefined) {
      const title = String(body.title || "").trim();
      if (!title) return NextResponse.json({ ok: false, message: "عنوان الدورة مطلوب." }, { status: 400 });
      data.title = title;
    }
    if (body?.description !== undefined) data.description = String(body.description || "").trim();

    let nextVideo = media.videoUrl || existing.videoUrl || null;
    if (body?.videoUrl !== undefined) {
      const videoUrl = String(body.videoUrl || "").trim() || null;
      if (videoUrl && !isValidVideoUrl(videoUrl)) {
        return NextResponse.json(
          { ok: false, message: "رابط فيديو غير صالح. يُقبل YouTube أو MP4." },
          { status: 400 }
        );
      }
      nextVideo = videoUrl;
      data.videoUrl = videoUrl;
    }

    if (body?.thumbnailUrl !== undefined || body?.coverImage !== undefined) {
      data.thumbnailUrl = String(body.thumbnailUrl || body.coverImage || "").trim() || null;
    }
    if (body?.level !== undefined) data.level = String(body.level || "").trim() || null;
    if (body?.status !== undefined) {
      const statusRaw = String(body.status || "").toUpperCase();
      data.status = statusRaw === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    }
    if (body?.order !== undefined) data.order = Math.max(0, Number(body.order) || 0);

    const nextStatus = (data.status as string) || existing.status;
    if (nextStatus === "PUBLISHED" && !nextVideo) {
      return NextResponse.json({ ok: false, message: "أضف رابط الفيديو قبل نشر الدورة." }, { status: 400 });
    }

    data.system = "FREE";
    data.accessType = "FREE";
    data.minSubscription = "FREE";
    data.price = 0;

    const course = await prisma.course.update({
      where: { id: params.id },
      data,
    });

    if (body?.videoUrl !== undefined) {
      await syncCourseVideo(course.id, nextVideo);
    }
    if (body?.pdfs !== undefined || body?.pdfUrls !== undefined) {
      await syncCoursePdfs(course.id, parsePdfsFromBody(body));
    }

    return NextResponse.json({
      ok: true,
      message: "تم تحديث الدورة.",
      course: await normalizeWithMedia(course),
    });
  } catch (e) {
    console.error("[admin/free-courses/:id][PATCH]", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحديث الدورة." }, { status: 500 });
  }
}

/** Delete FREE LMS course only. */
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const existing = await prisma.course.findUnique({
      where: { id: params.id },
      select: { id: true, system: true },
    });
    if (!existing || existing.system !== "FREE") {
      return NextResponse.json({ ok: false, message: "دورة مجانية غير موجودة." }, { status: 404 });
    }

    await prisma.course.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true, message: "تم حذف الدورة المجانية." });
  } catch (e) {
    console.error("[admin/free-courses/:id][DELETE]", e);
    return NextResponse.json({ ok: false, message: "تعذّر حذف الدورة." }, { status: 500 });
  }
}
