import type { PaidFileContentType } from "@prisma/client";
import { isValidStudentLevelCode, mapStudentLevelCodeToArabic } from "@/lib/student-level-codes";

export const PAID_FILE_CONTENT_TYPES = ["SUMMARY", "ASSIGNMENT", "EXAM", "LIBRARY"] as const;

export type PaidFileContentTypeValue = (typeof PAID_FILE_CONTENT_TYPES)[number];

export function normalizePaidFileContentType(value: unknown): PaidFileContentTypeValue | null {
  const raw = String(value || "").trim().toUpperCase();
  if (PAID_FILE_CONTENT_TYPES.includes(raw as PaidFileContentTypeValue)) {
    return raw as PaidFileContentTypeValue;
  }
  return null;
}

export function normalizePaidFileContent(row: {
  id: string;
  courseId: string;
  contentType: PaidFileContentType;
  title: string;
  description: string;
  subject: string | null;
  level: string | null;
  academicLevel: string | null;
  fileUrl: string;
  fileName: string | null;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  course?: {
    id: string;
    title: string;
    slug: string;
    system: string;
    accessType?: string;
    status?: string;
    level?: string | null;
    academicLevel?: string | null;
  } | null;
}) {
  return {
    id: row.id,
    courseId: row.courseId,
    contentType: row.contentType,
    title: row.title,
    description: row.description,
    subject: row.subject,
    level: row.level,
    academicLevel: row.academicLevel,
    fileUrl: row.fileUrl,
    fileName: row.fileName,
    isPublished: row.isPublished,
    order: row.order,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    course: row.course
      ? {
          id: row.course.id,
          title: row.course.title,
          slug: row.course.slug,
          system: row.course.system,
          accessType: row.course.accessType,
          status: row.course.status,
          level: row.course.level ?? null,
          academicLevel: row.course.academicLevel ?? null,
        }
      : null,
  };
}

export function validatePaidFileContentPayload(body: any, { partial = false }: { partial?: boolean } = {}) {
  const data: Record<string, unknown> = {};

  if (!partial || body?.title !== undefined) {
    const title = String(body?.title || "").trim();
    if (!title) return { ok: false as const, message: "عنوان الملخص مطلوب." };
    data.title = title;
  }

  if (!partial || body?.description !== undefined) {
    data.description = String(body?.description || "").trim();
  }

  if (!partial || body?.subject !== undefined) {
    data.subject = String(body?.subject || "").trim() || null;
  }

  if (!partial || body?.level !== undefined) {
    const level = String(body?.level || "").trim() || null;
    if (level && !isValidStudentLevelCode(level)) {
      return { ok: false as const, message: "المستوى الدراسي المختار غير صالح." };
    }
    data.level = level;
    data.academicLevel = isValidStudentLevelCode(level) ? mapStudentLevelCodeToArabic(level) : null;
  }

  if (!partial || body?.fileUrl !== undefined) {
    const fileUrl = String(body?.fileUrl || "").trim();
    if (!fileUrl) return { ok: false as const, message: "رابط ملف PDF مطلوب." };
    try {
      const url = new URL(fileUrl);
      if (!/^https?:$/.test(url.protocol)) {
        return { ok: false as const, message: "رابط الملف غير صالح." };
      }
    } catch {
      return { ok: false as const, message: "رابط الملف غير صالح." };
    }
    data.fileUrl = fileUrl;
  }

  if (!partial || body?.fileName !== undefined) {
    data.fileName = String(body?.fileName || "").trim() || null;
  }

  if (!partial || body?.isPublished !== undefined) {
    data.isPublished = Boolean(body?.isPublished);
  }

  if (!partial || body?.order !== undefined) {
    data.order = Math.max(0, Number(body?.order) || 0);
  }

  if (!partial || body?.contentType !== undefined) {
    const contentType = normalizePaidFileContentType(body?.contentType);
    if (!contentType) return { ok: false as const, message: "نوع المحتوى غير صالح." };
    data.contentType = contentType;
  }

  if (!partial || body?.courseId !== undefined) {
    const courseId = String(body?.courseId || "").trim();
    if (!courseId) return { ok: false as const, message: "اختر الدورة المدفوعة." };
    data.courseId = courseId;
  }

  return { ok: true as const, data };
}
