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

function parseCourseIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((id) => String(id || "").trim())
    .filter((id, idx, arr) => id.length > 0 && arr.indexOf(id) === idx);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  const id = String(params?.id || "").trim();
  if (!id) {
    return NextResponse.json({ ok: false, message: "معرّف المسار غير صالح." }, { status: 400 });
  }

  try {
    const existing = await prisma.learningPath.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, message: "المسار غير موجود." }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const title = String(body?.title ?? existing.title).trim();
    if (!title) {
      return NextResponse.json({ ok: false, message: "عنوان المسار مطلوب." }, { status: 400 });
    }

    const nextSlugRaw = String(body?.slug ?? existing.slug).trim();
    const nextSlug = slugify(nextSlugRaw || title);
    if (!nextSlug) {
      return NextResponse.json({ ok: false, message: "المعرّف (slug) غير صالح." }, { status: 400 });
    }

    const slugOwner = await prisma.learningPath.findUnique({ where: { slug: nextSlug } });
    if (slugOwner && slugOwner.id !== id) {
      return NextResponse.json({ ok: false, message: "هذا المعرّف مستخدم مسبقًا." }, { status: 400 });
    }

    const hasCourseIds = Array.isArray(body?.courseIds);
    const courseIds = parseCourseIds(body?.courseIds);

    await prisma.$transaction(async (tx) => {
      await tx.learningPath.update({
        where: { id },
        data: {
          title,
          slug: nextSlug,
          description: String(body?.description ?? existing.description ?? "").trim() || null,
          icon: String(body?.icon ?? existing.icon ?? "").trim() || null,
          color: String(body?.color ?? existing.color ?? "").trim() || null,
          isPublished: body?.isPublished === undefined ? existing.isPublished : Boolean(body.isPublished),
          order:
            body?.order === undefined
              ? existing.order
              : Math.max(0, Math.round(Number(body.order) || 0)),
        },
      });

      if (hasCourseIds) {
        await tx.course.updateMany({
          where: { categoryId: id, id: { notIn: courseIds } },
          data: { categoryId: null },
        });
        if (courseIds.length) {
          await tx.course.updateMany({
            where: { id: { in: courseIds } },
            data: { categoryId: id },
          });
        }
      }
    });

    return NextResponse.json({ ok: true, message: "تم تحديث المسار بنجاح." });
  } catch (error) {
    console.error("[admin/learning-paths/:id][PATCH] error:", error);
    return NextResponse.json({ ok: false, message: "تعذّر تحديث المسار." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  const id = String(params?.id || "").trim();
  if (!id) {
    return NextResponse.json({ ok: false, message: "معرّف المسار غير صالح." }, { status: 400 });
  }

  try {
    const existing = await prisma.learningPath.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, message: "المسار غير موجود." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.course.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      });
      await tx.learningPath.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true, message: "تم حذف المسار." });
  } catch (error) {
    console.error("[admin/learning-paths/:id][DELETE] error:", error);
    return NextResponse.json({ ok: false, message: "تعذّر حذف المسار." }, { status: 500 });
  }
}
