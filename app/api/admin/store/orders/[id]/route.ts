import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromCookies } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_STATUSES = ["PENDING", "APPROVED", "REJECTED", "FULFILLED"] as const;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const status = String(body?.status || "").trim().toUpperCase();
    if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      return NextResponse.json({ ok: false, message: "حالة غير صالحة." }, { status: 400 });
    }

    const note = body?.note !== undefined ? String(body.note || "").trim() || null : undefined;

    const order = await prisma.storeOrder.update({
      where: { id: params.id },
      data: { status: status as (typeof VALID_STATUSES)[number], ...(note !== undefined ? { note } : {}) },
      select: { id: true, status: true, note: true },
    });

    return NextResponse.json({ ok: true, message: "تم تحديث حالة الطلب.", order });
  } catch (e) {
    console.error("[admin/store/orders/:id][PATCH] error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, message: "تعذّر تحديث الطلب." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });
  }

  try {
    await prisma.storeOrder.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true, message: "تم حذف الطلب." });
  } catch (e) {
    console.error("[admin/store/orders/:id][DELETE] error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, message: "تعذّر حذف الطلب." }, { status: 500 });
  }
}
