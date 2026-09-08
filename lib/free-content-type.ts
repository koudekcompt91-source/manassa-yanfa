/** FREE LMS content types - maps to free-dashboard hub sections. */
export const FREE_CONTENT_TYPES = ["LESSON", "SUMMARY", "ASSIGNMENT", "EXAM", "COURSE"] as const;
export type FreeContentTypeCode = (typeof FREE_CONTENT_TYPES)[number];

export const FREE_CONTENT_TYPE_LABELS: Record<FreeContentTypeCode, string> = {
  LESSON: "الدروس",
  SUMMARY: "الملخصات",
  ASSIGNMENT: "الفروض",
  EXAM: "الاختبارات",
  COURSE: "الدورات",
};

export const FREE_CONTENT_TYPE_OPTIONS: { value: FreeContentTypeCode; label: string }[] =
  FREE_CONTENT_TYPES.map((value) => ({ value, label: FREE_CONTENT_TYPE_LABELS[value] }));

export function normalizeFreeContentType(value: unknown): FreeContentTypeCode {
  const raw = String(value || "").trim().toUpperCase();
  if ((FREE_CONTENT_TYPES as readonly string[]).includes(raw)) return raw as FreeContentTypeCode;
  return "COURSE";
}

/** Title field label by content type (admin form). */
export function freeContentTitleLabel(type: FreeContentTypeCode): string {
  switch (type) {
    case "LESSON":
      return "عنوان الدرس";
    case "SUMMARY":
      return "عنوان الملخص";
    case "ASSIGNMENT":
      return "عنوان الفرض";
    case "EXAM":
      return "عنوان الاختبار";
    default:
      return "عنوان الدورة";
  }
}

export function freeContentNeedsVideo(type: FreeContentTypeCode): boolean {
  return type === "LESSON" || type === "COURSE";
}

export function freeContentNeedsPdf(type: FreeContentTypeCode): boolean {
  return type === "SUMMARY" || type === "ASSIGNMENT" || type === "EXAM";
}
