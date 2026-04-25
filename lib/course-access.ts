import { prisma } from "@/lib/prisma";

export async function resolveCourseBySlugOrId(ref: string) {
  return prisma.course.findFirst({
    where: { OR: [{ slug: ref }, { id: ref }] },
    select: {
      id: true,
      slug: true,
      title: true,
      accessType: true,
      status: true,
    },
  });
}

export async function resolveStudentCourseAccessByRef(ref: string, studentId: string) {
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
