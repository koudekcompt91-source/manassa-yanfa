import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import {
  mapStudentSafe,
  STUDENT_HARD_DELETE_PHRASE,
  studentSafeSelect,
} from "@/lib/admin/student-management";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteCtx = { params: { id: string } };

/**
 * Student detail — non-sensitive fields + relation counts for admin awareness.
 * Never returns passwordHash, reset tokens, or secrets.
 */
export async function GET(req: Request, { params }: RouteCtx) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  const ip = getClientIp(req);
  const rate = checkRateLimit({
    key: `admin-students-detail:${ip}:${guard.session.sub}`,
    limit: 40,
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

    const student = await prisma.user.findFirst({
      where: { id: studentId, role: "STUDENT" },
      select: {
        ...studentSafeSelect,
        _count: {
          select: {
            enrollments: true,
            notifications: true,
            rechargeRequests: true,
            walletTransactions: true,
            chatConversations: true,
            sentChatMessages: true,
            assessmentSubmissions: true,
            lessonProgresses: true,
            certificates: true,
            storeOrders: true,
            passwordResetTokens: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ ok: false, message: "الطالب غير موجود." }, { status: 404 });
    }

    const { _count, ...row } = student;

    return NextResponse.json({
      ok: true,
      user: {
        ...mapStudentSafe(row, { enrollmentsCount: _count.enrollments }),
        relatedCounts: {
          enrollments: _count.enrollments,
          notifications: _count.notifications,
          rechargeRequests: _count.rechargeRequests,
          walletTransactions: _count.walletTransactions,
          chatConversations: _count.chatConversations,
          sentChatMessages: _count.sentChatMessages,
          assessmentSubmissions: _count.assessmentSubmissions,
          lessonProgresses: _count.lessonProgresses,
          certificates: _count.certificates,
          storeOrders: _count.storeOrders,
          passwordResetTokens: _count.passwordResetTokens,
        },
      },
    });
  } catch (e) {
    console.error("[admin/students/:id][GET] error");
    return NextResponse.json({ ok: false, message: "تعذّر تحميل تفاصيل الطالب." }, { status: 500 });
  }
}

/**
 * Hard-delete a STUDENT only.
 *
 * Cascades (per schema): enrollments, wallet/recharge, notifications, chat as student,
 * assessment submissions, lesson progress, certificates, password reset tokens,
 * and chat messages sent by this user.
 * SetNull: storeOrders.studentId (order rows kept without student link).
 *
 * Requires body: { confirmEmail, confirmPhrase: "حذف نهائي" }
 * Never trusts role/status from client.
 */
export async function DELETE(req: Request, { params }: RouteCtx) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  const ip = getClientIp(req);
  const rate = checkRateLimit({
    key: `admin-students-delete:${ip}:${guard.session.sub}`,
    limit: 5,
    windowMs: 60_000,
  });
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, message: "عدد محاولات الحذف كبير. حاول بعد قليل." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
    );
  }

  try {
    const studentId = String(params.id || "").trim();
    if (!studentId) {
      return NextResponse.json({ ok: false, message: "معرّف الطالب غير صالح." }, { status: 400 });
    }

    if (studentId === guard.session.sub) {
      return NextResponse.json(
        { ok: false, message: "لا يمكن حذف حسابك من هذه العملية." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const confirmEmail = String(body?.confirmEmail || "")
      .trim()
      .toLowerCase();
    const confirmPhrase = String(body?.confirmPhrase || "").trim();

    if (!confirmEmail || !confirmEmail.includes("@")) {
      return NextResponse.json(
        { ok: false, message: "أدخل البريد الإلكتروني للطالب للتأكيد." },
        { status: 400 }
      );
    }
    if (confirmPhrase !== STUDENT_HARD_DELETE_PHRASE) {
      return NextResponse.json(
        {
          ok: false,
          message: `للتأكيد اكتب العبارة بالضبط: ${STUDENT_HARD_DELETE_PHRASE}`,
        },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        level: true,
        academicLevel: true,
      },
    });

    if (!target) {
      return NextResponse.json({ ok: false, message: "الطالب غير موجود." }, { status: 404 });
    }

    // Explicit role gates — never delete ADMIN / TEACHER even if ID guessed (IDOR).
    if (target.role === "ADMIN") {
      return NextResponse.json({ ok: false, message: "لا يمكن حذف حساب إدارة." }, { status: 403 });
    }
    if (target.role === "TEACHER") {
      return NextResponse.json({ ok: false, message: "لا يمكن حذف حساب أستاذ." }, { status: 403 });
    }
    if (target.role !== "STUDENT") {
      return NextResponse.json({ ok: false, message: "يمكن حذف حسابات الطلاب فقط." }, { status: 403 });
    }

    if (target.email.toLowerCase() !== confirmEmail) {
      return NextResponse.json(
        { ok: false, message: "البريد الإلكتروني للتأكيد غير مطابق." },
        { status: 400 }
      );
    }

    // Atomic delete constrained to STUDENT role — race-safe against role changes.
    const deleted = await prisma.user.deleteMany({
      where: { id: target.id, role: "STUDENT" },
    });

    if (deleted.count !== 1) {
      return NextResponse.json(
        { ok: false, message: "تعذّر الحذف. قد تكون صلاحية الحساب تغيّرت." },
        { status: 409 }
      );
    }

    console.info(
      `[STUDENT_HARD_DELETED] admin=${guard.session.sub} student=${target.id} at=${new Date().toISOString()}`
    );

    return NextResponse.json({
      ok: true,
      message: "تم حذف حساب الطالب نهائيًا.",
      deleted: {
        id: target.id,
        email: target.email,
        fullName: target.fullName,
      },
    });
  } catch (e) {
    console.error("[admin/students/:id][DELETE] error");
    return NextResponse.json({ ok: false, message: "تعذّر حذف الحساب." }, { status: 500 });
  }
}
