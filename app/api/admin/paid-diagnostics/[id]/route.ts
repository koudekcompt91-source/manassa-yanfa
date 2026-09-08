import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import {
  normalizePaidDiagnosticContent,
  validatePaidDiagnosticContentPayload,
} from "@/lib/paid-diagnostic-content";

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

async function loadItem(id: string) {
  return prisma.paidDiagnosticContent.findUnique({
    where: { id },
    include: { course: { select: courseSelect } },
  });
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const item = await loadItem(params.id);
    if (!item || item.course.system !== "PAID") {
      return NextResponse.json({ ok: false, message: "التقوية غير موجودة." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, item: normalizePaidDiagnosticContent(item) });
  } catch (e) {
    console.error("[admin/paid-diagnostics/:id][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل التقوية." }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const existing = await loadItem(params.id);
    if (!existing || existing.course.system !== "PAID") {
      return NextResponse.json({ ok: false, message: "التقوية غير موجودة." }, { status: 404 });
    }

    const body = await req.json();
    const valid = validatePaidDiagnosticContentPayload(body, { partial: true });
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

    const item = await prisma.paidDiagnosticContent.update({
      where: { id: params.id },
      data: valid.data as any,
      include: { course: { select: courseSelect } },
    });

    if (item.course.system !== "PAID") {
      return NextResponse.json({ ok: false, message: "التقوية غير مرتبطة بدورة مدفوعة." }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: "تم تحديث التقوية التشخيصية.",
      item: normalizePaidDiagnosticContent(item),
    });
  } catch (e) {
    console.error("[admin/paid-diagnostics/:id][PATCH] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحديث التقوية." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const existing = await loadItem(params.id);
    if (!existing || existing.course.system !== "PAID") {
      return NextResponse.json({ ok: false, message: "التقوية غير موجودة." }, { status: 404 });
    }

    await prisma.paidDiagnosticContent.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true, message: "تم حذف التقوية التشخيصية." });
  } catch (e) {
    console.error("[admin/paid-diagnostics/:id][DELETE] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر حذف التقوية." }, { status: 500 });
  }
}
