import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromCookies } from "@/lib/auth/session";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });

  try {
    const body = await req.json();
    const lessonIds = Array.isArray(body?.lessonIds) ? body.lessonIds.map((v: any) => String(v)) : [];
    if (!lessonIds.length) {
      return NextResponse.json({ ok: false, message: "ترتيب الدروس غير صالح." }, { status: 400 });
    }

    const lessons = await prisma.lesson.findMany({
      where: { courseId: params.id },
      select: { id: true },
    });
    const existing = new Set(lessons.map((l) => l.id));
    if (lessonIds.some((id: string) => !existing.has(id))) {
      return NextResponse.json({ ok: false, message: "تعذّر مطابقة جميع الدروس مع الدورة." }, { status: 400 });
    }

    await prisma.$transaction(
      lessonIds.map((lessonId: string, idx: number) =>
        prisma.lesson.update({
          where: { id: lessonId },
          data: { order: idx + 1 },
        })
      )
    );

    return NextResponse.json({ ok: true, message: "تم حفظ ترتيب الدروس." });
  } catch (e) {
    console.error("[admin/courses/:id/lessons/reorder][POST] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر حفظ ترتيب الدروس." }, { status: 500 });
  }
}
