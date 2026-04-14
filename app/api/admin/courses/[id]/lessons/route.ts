import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { extractYoutubeVideoId } from "@/lib/youtube";

function normalizeLesson(lesson: {
  id: string;
  courseId: string;
  title: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  description: string;
  order: number;
  isPublished: boolean;
  durationSec: number | null;
  isFreePreview: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...lesson,
    createdAt: lesson.createdAt.toISOString(),
    updatedAt: lesson.updatedAt.toISOString(),
  };
}

function validate(body: any) {
  const title = String(body?.title || "").trim();
  const youtubeUrl = String(body?.youtubeUrl || "").trim();
  const description = String(body?.description || "").trim();
  const order = Math.max(1, Number(body?.order) || 1);
  const durationSec = body?.durationSec !== undefined && body?.durationSec !== null ? Math.max(0, Number(body.durationSec) || 0) : null;
  const isPublished = Boolean(body?.isPublished);
  const isFreePreview = Boolean(body?.isFreePreview);
  if (!title) return { ok: false as const, message: "عنوان الدرس مطلوب." };
  const youtubeVideoId = extractYoutubeVideoId(youtubeUrl);
  if (!youtubeVideoId) return { ok: false as const, message: "رابط يوتيوب غير صالح." };
  return {
    ok: true as const,
    value: { title, youtubeUrl, youtubeVideoId, description, order, durationSec, isPublished, isFreePreview },
  };
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });

  const lessons = await prisma.lesson.findMany({
    where: { courseId: params.id },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ ok: true, lessons: lessons.map(normalizeLesson) });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });

  try {
    const valid = validate(await req.json());
    if (!valid.ok) return NextResponse.json({ ok: false, message: valid.message }, { status: 400 });

    const course = await prisma.course.findUnique({ where: { id: params.id }, select: { id: true } });
    if (!course) return NextResponse.json({ ok: false, message: "الدورة غير موجودة." }, { status: 404 });

    // Shift down lessons at/after target order to keep order stable.
    await prisma.lesson.updateMany({
      where: { courseId: params.id, order: { gte: valid.value.order } },
      data: { order: { increment: 1 } },
    });

    const lesson = await prisma.lesson.create({
      data: {
        courseId: params.id,
        ...valid.value,
      },
    });

    return NextResponse.json({ ok: true, message: "تمت إضافة الدرس.", lesson: normalizeLesson(lesson) });
  } catch (e) {
    console.error("[admin/courses/:id/lessons][POST] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر إضافة الدرس." }, { status: 500 });
  }
}
