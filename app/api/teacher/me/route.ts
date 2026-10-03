import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeacherApiSession } from "@/lib/auth/api-guards";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const guard = await requireTeacherApiSession();
  if (!guard.ok) return guard.response;

  try {
    const user = await prisma.user.findUnique({
      where: { id: guard.session.sub },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.role !== "TEACHER" || user.status !== "ACTIVE") {
      return NextResponse.json({ ok: false, message: "غير مصرح لك بهذه العملية." }, { status: 403 });
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (e) {
    console.error("[teacher/me][GET] error");
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الحساب." }, { status: 500 });
  }
}
