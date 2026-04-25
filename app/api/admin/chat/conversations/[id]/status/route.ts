import { NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });

  try {
    const body = await req.json();
    const statusRaw = String(body?.status || "").trim().toUpperCase();
    if (statusRaw !== "OPEN" && statusRaw !== "CLOSED") {
      return NextResponse.json({ ok: false, message: "حالة المحادثة غير صالحة." }, { status: 400 });
    }

    const conversation = await prisma.chatConversation.update({
      where: { id: params.id },
      data: { status: statusRaw === "OPEN" ? "OPEN" : "CLOSED" },
      select: { id: true, status: true },
    });

    return NextResponse.json({ ok: true, conversation });
  } catch (e) {
    console.error("[admin/chat/conversations/:id/status][PATCH] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحديث حالة المحادثة." }, { status: 500 });
  }
}
