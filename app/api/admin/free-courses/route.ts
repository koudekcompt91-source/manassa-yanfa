import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import { isValidYoutubeUrl } from "@/lib/youtube";
import { loadFreeCourseMedia, syncCoursePdfs, syncCourseVideo } from "@/lib/free-course-media";
import {
  freeContentNeedsPdf,
  freeContentNeedsVideo,
  normalizeFreeContentType,
  type FreeContentTypeCode,
} from "@/lib/free-content-type";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function slugify(input: string): string {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

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
  subject?: string | null;
  freeContentType?: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  const media = await loadFreeCourseMedia(course.id);
  const pdfs = Array.isArray(media?.pdfs) ? media.pdfs : [];
  const freeContentType = normalizeFreeContentType(course.freeContentType);
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    videoUrl: media?.videoUrl ?? "",
    pdfs,
    pdfUrls: pdfs.map((p) => p?.url ?? "").filter(Boolean).join("\n"),
    type: "FREE" as const,
    system: "FREE" as const,
    freeContentType,
    contentType: freeContentType,
    subject: course.subject ?? "",
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

function validatePublishRequirements(
  type: FreeContentTypeCode,
  status: string,
  videoUrl: string | null,
  pdfs: { url?: string }[]
) {
  if (status !== "PUBLISHED") return null;
  if (freeContentNeedsVideo(type) && !videoUrl) {
    return type === "LESSON"
      ? "أضف رابط الفيديو قبل نشر الدرس."
      : "أضف رابط الفيديو قبل نشر الدورة.";
  }
  if (freeContentNeedsPdf(type) && !pdfs.some((p) => String(p?.url || "").trim())) {
    return "أضف رابط PDF واحدًا على الأقل قبل النشر.";
  }
  return null;
}

/** Admin/teacher FREE LMS — list only system=FREE courses. */
export async function GET() {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const courses = await prisma.course.findMany({
      where: { system: "FREE" },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    const list = Array.isArray(courses) ? courses : [];
    const mapped = await Promise.all(list.map((c) => normalizeWithMedia(c)));
    return NextResponse.json({ ok: true, courses: mapped ?? [], data: mapped ?? [], error: null });
  } catch (e) {
    console.error("[admin/free-courses][GET]", e);
    return NextResponse.json(
      { ok: false, message: "تعذّر تحميل المحتوى المجاني.", courses: [], data: [], error: "db_unavailable" },
      { status: 500 }
    );
  }
}

/** Create a FREE LMS content row (isolated from PAID packages). */
export async function POST(req: Request) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const body = await req.json();
    const title = String(body?.title || "").trim();
    const description = String(body?.description || "").trim();
    const videoUrl = String(body?.videoUrl || "").trim() || null;
    const thumbnailUrl = String(body?.thumbnailUrl || body?.coverImage || "").trim() || null;
    const level = String(body?.level || "").trim() || null;
    const subject = String(body?.subject || "").trim() || null;
    const freeContentType = normalizeFreeContentType(body?.freeContentType || body?.contentType);
    const statusRaw = String(body?.status || "").toUpperCase();
    const status = statusRaw === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    const pdfs = parsePdfsFromBody(body);

    if (!title) {
      return NextResponse.json({ ok: false, message: "العنوان مطلوب." }, { status: 400 });
    }
    if (videoUrl && !isValidVideoUrl(videoUrl)) {
      return NextResponse.json({ ok: false, message: "رابط فيديو غير صالح. يُقبل YouTube أو MP4." }, { status: 400 });
    }
    const publishErr = validatePublishRequirements(freeContentType, status, videoUrl, pdfs);
    if (publishErr) {
      return NextResponse.json({ ok: false, message: publishErr }, { status: 400 });
    }

    const baseSlug = slugify(title) || `free-${freeContentType.toLowerCase()}-${Date.now()}`;
    let slug = baseSlug;
    let i = 1;
    while (await prisma.course.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`;
    }

    const orderMax = await prisma.course.aggregate({
      where: { system: "FREE" },
      _max: { order: true },
    });

    const course = await prisma.course.create({
      data: {
        title,
        description,
        videoUrl: freeContentNeedsVideo(freeContentType) ? videoUrl : null,
        thumbnailUrl,
        level,
        subject,
        freeContentType,
        academicLevel: null,
        slug,
        status,
        system: "FREE",
        accessType: "FREE",
        minSubscription: "FREE",
        price: 0,
        order: (orderMax._max.order ?? 0) + 1,
      },
    });

    await syncCourseVideo(course.id, freeContentNeedsVideo(freeContentType) ? videoUrl : null);
    await syncCoursePdfs(course.id, freeContentNeedsPdf(freeContentType) || freeContentType === "COURSE" ? pdfs : []);

    return NextResponse.json({
      ok: true,
      message: "تم إنشاء المحتوى المجاني.",
      course: await normalizeWithMedia(course),
    });
  } catch (e) {
    console.error("[admin/free-courses][POST]", e);
    return NextResponse.json({ ok: false, message: "تعذّر إنشاء المحتوى." }, { status: 500 });
  }
}
