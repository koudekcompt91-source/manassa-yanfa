import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { getDisplayLevelLabel } from "@/lib/student-level-codes";
import {
  MANUAL_CREDIT_MAX_DZD,
  manualCreditStudentWalletDb,
  parseManualCreditAmount,
} from "@/lib/server-wallet";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteCtx = { params: { id: string } };

/**
 * POST /api/admin/student-wallet/[id]/credit
 *
 * Body: { amount: number | string } — client must NOT send walletBalance/balanceAfter.
 * Server computes balanceAfter and writes WalletTransaction(type=MANUAL_CREDIT).
 *
 * Auth: requireAdminApiSession only (ADMIN). No TEACHER bypass until Teacher Auth exists.
 */
export async function POST(req: Request, { params }: RouteCtx) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  const ip = getClientIp(req);
  const rate = checkRateLimit({
    key: `admin-student-wallet-credit:${ip}:${guard.session.sub}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, message: "عدد عمليات إضافة الرصيد كبير. حاول بعد قليل." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
    );
  }

  try {
    const studentId = String(params.id || "").trim();
    if (!studentId) {
      return NextResponse.json({ ok: false, message: "معرّف الطالب غير صالح." }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    // Intentionally ignore any client-provided walletBalance / balanceAfter / role / status.
    const parsed = parseManualCreditAmount(body?.amount);
    if (!parsed.ok) {
      return NextResponse.json({ ok: false, message: parsed.message }, { status: 400 });
    }

    const result = await manualCreditStudentWalletDb(studentId, parsed.amount);
    if (!result.ok) {
      const status =
        result.message.includes("غير موجود")
          ? 404
          : result.message.includes("إدارة") ||
              result.message.includes("أستاذ") ||
              result.message.includes("الطلاب فقط")
            ? 403
            : 400;
      return NextResponse.json({ ok: false, message: result.message }, { status });
    }

    console.info(
      `[WALLET_MANUAL_CREDIT] admin=${guard.session.sub} student=${result.user.id} amount=${parsed.amount} balanceAfter=${result.transaction.balanceAfter} at=${new Date().toISOString()}`
    );

    return NextResponse.json({
      ok: true,
      message: "تمت إضافة الرصيد بنجاح.",
      maxPerOperation: MANUAL_CREDIT_MAX_DZD,
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
        status: result.user.status,
        subscriptionType: result.user.subscriptionType,
        level: result.user.level,
        academicLevel: result.user.academicLevel,
        levelLabel:
          getDisplayLevelLabel(result.user) ||
          result.user.academicLevel ||
          result.user.level ||
          "—",
        walletBalance: result.user.walletBalance,
      },
      transaction: {
        id: result.transaction.id,
        type: result.transaction.type,
        amount: result.transaction.amount,
        labelAr: result.transaction.labelAr,
        balanceAfter: result.transaction.balanceAfter,
        note: result.transaction.note,
        createdAt: result.transaction.createdAt.toISOString(),
      },
      previousBalance: result.previousBalance,
    });
  } catch (e) {
    console.error("[admin/student-wallet/:id/credit][POST] error");
    return NextResponse.json({ ok: false, message: "تعذّرت إضافة الرصيد." }, { status: 500 });
  }
}
