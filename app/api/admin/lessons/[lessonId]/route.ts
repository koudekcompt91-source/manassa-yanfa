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

export async function PATCH(req: Request, { params }: { params: { lessonId: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });

  try {
    const body = await req.json();
    const data: any = {};

    if (body?.title !== undefined) {
      const title = String(body.title || "").trim();
      if (!title) return NextResponse.json({ ok: false, message: "عنوان الدرس مطلوب." }, { status: 400 });
      data.title = title;
    }
    if (body?.youtubeUrl !== undefined) {
      const youtubeUrl = String(body.youtubeUrl || "").trim();
      const youtubeVideoId = extractYoutubeVideoId(youtubeUrl);
      if (!youtubeVideoId) return NextResponse.json({ ok: false, message: "رابط يوتيوب غير صالح." }, { status: 400 });
      data.youtubeUrl = youtubeUrl;
      data.youtubeVideoId = youtubeVideoId;
    }
    if (body?.description !== undefined) data.description = String(body.description || "").trim();
    if (body?.order !== undefined) data.order = Math.max(1, Number(body.order) || 1);
    if (body?.durationSec !== undefined) data.durationSec = body.durationSec === null ? null : Math.max(0, Number(body.durationSec) || 0);
    if (body?.isPublished !== undefined) data.isPublished = Boolean(body.isPublished);
    if (body?.isFreePreview !== undefined) data.isFreePreview = Boolean(body.isFreePreview);

    const lesson = await prisma.lesson.update({
      where: { id: params.lessonId },
      data,
    });
    return NextResponse.json({ ok: true, message: "تم تحديث الدرس.", lesson: normalizeLesson(lesson) });
  } catch (e) {
    console.error("[admin/lessons/:id][PATCH] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحديث الدرس." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { lessonId: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });

  try {
    await prisma.lesson.delete({ where: { id: params.lessonId } });
    return NextResponse.json({ ok: true, message: "تم حذف الدرس." });
  } catch (e) {
    console.error("[admin/lessons/:id][DELETE] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر حذف الدرس." }, { status: 500 });
  }
}
