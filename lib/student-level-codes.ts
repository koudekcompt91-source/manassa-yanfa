/** Canonical school-year codes stored on User.level and optional CMS package/lesson `level`. */
export const STUDENT_LEVEL_CODES = ["3AM", "4AM", "1AS", "2AS"] as const;
export type StudentLevelCode = (typeof STUDENT_LEVEL_CODES)[number];

const CODE_SET = new Set<string>(STUDENT_LEVEL_CODES);

/** DB default for existing rows */
export const DEFAULT_USER_LEVEL = "unknown";

const ARABIC_TO_CODE: Record<string, StudentLevelCode> = {
  "الثالثة متوسط": "3AM",
  "الرابعة متوسط": "4AM",
  "الأولى ثانوي": "1AS",
  "الثانية ثانوي": "2AS",
};

const CODE_TO_ARABIC: Record<StudentLevelCode, string> = {
  "3AM": "الثالثة متوسط",
  "4AM": "الرابعة متوسط",
  "1AS": "الأولى ثانوي",
  "2AS": "الثانية ثانوي",
};

export function isValidStudentLevelCode(value: unknown): value is StudentLevelCode {
  return typeof value === "string" && CODE_SET.has(value.trim());
}

export function mapStudentLevelCodeToArabic(code: string): string {
  const c = String(code || "").trim() as StudentLevelCode;
  return CODE_TO_ARABIC[c] || "";
}

/** If Arabic label is known, return code; else null */
export function mapArabicLabelToStudentLevelCode(arabic: string): StudentLevelCode | null {
  const s = String(arabic || "").trim();
  const code = ARABIC_TO_CODE[s];
  return code ?? null;
}

/** Registration / admin select labels (codes + Arabic). */
export const STUDENT_LEVEL_SELECT_OPTIONS: { value: StudentLevelCode; label: string }[] = [
  { value: "3AM", label: "3AM — الثالثة متوسط" },
  { value: "4AM", label: "4AM — الرابعة متوسط" },
  { value: "1AS", label: "1AS — الأولى ثانوي" },
  { value: "2AS", label: "2AS — الثانية ثانوي" },
];
