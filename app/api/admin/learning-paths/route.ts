import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/auth/api-guards";

export const dynamic = "force-dynamic";

function slugify(input: string): string {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizePath(path: {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: path.id,
    title: path.title,
    slug: path.slug,
    description: path.description || "",
    icon: path.icon || "",
    color: path.color || "",
    isPublished: path.isPublished,
    order: path.order,
    createdAt: path.createdAt.toISOString(),
    updatedAt: path.updatedAt.toISOString(),
  };
}

function parseCourseIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((id) => String(id || "").trim())
    .filter((id, idx, arr) => id.length > 0 && arr.indexOf(id) === idx);
}

export async function GET() {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const paths = await prisma.learningPath.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    const withCourses = await Promise.all(
      paths.map(async (path) => {
        const linkedCourses = await prisma.course.findMany({
          where: { categoryId: path.id },
          select: { id: true, title: true, slug: true },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        });
        return {
          ...normalizePath(path),
          linkedCoursesCount: linkedCourses.length,
          linkedCourseIds: linkedCourses.map((c) => c.id),
          linkedCourses,
        };
      })
    );

    return NextResponse.json({ ok: true, learningPaths: withCourses });
  } catch (error) {
    console.error("[admin/learning-paths][GET] error:", error);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل المسارات التعليمية." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const body = await req.json().catch(() => ({}));
    const title = String(body?.title || "").trim();
    const description = String(body?.description || "").trim() || null;
    const icon = String(body?.icon || "").trim() || null;
    const color = String(body?.color || "").trim() || null;
    const isPublished = Boolean(body?.isPublished);
    const order = Number.isFinite(Number(body?.order)) ? Math.max(0, Math.round(Number(body.order))) : 0;
    const courseIds = parseCourseIds(body?.courseIds);

    if (!title) {
      return NextResponse.json({ ok: false, message: "عنوان المسار مطلوب." }, { status: 400 });
    }

    const rawSlug = String(body?.slug || "").trim();
    const baseSlug = slugify(rawSlug || title);
    if (!baseSlug) {
      return NextResponse.json({ ok: false, message: "المعرّف (slug) غير صالح." }, { status: 400 });
    }

    let slug = baseSlug;
    let i = 1;
    while (await prisma.learningPath.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`;
    }

    const created = await prisma.$transaction(async (tx) => {
      const path = await tx.learningPath.create({
        data: {
          title,
          slug,
          description,
          icon,
          color,
          isPublished,
          order,
        },
      });

      if (courseIds.length) {
        await tx.course.updateMany({
          where: { id: { in: courseIds } },
          data: { categoryId: path.id },
        });
      }

      return path;
    });

    return NextResponse.json({
      ok: true,
      message: "تم إنشاء المسار بنجاح.",
      learningPath: normalizePath(created),
    });
  } catch (error) {
    console.error("[admin/learning-paths][POST] error:", error);
    return NextResponse.json({ ok: false, message: "تعذّر إنشاء المسار التعليمي." }, { status: 500 });
  }
}
