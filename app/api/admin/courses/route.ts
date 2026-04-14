import { NextResponse } from "next/server";
import { CourseAccessType, CourseStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromCookies } from "@/lib/auth/session";

function slugify(input: string): string {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

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
  lessons?: { id: string }[];
  _count?: { lessons: number };
}) {
  const lessonsCount = course._count?.lessons ?? course.lessons?.length ?? 0;
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
    lessonsCount,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
  };
}

function validateCoursePayload(body: any) {
  const title = String(body?.title || "").trim();
  const description = String(body?.description || "").trim();
  const categoryId = String(body?.categoryId || "").trim() || null;
  const teacherId = String(body?.teacherId || "").trim() || null;
  const thumbnailUrl = String(body?.thumbnailUrl || body?.coverImage || "").trim() || null;
  const academicLevel = String(body?.academicLevel || "").trim() || null;
  const level = String(body?.level || "").trim() || null;
  const statusRaw = String(body?.status || "").trim().toUpperCase();
  const accessRaw = String(body?.accessType || "").trim().toUpperCase();
  const status = statusRaw === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  const accessType = accessRaw === "PAID" ? "PAID" : "FREE";
  const numericPrice = Number(body?.price ?? body?.priceMad ?? 0);
  const price = accessType === "PAID" ? Math.round(numericPrice) : 0;

  if (!title) return { ok: false as const, message: "عنوان الدورة مطلوب." };
  if (accessType === "PAID" && (!Number.isFinite(price) || price <= 0)) {
    return { ok: false as const, message: "أدخل سعرًا صحيحًا للدورة المدفوعة." };
  }

  return {
    ok: true as const,
    value: {
      title,
      description,
      categoryId,
      teacherId,
      thumbnailUrl,
      academicLevel,
      level,
      status: status as CourseStatus,
      accessType: accessType as CourseAccessType,
      price,
      isFeatured: Boolean(body?.isFeatured),
    },
  };
}

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });
  }

  const courses = await prisma.course.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { lessons: true } } },
  });
  return NextResponse.json({ ok: true, courses: courses.map(normalizeCourse) });
}

export async function POST(req: Request) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const valid = validateCoursePayload(body);
    if (!valid.ok) return NextResponse.json({ ok: false, message: valid.message }, { status: 400 });

    const baseSlug = slugify(valid.value.title) || `course-${Date.now()}`;
    let slug = baseSlug;
    let i = 1;
    while (await prisma.course.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`;
    }

    const orderMax = await prisma.course.aggregate({ _max: { order: true } });
    const order = (orderMax._max.order ?? 0) + 1;

    const course = await prisma.course.create({
      data: {
        ...valid.value,
        slug,
        order,
      },
      include: { _count: { select: { lessons: true } } },
    });

    return NextResponse.json({ ok: true, message: "تم إنشاء الدورة بنجاح.", course: normalizeCourse(course) });
  } catch (e) {
    console.error("[admin/courses][POST] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر إنشاء الدورة." }, { status: 500 });
  }
}
