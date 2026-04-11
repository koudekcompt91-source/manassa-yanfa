/** Shared helpers for lesson publish/access (demo store + public pages). */

export function isLessonPublished(lesson) {
  if (!lesson) return false;
  const v = lesson.isPublished;
  if (v === true || v === "true") return true;
  if (v === "published" || v === 1) return true;
  if (lesson.status === "published") return true;
  return false;
}

/** free | premium — treats paid/مدفوع as premium for demo compatibility */
export function normalizeLessonAccessType(lesson) {
  const a = lesson?.accessType;
  if (a === "premium" || a === "paid" || a === "مدفوع") return "premium";
  return "free";
}
