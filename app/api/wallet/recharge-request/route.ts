import { NextResponse } from "next/server";
import { requireStudentApiSession } from "@/lib/auth/api-guards";
import { submitRechargeRequestDb } from "@/lib/server-wallet";

export async function POST(req: Request) {
  const guard = await requireStudentApiSession();
  if (!guard.ok) return guard.response;
  const session = guard.session;

  try {
    const body = await req.json();
    const res = await submitRechargeRequestDb(session.sub, {
      paymentMethod: String(body.paymentMethod || "ccp"),
      firstName: String(body.firstName || ""),
      lastName: String(body.lastName || ""),
      wilaya: String(body.wilaya || ""),
      baladiya: String(body.baladiya || ""),
      phone: String(body.phone || ""),
      amount: Number(body.amount),
      receiptImage: String(body.receiptImage || ""),
      note: String(body.note || ""),
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, message: res.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, message: "تعذّر حفظ الطلب." }, { status: 500 });
  }
}
