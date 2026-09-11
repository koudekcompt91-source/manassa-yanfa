import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { getDisplayLevelLabel } from "@/lib/student-level-codes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * List PAID students awaiting activation (status=PENDING).
 * Optional ?email= for server-side exact or prefix search (max 120 chars).
 */
export async function GET(req: Request) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  const ip = getClientIp(req);
  const rate = checkRateLimit({
    key: `admin-student-activation-list:${ip}:${guard.session.sub}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, message: "عدد الطلبات كبير. حاول بعد قليل." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const emailRaw = String(searchParams.get("email") || "")
      .trim()
      .toLowerCase()
      .slice(0, 120);

    const users = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        subscriptionType: "PAID",
        status: "PENDING",
        ...(emailRaw
          ? {
              email: emailRaw.includes("@")
                ? { equals: emailRaw }
                : { startsWith: emailRaw },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        email: true,
        fullName: true,
        academicLevel: true,
        level: true,
        status: true,
        subscriptionType: true,
        createdAt: true,
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
        levelLabel: getDisplayLevelLabel(u) || u.academicLevel || u.level || "—",
        status: u.status,
        subscriptionType: u.subscriptionType,
        createdAt: u.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    console.error("[admin/student-activation][GET] error");
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الحسابات المعلّقة." }, { status: 500 });
  }
}
