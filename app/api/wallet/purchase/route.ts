import { NextResponse } from "next/server";
import { getStudentSessionFromCookies } from "@/lib/auth/session";
import { purchaseOrEnrollPackageDb } from "@/lib/server-wallet";

export async function POST(req: Request) {
  const session = await getStudentSessionFromCookies();
  if (!session) {
    return NextResponse.json({ ok: false, message: "يجب تسجيل الدخول لإتمام الشراء." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const packageId = String(body.packageId || "");
    if (!packageId) {
      return NextResponse.json({ ok: false, message: "معرّف الباقة مفقود." }, { status: 400 });
    }

    const res = await purchaseOrEnrollPackageDb(session.sub, packageId);
    if (!res.ok) {
      const status =
        res.code === "insufficient"
          ? 402
          : res.code === "already_enrolled"
            ? 409
            : res.code === "wrong_level" || res.code === "no_academic_level"
              ? 403
              : 400;
      return NextResponse.json({ ok: false, code: res.code, message: res.message }, { status });
    }
    return NextResponse.json({ ok: true, code: res.code });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, message: "تعذّر إتمام العملية." }, { status: 500 });
  }
}
