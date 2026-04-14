import { NextResponse } from "next/server";
import { CourseAccessType, CourseStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromCookies } from "@/lib/auth/session";

function normalizeCourse(course: {
  id: string;
  slug: string;
  title: string;
  description: string;
  categoryId: string | null;
  teacherId: string | null;
  thumbnailUrl: string | null;
  status: CourseStatus;
  accessType: CourseAccessType;
  price: number;
  isFeatured: boolean;
  order: number;
  academicLevel: string | null;
  level: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: { lessons: number };
}) {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    categoryId: course.categoryId,
    teacherId: course.teacherId,
    coverImage: course.thumbnailUrl,
    status: course.status,
    accessType: course.accessType,
    isPublished: course.status === "PUBLISHED",
    priceType: course.accessType === "PAID" ? "premium" : "free",
    priceMad: course.price,
    price: course.price,
    isFeatured: course.isFeatured,
    order: course.order,
    academicLevel: course.academicLevel,
    level: course.level,
    lessonsCount: course._count?.lessons ?? 0,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
  };
}

function validatePatch(body: any) {
  const title = body?.title !== undefined ? String(body.title || "").trim() : undefined;
  if (title !== undefined && !title) return { ok: false as const, message: "عنوان الدورة مطلوب." };

  const accessRaw = body?.accessType !== undefined ? String(body.accessType || "").toUpperCase() : undefined;
  const accessType = accessRaw === "PAID" ? "PAID" : accessRaw === "FREE" ? "FREE" : undefined;
  const statusRaw = body?.status !== undefined ? String(body.status || "").toUpperCase() : undefined;
  const status = statusRaw === "PUBLISHED" ? "PUBLISHED" : statusRaw === "DRAFT" ? "DRAFT" : undefined;

  const priceCandidate = body?.price ?? body?.priceMad;
  const numericPrice = priceCandidate !== undefined ? Math.round(Number(priceCandidate)) : undefined;

  if (accessType === "PAID" && (numericPrice === undefined || !Number.isFinite(numericPrice) || numericPrice <= 0)) {
    return { ok: false as const, message: "أدخل سعرًا صحيحًا للدورة المدفوعة." };
  }

  const data: any = {};
  if (title !== undefined) data.title = title;
  if (body?.description !== undefined) data.description = String(body.description || "").trim();
  if (body?.categoryId !== undefined) data.categoryId = String(body.categoryId || "").trim() || null;
  if (body?.teacherId !== undefined) data.teacherId = String(body.teacherId || "").trim() || null;
  if (body?.thumbnailUrl !== undefined || body?.coverImage !== undefined) data.thumbnailUrl = String(body.thumbnailUrl || body.coverImage || "").trim() || null;
  if (body?.academicLevel !== undefined) data.academicLevel = String(body.academicLevel || "").trim() || null;
  if (body?.level !== undefined) data.level = String(body.level || "").trim() || null;
  if (status !== undefined) data.status = status as CourseStatus;
  if (accessType !== undefined) data.accessType = accessType as CourseAccessType;
  if (body?.isFeatured !== undefined) data.isFeatured = Boolean(body.isFeatured);
  if (body?.order !== undefined) data.order = Math.max(0, Number(body.order) || 0);

  if (accessType === "FREE") data.price = 0;
  else if (numericPrice !== undefined) data.price = numericPrice;

  return { ok: true as const, data };
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });
  }

  try {
    const valid = validatePatch(await req.json());
    if (!valid.ok) return NextResponse.json({ ok: false, message: valid.message }, { status: 400 });

    const course = await prisma.course.update({
      where: { id: params.id },
      data: valid.data,
      include: { _count: { select: { lessons: true } } },
    });

    return NextResponse.json({ ok: true, message: "تم تحديث الدورة.", course: normalizeCourse(course) });
  } catch (e) {
    console.error("[admin/courses/:id][PATCH] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحديث الدورة." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });
  }
  try {
    await prisma.course.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true, message: "تم حذف الدورة." });
  } catch (e) {
    console.error("[admin/courses/:id][DELETE] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر حذف الدورة." }, { status: 500 });
  }
}
