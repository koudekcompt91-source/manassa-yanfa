import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import {
  mapStudentSafe,
  parsePage,
  parsePageSize,
  parseStudentSearchQuery,
  studentSafeSelect,
  studentSearchWhere,
} from "@/lib/admin/student-management";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Admin student wallet search — STUDENT role only.
 * Query: ?q=&page=&pageSize=
 *
 * Authorization today: requireAdminApiSession (ADMIN only).
 * Future: when Teacher Auth exists, extend the guard — do not add TEACHER bypass here.
 */
export async function GET(req: Request) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  const ip = getClientIp(req);
  const rate = checkRateLimit({
    key: `admin-student-wallet-list:${ip}:${guard.session.sub}`,
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
    const { searchParams } = new URL(req.url);
    const q = parseStudentSearchQuery(searchParams.get("q"));
    const page = parsePage(searchParams.get("page"));
    const pageSize = parsePageSize(searchParams.get("pageSize"));
    const skip = (page - 1) * pageSize;

    const where = {
      role: "STUDENT" as const,
      ...studentSearchWhere(q),
    };

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        select: studentSafeSelect,
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({
      ok: true,
      q,
      page,
      pageSize,
      total,
      totalPages,
      users: users.map((u) => mapStudentSafe(u)),
    });
  } catch (e) {
    console.error("[admin/student-wallet][GET] error");
    return NextResponse.json({ ok: false, message: "تعذّر البحث عن الطلاب." }, { status: 500 });
  }
}
