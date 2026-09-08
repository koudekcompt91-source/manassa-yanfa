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

/** Admin list — PaidDiagnosticContent on PAID courses only. */
export async function GET() {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const rows = await prisma.paidDiagnosticContent.findMany({
      where: { course: { system: "PAID" } },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { course: { select: courseSelect } },
    });

    return NextResponse.json({
      ok: true,
      items: rows.map(normalizePaidDiagnosticContent),
    });
  } catch (e) {
    console.error("[admin/paid-diagnostics][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل التقويات التشخيصية." }, { status: 500 });
  }
}

/** Admin create — rejects FREE courses. */
export async function POST(req: Request) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const body = await req.json();
    const valid = validatePaidDiagnosticContentPayload(body);
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

    const item = await prisma.paidDiagnosticContent.create({
      data: {
        courseId,
        title: String(valid.data.title),
        description: String(valid.data.description ?? ""),
        subject: (valid.data.subject as string | null) ?? null,
        level: (valid.data.level as string | null) ?? null,
        academicLevel: (valid.data.academicLevel as string | null) ?? null,
        fileUrl: String(valid.data.fileUrl),
        isPublished: Boolean(valid.data.isPublished),
        order: Number(valid.data.order) || 0,
      },
      include: { course: { select: courseSelect } },
    });

    return NextResponse.json({
      ok: true,
      message: "تم إنشاء التقوية التشخيصية.",
      item: normalizePaidDiagnosticContent(item),
    });
  } catch (e) {
    console.error("[admin/paid-diagnostics][POST] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر إنشاء التقوية التشخيصية." }, { status: 500 });
  }
}
