import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Activate a PAID PENDING student: PENDING → ACTIVE only.
 * Server-controlled; ignores any client-provided status body.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  const ip = getClientIp(req);
  const rate = checkRateLimit({
    key: `admin-student-activation:${ip}:${guard.session.sub}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, message: "عدد محاولات التفعيل كبير. حاول بعد قليل." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
    );
  }

  try {
    const studentId = String(params.id || "").trim();
    if (!studentId) {
      return NextResponse.json({ ok: false, message: "معرّف الطالب غير صالح." }, { status: 400 });
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        subscriptionType: true,
      },
    });

    if (!student || student.role !== "STUDENT") {
      return NextResponse.json({ ok: false, message: "الطالب غير موجود." }, { status: 404 });
    }
    if (student.subscriptionType !== "PAID") {
      return NextResponse.json(
        { ok: false, message: "يمكن تفعيل حسابات الطلاب المدفوعة فقط." },
        { status: 400 }
      );
    }
    if (student.status === "ACTIVE") {
      return NextResponse.json(
        { ok: false, message: "هذا الحساب مفعّل مسبقًا." },
        { status: 400 }
      );
    }
    if (student.status !== "PENDING") {
      return NextResponse.json(
        { ok: false, message: "لا يمكن تفعيل هذا الحساب في حالته الحالية." },
        { status: 400 }
      );
    }

    const updated = await prisma.user.updateMany({
      where: {
        id: student.id,
        role: "STUDENT",
        subscriptionType: "PAID",
        status: "PENDING",
      },
      data: { status: "ACTIVE" },
    });

    if (updated.count !== 1) {
      return NextResponse.json(
        { ok: false, message: "تعذّر التفعيل. قد تكون الحالة تغيّرت." },
        { status: 409 }
      );
    }

    console.info(
      `[STUDENT_ACCOUNT_ACTIVATED] admin=${guard.session.sub} student=${student.id} at=${new Date().toISOString()}`
    );

    return NextResponse.json({
      ok: true,
      message: "تم تفعيل حساب الطالب بنجاح.",
      user: {
        id: student.id,
        email: student.email,
        fullName: student.fullName,
        status: "ACTIVE",
        subscriptionType: "PAID",
      },
    });
  } catch (e) {
    console.error("[admin/student-activation/:id][POST] error");
    return NextResponse.json({ ok: false, message: "تعذّر تفعيل الحساب." }, { status: 500 });
  }
}
