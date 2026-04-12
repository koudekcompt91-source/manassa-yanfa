import { NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { approveRechargeRequestDb } from "@/lib/server-wallet";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });
  }

  const id = params.id;
  const res = await approveRechargeRequestDb(id);
  if (!res.ok) {
    return NextResponse.json({ ok: false, message: res.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
