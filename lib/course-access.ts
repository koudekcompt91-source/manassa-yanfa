import { prisma } from "@/lib/prisma";
import { isFreeSubscription } from "@/lib/subscription";

export async function resolveCourseBySlugOrId(ref: string) {
  return prisma.course.findFirst({
    where: {
      system: "PAID",
      OR: [{ slug: ref }, { id: ref }],
    },
    select: {
      id: true,
      slug: true,
      title: true,
      accessType: true,
      status: true,
      system: true,
    },
  });
}

/** PAID-platform course access only. FREE students and FREE LMS rows are rejected. */
export async function resolveStudentCourseAccessByRef(ref: string, studentId: string) {
  const viewer = await prisma.user.findUnique({
    where: { id: studentId },
    select: { role: true, subscriptionType: true },
  });
  if (!viewer || viewer.role !== "STUDENT") return { ok: false as const, code: 403 };
  if (isFreeSubscription(viewer.subscriptionType)) return { ok: false as const, code: 403 };

  const course = await resolveCourseBySlugOrId(ref);
  if (!course || course.status !== "PUBLISHED") return { ok: false as const, code: 404 };

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_packageId: { userId: studentId, packageId: course.id } },
    select: { id: true },
  });
  const enrolled = Boolean(enrollment);
  const canAccessPaid = course.accessType === "FREE" || enrolled;
  if (!canAccessPaid) return { ok: false as const, code: 403 };

  return { ok: true as const, course, enrolled, canAccessPaid };
}
