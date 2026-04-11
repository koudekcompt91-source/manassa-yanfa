import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { rejectRechargeRequestDb } from "@/lib/server-wallet";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });
  }

  const id = params.id;
  let note = "";
  try {
    const body = await req.json();
    note = String(body.note || "");
  } catch {
    note = "";
  }

  const res = await rejectRechargeRequestDb(id, note);
  if (!res.ok) {
    return NextResponse.json({ ok: false, message: res.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
