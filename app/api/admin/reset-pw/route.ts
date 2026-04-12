import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

export const runtime = "nodejs";

/**
 * ONE-TIME admin password reset endpoint.
 * DELETE THIS FILE after use.
 * GET /api/admin/reset-pw
 */
export async function GET() {
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
        password: newPassword,
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
      password: newPassword,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[reset-pw]", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
