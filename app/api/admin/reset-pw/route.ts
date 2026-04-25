import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

export const runtime = "nodejs";

/**
 * ONE-TIME admin password reset endpoint.
 * DELETE THIS FILE after use.
 * GET /api/admin/reset-pw
 */
export async function GET(req: Request) {
  // Never expose this helper in production.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, message: "غير متاح." }, { status: 404 });
  }

  const url = new URL(req.url);
  const token = String(url.searchParams.get("token") || "");
  const expected = String(process.env.ADMIN_RESET_TOKEN || "");
  if (!expected || token !== expected) {
    return NextResponse.json({ ok: false, message: "غير مصرح." }, { status: 401 });
  }

  const email = "admin@yanfa.app";
  const newPassword = "Admin123456!";

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const hash = await hashPassword(newPassword);
      const created = await prisma.user.create({
        data: {
          email,
          passwordHash: hash,
          fullName: "مدير المنصة",
          role: "ADMIN",
          status: "ACTIVE",
          level: "unknown",
          walletBalance: 0,
        },
      });
      return NextResponse.json({
        ok: true,
        action: "created",
        id: created.id,
        email: created.email,
        role: created.role,
        message: "تم إنشاء حساب الإدارة بنجاح. استخدم كلمة المرور الافتراضية من الإعدادات الآمنة.",
      });
    }

    const hash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { email },
      data: { passwordHash: hash, role: "ADMIN", status: "ACTIVE" },
    });

    return NextResponse.json({
      ok: true,
      action: "updated",
      id: user.id,
      email: user.email,
      role: "ADMIN",
      previousRole: user.role,
      message: "تم تحديث كلمة مرور الإدارة بنجاح.",
    });
  } catch (e) {
    console.error("[reset-pw] failed");
    return NextResponse.json({ ok: false, message: "تعذّر تنفيذ العملية." }, { status: 500 });
  }
}
