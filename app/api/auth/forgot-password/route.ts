import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
  PASSWORD_RESET_GENERIC_MESSAGE,
  passwordResetExpiryDate,
} from "@/lib/auth/password-reset";
import { sendPasswordResetEmail } from "@/lib/email/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    const ip = getClientIp(req);

    const rate = checkRateLimit({
      key: `forgot-password:${ip}:${email || "unknown"}`,
      limit: 5,
      windowMs: 60_000,
    });
    if (!rate.ok) {
      return NextResponse.json(
        { ok: false, message: "عدد المحاولات كبير. حاول بعد قليل." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, message: "أدخل بريدًا إلكترونيًا صالحًا." }, { status: 400 });
    }

    // Always return the same message shape to avoid account enumeration.
    const success = () =>
      NextResponse.json({ ok: true, message: PASSWORD_RESET_GENERIC_MESSAGE });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, fullName: true, status: true },
    });

    if (!user || user.status !== "ACTIVE") {
      return success();
    }

    const rawToken = generatePasswordResetToken();
    const tokenHash = hashPasswordResetToken(rawToken);
    const expiresAt = passwordResetExpiryDate();

    await prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      await tx.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });
    });

    const sent = await sendPasswordResetEmail({
      to: user.email,
      fullName: user.fullName,
      rawToken,
    });

    if (!sent.ok) {
      // Do not reveal whether the account exists; keep response generic.
      // Server logs already contain non-sensitive failure reason.
      return success();
    }

    return success();
  } catch (e) {
    console.error("[auth/forgot-password] error");
    return NextResponse.json(
      { ok: true, message: PASSWORD_RESET_GENERIC_MESSAGE },
      { status: 200 }
    );
  }
}
