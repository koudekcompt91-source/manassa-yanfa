/** Canonical Arabic labels stored on User, Package, and Lesson (CMS). */
export const ACADEMIC_LEVELS = ["الثالثة متوسط", "الرابعة متوسط", "الأولى ثانوي", "الثانية ثانوي"] as const;

export type AcademicLevelLabel = (typeof ACADEMIC_LEVELS)[number];

const LEVEL_SET = new Set<string>(ACADEMIC_LEVELS);

export const DEFAULT_ACADEMIC_LEVEL: AcademicLevelLabel = "الرابعة متوسط";

export function isValidAcademicLevel(value: unknown): value is string {
  return typeof value === "string" && LEVEL_SET.has(value.trim());
}

/** Package catalog level (defaults for legacy rows). */
export function getPackageAcademicLevel(pkg: { academicLevel?: string | null } | null | undefined): string {
  const s = String(pkg?.academicLevel ?? "").trim();
  return LEVEL_SET.has(s) ? s : DEFAULT_ACADEMIC_LEVEL;
}

/** Lesson level: explicit on lesson, else package default. */
export function getLessonAcademicLevel(
  lesson: { academicLevel?: string | null; packageId?: string | null },
  packages: Array<{ id: string; academicLevel?: string | null }> | null | undefined
): string {
  const ls = String(lesson?.academicLevel ?? "").trim();
  if (LEVEL_SET.has(ls)) return ls;
  const pkg = (packages || []).find((p) => p.id === lesson.packageId);
  return getPackageAcademicLevel(pkg);
}

/** When `pkg.level` is set (3AM…), filter by `studentLevelCode`; `unknown` student sees all. When unset, use Arabic `academicLevel` rules. */
export function studentSeesPackage(
  studentLevel: string | null | undefined,
  pkg: { academicLevel?: string | null; level?: string | null },
  studentLevelCode?: string | null | undefined
): boolean {
  const itemCode = String(pkg?.level ?? "").trim();
  if (itemCode) {
    const uc = String(studentLevelCode ?? "").trim() || "unknown";
    if (uc === "unknown") return true;
    return uc === itemCode;
  }
  const sl = String(studentLevel ?? "").trim();
  if (!sl) return true;
  return getPackageAcademicLevel(pkg) === sl;
}

export function studentSeesLesson(
  studentLevel: string | null | undefined,
  lesson: { academicLevel?: string | null; packageId?: string | null; level?: string | null },
  packages: Array<{ id: string; academicLevel?: string | null; level?: string | null }> | null | undefined,
  studentLevelCode?: string | null | undefined
): boolean {
  const pkg = (packages || []).find((p) => p.id === lesson.packageId);
  const itemCode = String(lesson?.level ?? "").trim() || String(pkg?.level ?? "").trim();
  if (itemCode) {
    const uc = String(studentLevelCode ?? "").trim() || "unknown";
    if (uc === "unknown") return true;
    return uc === itemCode;
  }
  const sl = String(studentLevel ?? "").trim();
  if (!sl) return true;
  return getLessonAcademicLevel(lesson, packages) === sl;
}
