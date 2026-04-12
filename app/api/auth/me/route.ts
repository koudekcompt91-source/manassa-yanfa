import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EMPTY = { user: null, enrollments: [], transactions: [], pendingRechargeCount: 0 };

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json(EMPTY);

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        academicLevel: true,
        level: true,
        phone: true,
        walletBalance: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user || user.status !== "ACTIVE") return NextResponse.json(EMPTY);

    const [enrollments, transactions, pendingRechargeCount] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId: user.id },
        orderBy: { enrolledAt: "desc" },
      }),
      prisma.walletTransaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 25,
      }),
      prisma.rechargeRequest.count({
        where: { userId: user.id, status: "pending" },
      }),
    ]);

    return NextResponse.json({
      user: { ...user, createdAt: user.createdAt.toISOString() },
      enrollments,
      transactions: transactions.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })),
      pendingRechargeCount,
    });
  } catch (e) {
    console.error("[me] error:", e instanceof Error ? e.message : e);
    return NextResponse.json(EMPTY);
  }
}
