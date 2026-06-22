import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudentApiSession } from "@/lib/auth/api-guards";
import { validateStoreOrderInput } from "@/lib/store-validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Student submits a purchase request ("طلب شراء") for a published store item. */
export async function POST(req: Request) {
  const guard = await requireStudentApiSession();
  if (!guard.ok) return guard.response;
  const session = guard.session;

  try {
    const body = await req.json();
    const storeItemId = String(body?.storeItemId || "").trim();
    if (!storeItemId) {
      return NextResponse.json({ ok: false, message: "معرّف العنصر مفقود." }, { status: 400 });
    }

    const valid = validateStoreOrderInput(body);
    if (!valid.ok) {
      return NextResponse.json({ ok: false, message: valid.message }, { status: 400 });
    }

    // Only published items can receive purchase requests.
    const item = await prisma.storeItem.findFirst({
      where: { id: storeItemId, status: "PUBLISHED" },
      select: { id: true, title: true },
    });
    if (!item) {
      return NextResponse.json({ ok: false, message: "هذا العنصر غير متاح." }, { status: 404 });
    }

    await prisma.storeOrder.create({
      data: {
        storeItemId: item.id,
        studentId: session.sub,
        fullName: valid.value.fullName,
        lastName: valid.value.lastName,
        phone: valid.value.phone,
        status: "PENDING",
      },
    });

    return NextResponse.json({ ok: true, message: "تم إرسال طلب الشراء بنجاح. سيتم التواصل معك قريبًا." });
  } catch (e) {
    console.error("[store/orders][POST] error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, message: "تعذّر إرسال الطلب." }, { status: 500 });
  }
}
