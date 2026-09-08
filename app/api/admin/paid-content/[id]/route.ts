import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import { normalizePaidFileContent, validatePaidFileContentPayload } from "@/lib/paid-file-content";

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

async function loadPaidItem(id: string) {
  return prisma.paidFileContent.findUnique({
    where: { id },
    include: { course: { select: courseSelect } },
  });
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const item = await loadPaidItem(params.id);
    if (!item || item.course.system !== "PAID") {
      return NextResponse.json({ ok: false, message: "المحتوى غير موجود." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, item: normalizePaidFileContent(item) });
  } catch (e) {
    console.error("[admin/paid-content/:id][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل المحتوى." }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const existing = await loadPaidItem(params.id);
    if (!existing || existing.course.system !== "PAID") {
      return NextResponse.json({ ok: false, message: "المحتوى غير موجود." }, { status: 404 });
    }

    const body = await req.json();
    const valid = validatePaidFileContentPayload(body, { partial: true });
    if (!valid.ok) return NextResponse.json({ ok: false, message: valid.message }, { status: 400 });

    if (valid.data.courseId !== undefined) {
      const course = await prisma.course.findUnique({
        where: { id: String(valid.data.courseId) },
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
    }

    const item = await prisma.paidFileContent.update({
      where: { id: params.id },
      data: valid.data as any,
      include: { course: { select: courseSelect } },
    });

    if (item.course.system !== "PAID") {
      return NextResponse.json({ ok: false, message: "المحتوى غير مرتبط بدورة مدفوعة." }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: "تم تحديث المحتوى.",
      item: normalizePaidFileContent(item),
    });
  } catch (e) {
    console.error("[admin/paid-content/:id][PATCH] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحديث المحتوى." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const existing = await loadPaidItem(params.id);
    if (!existing || existing.course.system !== "PAID") {
      return NextResponse.json({ ok: false, message: "المحتوى غير موجود." }, { status: 404 });
    }

    await prisma.paidFileContent.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true, message: "تم حذف المحتوى." });
  } catch (e) {
    console.error("[admin/paid-content/:id][DELETE] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر حذف المحتوى." }, { status: 500 });
  }
}
