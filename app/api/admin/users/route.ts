import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      fullName: true,
      academicLevel: true,
      level: true,
      phone: true,
      walletBalance: true,
      status: true,
      createdAt: true,
      _count: { select: { enrollments: true } },
    },
  });

  return NextResponse.json({
    ok: true,
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      academicLevel: u.academicLevel,
      level: u.level,
      phone: u.phone,
      walletBalance: u.walletBalance,
      status: u.status,
      createdAt: u.createdAt.toISOString(),
      enrollmentsCount: u._count.enrollments,
    })),
  });
}
