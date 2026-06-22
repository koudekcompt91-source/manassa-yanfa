import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromCookies } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Admin view of purchase requests. Optional `?status=` and `?itemId=` filters. */
export async function GET(req: Request) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const statusParam = String(url.searchParams.get("status") || "").trim().toUpperCase();
    const itemId = String(url.searchParams.get("itemId") || "").trim();
    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "FULFILLED"];

    const where: { status?: any; storeItemId?: string } = {};
    if (validStatuses.includes(statusParam)) where.status = statusParam;
    if (itemId) where.storeItemId = itemId;

    const orders = await prisma.storeOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        storeItem: { select: { title: true, teacher: { select: { fullName: true } } } },
        student: { select: { email: true, fullName: true } },
      },
    });

    return NextResponse.json({
      ok: true,
      orders: orders.map((o) => ({
        id: o.id,
        storeItemId: o.storeItemId,
        itemTitle: o.storeItem?.title || "",
        teacherName: o.storeItem?.teacher?.fullName || "",
        fullName: o.fullName,
        lastName: o.lastName,
        phone: o.phone,
        wilaya: o.wilaya || "",
        status: o.status,
        studentEmail: o.student?.email || "",
        studentName: o.student?.fullName || "",
        createdAt: o.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    console.error("[admin/store/orders][GET] error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الطلبات." }, { status: 500 });
  }
}
