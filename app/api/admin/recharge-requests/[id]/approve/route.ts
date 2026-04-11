import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { approveRechargeRequestDb } from "@/lib/server-wallet";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });
  }

  const id = params.id;
  const res = await approveRechargeRequestDb(id);
  if (!res.ok) {
    return NextResponse.json({ ok: false, message: res.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
