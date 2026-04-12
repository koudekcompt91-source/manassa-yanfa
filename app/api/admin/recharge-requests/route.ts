import { NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });
  }

  const rows = await prisma.rechargeRequest.findMany({
    include: {
      user: { select: { id: true, fullName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    ok: true,
    requests: rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      reviewedAt: r.reviewedAt?.toISOString() ?? null,
    })),
  });
}
