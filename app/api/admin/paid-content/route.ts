import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import {
  normalizePaidFileContent,
  normalizePaidFileContentType,
  validatePaidFileContentPayload,
} from "@/lib/paid-file-content";

export const dynamic = "force-dynamic";

const courseSelect = {
  id: true,
  title: true,
  slug: true,
  system: true,
  accessType: true,
  status: true,
  level: true,
  academicLevel: true,
} as const;

/** Admin list — PAID Course.system only. Optional ?contentType=SUMMARY */
export async function GET(req: Request) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const { searchParams } = new URL(req.url);
    const typeRaw = searchParams.get("contentType");
    const contentType = typeRaw ? normalizePaidFileContentType(typeRaw) : null;
    if (typeRaw && !contentType) {
      return NextResponse.json({ ok: false, message: "نوع المحتوى غير صالح." }, { status: 400 });
    }

    const rows = await prisma.paidFileContent.findMany({
      where: {
        ...(contentType ? { contentType } : {}),
        course: { system: "PAID" },
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { course: { select: courseSelect } },
    });

    return NextResponse.json({
      ok: true,
      items: rows.map(normalizePaidFileContent),
    });
  } catch (e) {
    console.error("[admin/paid-content][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل المحتوى المدفوع." }, { status: 500 });
  }
}

/** Admin create — forces PAID course + optional default contentType from body. */
export async function POST(req: Request) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const body = await req.json();
    const valid = validatePaidFileContentPayload(body);
    if (!valid.ok) return NextResponse.json({ ok: false, message: valid.message }, { status: 400 });

    const courseId = String(valid.data.courseId || "");
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, system: true },
    });
    if (!course) {
      return NextResponse.json({ ok: false, message: "الدورة غير موجودة." }, { status: 404 });
    }
    if (course.system !== "PAID") {
      return NextResponse.json(
        { ok: false, message: "يُسمح فقط بالدورات المدفوعة (Course.system = PAID)." },
        { status: 400 }
      );
    }

    const item = await prisma.paidFileContent.create({
      data: {
        courseId,
        contentType: valid.data.contentType as any,
        title: String(valid.data.title),
        description: String(valid.data.description ?? ""),
        subject: (valid.data.subject as string | null) ?? null,
        level: (valid.data.level as string | null) ?? null,
        academicLevel: (valid.data.academicLevel as string | null) ?? null,
        fileUrl: String(valid.data.fileUrl),
        fileName: (valid.data.fileName as string | null) ?? null,
        isPublished: Boolean(valid.data.isPublished),
        order: Number(valid.data.order) || 0,
      },
      include: { course: { select: courseSelect } },
    });

    return NextResponse.json({
      ok: true,
      message: "تم إنشاء المحتوى.",
      item: normalizePaidFileContent(item),
    });
  } catch (e) {
    console.error("[admin/paid-content][POST] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر إنشاء المحتوى." }, { status: 500 });
  }
}
