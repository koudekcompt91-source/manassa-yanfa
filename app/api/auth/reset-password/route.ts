import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import {
  hashPasswordResetToken,
  MIN_PASSWORD_LENGTH,
} from "@/lib/auth/password-reset";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawToken = String(body?.token || "").trim();
    const password = String(body?.password || "");
    const confirmPassword = String(body?.confirmPassword || "");
    const ip = getClientIp(req);

    const rate = checkRateLimit({
      key: `reset-password:${ip}`,
      limit: 8,
      windowMs: 60_000,
    });
    if (!rate.ok) {
      return NextResponse.json(
        { ok: false, message: "عدد المحاولات كبير. حاول بعد قليل." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
      );
    }

    if (!rawToken) {
      return NextResponse.json({ ok: false, message: "رابط إعادة التعيين غير صالح." }, { status: 400 });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { ok: false, message: `كلمة المرور يجب أن تكون ${MIN_PASSWORD_LENGTH} أحرف على الأقل.` },
        { status: 400 }
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ ok: false, message: "كلمتا المرور غير متطابقتين." }, { status: 400 });
    }

    const tokenHash = hashPasswordResetToken(rawToken);
    const now = new Date();

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, status: true } } },
    });

    if (!record || record.usedAt || record.expiresAt.getTime() <= now.getTime()) {
      return NextResponse.json(
        { ok: false, message: "رابط إعادة التعيين غير صالح أو منتهٍ." },
        { status: 400 }
      );
    }
    if (record.user.status !== "ACTIVE") {
      return NextResponse.json({ ok: false, message: "الحساب غير مفعّل." }, { status: 403 });
    }

    const passwordHash = await hashPassword(password);

    await prisma.$transaction(async (tx) => {
      const stillValid = await tx.passwordResetToken.findFirst({
        where: {
          id: record.id,
          usedAt: null,
          expiresAt: { gt: now },
        },
        select: { id: true },
      });
      if (!stillValid) {
        throw new Error("TOKEN_INVALID");
      }

      await tx.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      });

      await tx.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      });

      // Invalidate any other outstanding reset tokens for this user.
      await tx.passwordResetToken.updateMany({
        where: { userId: record.userId, usedAt: null, id: { not: record.id } },
        data: { usedAt: new Date() },
      });
    });

    return NextResponse.json({
      ok: true,
      message: "تم تغيير كلمة المرور بنجاح.",
    });
  } catch (e) {
    if (e instanceof Error && e.message === "TOKEN_INVALID") {
      return NextResponse.json(
        { ok: false, message: "رابط إعادة التعيين غير صالح أو منتهٍ." },
        { status: 400 }
      );
    }
    console.error("[auth/reset-password] error");
    return NextResponse.json({ ok: false, message: "تعذّر إعادة تعيين كلمة المرور." }, { status: 500 });
  }
}
