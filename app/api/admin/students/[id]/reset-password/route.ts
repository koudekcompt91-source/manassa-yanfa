import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
  passwordResetExpiryDate,
} from "@/lib/auth/password-reset";
import { sendPasswordResetEmail } from "@/lib/email/resend";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteCtx = { params: { id: string } };

/**
 * Admin-triggered password reset for a STUDENT.
 * Reuses PasswordResetToken + Resend email — never returns plaintext password or token.
 */
export async function POST(req: Request, { params }: RouteCtx) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  const ip = getClientIp(req);
  const rate = checkRateLimit({
    key: `admin-students-reset-pw:${ip}:${guard.session.sub}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, message: "عدد طلبات إعادة التعيين كبير. حاول بعد قليل." },
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
      },
    });

    if (!student) {
      return NextResponse.json({ ok: false, message: "الطالب غير موجود." }, { status: 404 });
    }
    if (student.role !== "STUDENT") {
      return NextResponse.json(
        { ok: false, message: "إعادة التعيين متاحة لحسابات الطلاب فقط." },
        { status: 403 }
      );
    }

    const rawToken = generatePasswordResetToken();
    const tokenHash = hashPasswordResetToken(rawToken);
    const expiresAt = passwordResetExpiryDate();

    await prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.updateMany({
        where: { userId: student.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      await tx.passwordResetToken.create({
        data: {
          userId: student.id,
          tokenHash,
          expiresAt,
        },
      });
    });

    const sent = await sendPasswordResetEmail({
      to: student.email,
      fullName: student.fullName,
      rawToken,
    });

    // Never log or return rawToken / passwordHash.
    console.info(
      `[STUDENT_PASSWORD_RESET_SENT] admin=${guard.session.sub} student=${student.id} emailOk=${sent.ok} at=${new Date().toISOString()}`
    );

    if (!sent.ok) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "تم إنشاء رابط إعادة التعيين لكن تعذّر إرسال البريد. تحقق من إعدادات البريد ثم أعد المحاولة.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريد الطالب.",
      user: {
        id: student.id,
        email: student.email,
        fullName: student.fullName,
      },
    });
  } catch (e) {
    console.error("[admin/students/:id/reset-password][POST] error");
    return NextResponse.json(
      { ok: false, message: "تعذّر إرسال رابط إعادة تعيين كلمة المرور." },
      { status: 500 }
    );
  }
}
