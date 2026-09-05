import { prisma } from "@/lib/prisma";

type PdfInput = { title?: string; url?: string };

function normalizePdfList(input: unknown): { title: string; url: string; order: number }[] {
  if (!Array.isArray(input)) return [];
  const rows: { title: string; url: string; order: number }[] = [];
  input.forEach((item, index) => {
    if (!item || typeof item !== "object") return;
    const row = item as PdfInput;
    const url = String(row.url || "").trim();
    if (!url) return;
    const title = String(row.title || "").trim() || `مستند PDF ${index + 1}`;
    rows.push({ title, url, order: index });
  });
  return rows;
}

/** Upsert CourseVideo and keep legacy Course.videoUrl in sync for compatibility. */
export async function syncCourseVideo(courseId: string, videoUrl: string | null) {
  const url = String(videoUrl || "").trim();
  if (!url) {
    await prisma.courseVideo.deleteMany({ where: { courseId } });
    await prisma.course.update({ where: { id: courseId }, data: { videoUrl: null } });
    return;
  }

  await prisma.courseVideo.upsert({
    where: { courseId },
    create: { courseId, videoUrl: url },
    update: { videoUrl: url },
  });
  await prisma.course.update({ where: { id: courseId }, data: { videoUrl: url } });
}

/** Replace CoursePDF rows for a course (never parse description). */
export async function syncCoursePdfs(courseId: string, pdfsInput: unknown) {
  const pdfs = normalizePdfList(pdfsInput);
  await prisma.coursePDF.deleteMany({ where: { courseId } });
  if (!pdfs.length) return;
  await prisma.coursePDF.createMany({
    data: pdfs.map((p) => ({
      courseId,
      title: p.title,
      url: p.url,
      order: p.order,
    })),
  });
}

export async function loadFreeCourseMedia(courseId: string) {
  const [video, pdfs] = await Promise.all([
    prisma.courseVideo.findUnique({ where: { courseId }, select: { videoUrl: true } }),
    prisma.coursePDF.findMany({
      where: { courseId },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: { id: true, title: true, url: true, order: true },
    }),
  ]);
  return {
    videoUrl: video?.videoUrl || "",
    pdfs: pdfs.map((p) => ({ id: p.id, title: p.title, url: p.url, order: p.order })),
  };
}
