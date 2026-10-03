import { prisma } from "@/lib/prisma";

export const TEACHER_ENROLL_SOURCE = "TEACHER";

export function normalizeStudentEmail(raw: unknown): string {
  return String(raw || "").trim().toLowerCase().slice(0, 120);
}

export function isPlausibleEmail(email: string): boolean {
  return email.includes("@") && email.length >= 5 && !email.includes(" ");
}

/**
 * PAID course owned by the authenticated teacher.
 * teacherId always comes from the session, never the client.
 */
export async function loadTeacherOwnedPaidCourse(teacherId: string, courseId: string) {
  const id = String(courseId || "").trim();
  if (!id || !teacherId) return null;

  return prisma.course.findFirst({
    where: {
      id,
      system: "PAID",
      teacherId,
    },
    select: {
      id: true,
      title: true,
      teacherId: true,
      system: true,
      status: true,
      accessType: true,
      level: true,
      academicLevel: true,
    },
  });
}
