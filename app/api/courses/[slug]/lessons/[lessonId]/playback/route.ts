import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentSessionFromCookies } from "@/lib/auth/session";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { isFreeSubscription } from "@/lib/subscription";
import { extractYoutubeVideoId } from "@/lib/youtube";
import { accountRefForWatermark, maskEmailForWatermark } from "@/lib/content-protection";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Authorized PAID-lesson playback.
 * Identity comes from the session cookie — never from a client userId.
 * Returns a YouTube nocookie embed only after access checks.
 * YouTube itself has no short-lived signed URL in this project.
 */
export async function GET(req: Request, { params }: { params: { slug: string; lessonId: string } }) {
  const ip = getClientIp(req);
  const rate = checkRateLimit({
    key: `paid-lesson-playback:${ip}`,
    limit: 40,
    windowMs: 60_000,
  });
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, message: "عدد الطلبات كبير. حاول بعد قليل." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
    );
  }

  const session = await getStudentSessionFromCookies();
  if (!session?.sub) {
    return NextResponse.json({ ok: false, message: "يجب تسجيل الدخول أولًا." }, { status: 401 });
  }

  const ref = decodeURIComponent(String(params.slug || "")).trim();
  const lessonId = decodeURIComponent(String(params.lessonId || "")).trim();
  if (!ref || !lessonId) {
    return NextResponse.json({ ok: false, message: "الدرس غير موجود." }, { status: 404 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        subscriptionType: true,
      },
    });

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });
    }
    if (user.status !== "ACTIVE") {
      return NextResponse.json({ ok: false, message: "الحساب غير مفعّل." }, { status: 403 });
    }
    if (isFreeSubscription(user.subscriptionType)) {
      return NextResponse.json(
        { ok: false, message: "هذه الميزة متاحة للحساب الكامل فقط.", code: "PAID_REQUIRED" },
        { status: 403 }
      );
    }

    const course = await prisma.course.findFirst({
      where: { system: "PAID", OR: [{ slug: ref }, { id: ref }] },
      select: { id: true, status: true, accessType: true },
    });
    if (!course || course.status !== "PUBLISHED") {
      return NextResponse.json({ ok: false, message: "الدورة غير متاحة." }, { status: 404 });
    }

    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, courseId: course.id, isPublished: true },
      select: { id: true, title: true, youtubeUrl: true, youtubeVideoId: true, isFreePreview: true },
    });
    if (!lesson) {
      return NextResponse.json({ ok: false, message: "الدرس غير موجود." }, { status: 404 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_packageId: { userId: user.id, packageId: course.id } },
      select: { id: true },
    });
    const canWatch = course.accessType === "FREE" || Boolean(enrollment) || lesson.isFreePreview;
    if (!canWatch) {
      return NextResponse.json({ ok: false, message: "لا يمكنك مشاهدة هذا الدرس." }, { status: 403 });
    }

    const videoId =
      extractYoutubeVideoId(lesson.youtubeVideoId || "") || extractYoutubeVideoId(lesson.youtubeUrl || "");
    if (!videoId) {
      return NextResponse.json({ ok: false, message: "لا يوجد فيديو صالح لهذا الدرس." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      lesson: { id: lesson.id, title: lesson.title },
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      watermark: {
        platform: "منصة ينفع",
        fullName: user.fullName,
        emailMasked: maskEmailForWatermark(user.email),
        accountRef: accountRefForWatermark(user.id),
      },
    });
  } catch (e) {
    console.error("[courses/:slug/lessons/:lessonId/playback] error");
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الفيديو." }, { status: 500 });
  }
}
