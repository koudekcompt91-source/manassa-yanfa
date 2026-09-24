import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { mapStudentSafe, studentSafeSelect } from "@/lib/admin/student-management";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteCtx = { params: { id: string } };

/**
 * Re-enable a DISABLED student: DISABLED → ACTIVE.
 * Does not change FREE/PAID access rules; login still uses existing gates.
 */
export async function POST(req: Request, { params }: RouteCtx) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  const ip = getClientIp(req);
  const rate = checkRateLimit({
    key: `admin-students-enable:${ip}:${guard.session.sub}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, message: "عدد الطلبات كبير. حاول بعد قليل." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
    );
  }

  try {
    const studentId = String(params.id || "").trim();
    if (!studentId) {
      return NextResponse.json({ ok: false, message: "معرّف الطالب غير صالح." }, { status: 400 });
    }

    const withRole = await prisma.user.findUnique({
      where: { id: studentId },
      select: { ...studentSafeSelect, role: true },
    });

    if (!withRole) {
      return NextResponse.json({ ok: false, message: "الطالب غير موجود." }, { status: 404 });
    }
    if (withRole.role !== "STUDENT") {
      return NextResponse.json(
        { ok: false, message: "يمكن إعادة تفعيل حسابات الطلاب فقط." },
        { status: 403 }
      );
    }
    if (withRole.status !== "DISABLED") {
      return NextResponse.json(
        { ok: false, message: "هذا الحساب ليس معطّلًا." },
        { status: 400 }
      );
    }

    const updated = await prisma.user.updateMany({
      where: { id: withRole.id, role: "STUDENT", status: "DISABLED" },
      data: { status: "ACTIVE" },
    });

    if (updated.count !== 1) {
      return NextResponse.json(
        { ok: false, message: "تعذّرت إعادة التفعيل. قد تكون الحالة تغيّرت." },
        { status: 409 }
      );
    }

    console.info(
      `[STUDENT_REENABLED] admin=${guard.session.sub} student=${withRole.id} at=${new Date().toISOString()}`
    );

    return NextResponse.json({
      ok: true,
      message: "تم إعادة تفعيل حساب الطالب.",
      user: mapStudentSafe({ ...withRole, status: "ACTIVE" }),
    });
  } catch (e) {
    console.error("[admin/students/:id/enable][POST] error");
    return NextResponse.json({ ok: false, message: "تعذّرت إعادة تفعيل الحساب." }, { status: 500 });
  }
}
