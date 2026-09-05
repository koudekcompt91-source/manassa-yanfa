import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import { isValidYoutubeUrl } from "@/lib/youtube";

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

function normalize(course: {
  id: string;
  slug: string;
  title: string;
  description: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  status: string;
  order: number;
  level: string | null;
  academicLevel: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    videoUrl: course.videoUrl || "",
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

/** Admin/teacher FREE LMS — list only system=FREE courses. */
export async function GET() {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const courses = await prisma.course.findMany({
      where: { system: "FREE" },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ ok: true, courses: courses.map(normalize) });
  } catch (e) {
    console.error("[admin/free-courses][GET]", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الدورات المجانية." }, { status: 500 });
  }
}

/** Create a FREE LMS course (isolated from PAID packages). */
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
    const statusRaw = String(body?.status || "").toUpperCase();
    const status = statusRaw === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

    if (!title) {
      return NextResponse.json({ ok: false, message: "عنوان الدورة مطلوب." }, { status: 400 });
    }
    if (videoUrl && !isValidYoutubeUrl(videoUrl)) {
      return NextResponse.json({ ok: false, message: "رابط يوتيوب غير صالح. يُقبل رابط YouTube فقط." }, { status: 400 });
    }
    if (status === "PUBLISHED" && !videoUrl) {
      return NextResponse.json({ ok: false, message: "أضف رابط يوتيوب قبل نشر الدورة." }, { status: 400 });
    }

    const baseSlug = slugify(title) || `free-course-${Date.now()}`;
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
        videoUrl,
        thumbnailUrl,
        level,
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

    return NextResponse.json({
      ok: true,
      message: "تم إنشاء الدورة المجانية.",
      course: normalize(course),
    });
  } catch (e) {
    console.error("[admin/free-courses][POST]", e);
    return NextResponse.json({ ok: false, message: "تعذّر إنشاء الدورة." }, { status: 500 });
  }
}
