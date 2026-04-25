import { NotificationType } from "@prisma/client";
import { NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import {
  createNotificationsForUsers,
  getAllActiveStudentIds,
  getEnrolledStudentIdsByCourseId,
} from "@/lib/server-notifications";
import { prisma } from "@/lib/prisma";

function parsePayload(body: any) {
  const title = String(body?.title || "").trim();
  const message = String(body?.message || "").trim();
  const link = String(body?.link || "").trim() || null;
  const courseId = String(body?.courseId || "").trim() || null;
  const typeRaw = String(body?.type || "GENERAL").trim().toUpperCase();
  const allowed = new Set(["GENERAL", "LIVE_SESSION", "NEW_LESSON", "COURSE_ANNOUNCEMENT", "PAYMENT"]);
  const type = allowed.has(typeRaw) ? (typeRaw as NotificationType) : "GENERAL";

  if (!title) return { ok: false as const, message: "عنوان الإشعار مطلوب." };
  if (!message) return { ok: false as const, message: "نص الإشعار مطلوب." };
  if (link) {
    if (!link.startsWith("/") && !/^https?:\/\//i.test(link)) {
      return { ok: false as const, message: "الرابط يجب أن يكون داخليًا أو يبدأ بـ http/https." };
    }
  }
  return { ok: true as const, value: { title, message, link, courseId, type } };
}

export async function POST(req: Request) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });

  try {
    const valid = parsePayload(await req.json());
    if (!valid.ok) return NextResponse.json({ ok: false, message: valid.message }, { status: 400 });

    let userIds: string[] = [];
    if (valid.value.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: valid.value.courseId },
        select: { id: true },
      });
      if (!course) return NextResponse.json({ ok: false, message: "الدورة غير موجودة." }, { status: 404 });
      userIds = await getEnrolledStudentIdsByCourseId(course.id);
    } else {
      userIds = await getAllActiveStudentIds();
    }

    const sent = await createNotificationsForUsers(userIds, {
      title: valid.value.title,
      message: valid.value.message,
      type: valid.value.type,
      link: valid.value.link,
    });

    return NextResponse.json({
      ok: true,
      message: "تم إرسال الإشعارات بنجاح.",
      sentCount: sent,
    });
  } catch (e) {
    console.error("[admin/notifications][POST] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر إرسال الإشعارات." }, { status: 500 });
  }
}
