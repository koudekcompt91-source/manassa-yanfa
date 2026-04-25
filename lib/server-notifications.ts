import { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type NotifyPayload = {
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
};

function uniqueIds(ids: string[]) {
  return Array.from(new Set(ids.map((id) => String(id || "").trim()).filter(Boolean)));
}

export async function createNotificationsForUsers(userIds: string[], payload: NotifyPayload) {
  const ids = uniqueIds(userIds);
  if (!ids.length) return 0;
  const title = String(payload.title || "").trim();
  const message = String(payload.message || "").trim();
  if (!title || !message) return 0;

  const data = ids.map((userId) => ({
    userId,
    title,
    message,
    type: payload.type,
    link: payload.link ? String(payload.link).trim() : null,
    isRead: false,
  }));

  const res = await prisma.notification.createMany({ data });
  return res.count;
}

export async function getAllActiveStudentIds() {
  const rows = await prisma.user.findMany({
    where: { role: "STUDENT", status: "ACTIVE" },
    select: { id: true },
  });
  return rows.map((row) => row.id);
}

export async function getAllActiveAdminIds() {
  const rows = await prisma.user.findMany({
    where: { role: "ADMIN", status: "ACTIVE" },
    select: { id: true },
  });
  return rows.map((row) => row.id);
}

export async function getEnrolledStudentIdsByCourseId(courseId: string) {
  const rows = await prisma.enrollment.findMany({
    where: { packageId: courseId },
    select: { userId: true },
  });
  return uniqueIds(rows.map((row) => row.userId));
}

export async function notifyNewPublishedLesson(courseId: string, courseSlug: string | null) {
  const userIds = await getEnrolledStudentIdsByCourseId(courseId);
  return createNotificationsForUsers(userIds, {
    title: "درس جديد",
    message: "تمت إضافة درس جديد إلى الدورة.",
    type: "NEW_LESSON",
    link: courseSlug ? `/packages/${courseSlug}` : null,
  });
}

export async function notifyNewPublishedLiveSession(courseId: string, courseSlug: string | null) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, accessType: true },
  });
  if (!course) return 0;

  const userIds =
    course.accessType === "PAID"
      ? await getEnrolledStudentIdsByCourseId(course.id)
      : await getAllActiveStudentIds();

  return createNotificationsForUsers(userIds, {
    title: "حصة مباشرة جديدة",
    message: "تمت إضافة حصة مباشرة جديدة في هذه الدورة.",
    type: "LIVE_SESSION",
    link: courseSlug ? `/packages/${courseSlug}?tab=live` : null,
  });
}

export async function notifyAdminsStudentChatMessage(courseTitle: string | null, conversationId: string) {
  const adminIds = await getAllActiveAdminIds();
  return createNotificationsForUsers(adminIds, {
    title: "رسالة جديدة من طالب",
    message: courseTitle ? `وصلتك رسالة جديدة في دورة ${courseTitle}.` : "وصلتك رسالة جديدة في محادثات الطلاب.",
    type: "GENERAL",
    link: `/admin/dashboard/messages?conversation=${encodeURIComponent(conversationId)}`,
  });
}

export async function notifyStudentAdminReply(studentId: string, courseSlug: string | null) {
  return createNotificationsForUsers([studentId], {
    title: "رد جديد من الأستاذ",
    message: "لديك رد جديد في محادثة الدورة.",
    type: "GENERAL",
    link: courseSlug ? `/packages/${courseSlug}?tab=chat` : null,
  });
}
