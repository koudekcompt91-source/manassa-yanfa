import { QuestionType } from "@prisma/client";

export const MAX_TEXT_LEN = 2000;

export function normalizeAssessmentType(value: unknown) {
  const raw = String(value || "").trim().toUpperCase();
  return raw === "ASSIGNMENT" ? "ASSIGNMENT" : "QUIZ";
}

export function normalizeQuestionType(value: unknown): QuestionType {
  const raw = String(value || "").trim().toUpperCase();
  if (raw === "TRUE_FALSE") return "TRUE_FALSE";
  if (raw === "WRITTEN") return "WRITTEN";
  return "MULTIPLE_CHOICE";
}

export function validateQuestionPayload(body: any) {
  const questionText = String(body?.questionText || "").trim();
  const type = normalizeQuestionType(body?.type);
  const points = Math.max(0, Number(body?.points) || 0);
  const order = Math.max(1, Number(body?.order) || 1);
  if (!questionText) return { ok: false as const, message: "نص السؤال مطلوب." };
  if (questionText.length > MAX_TEXT_LEN) return { ok: false as const, message: "نص السؤال طويل جدًا." };
  if (!Number.isFinite(points) || points < 0) return { ok: false as const, message: "النقاط غير صالحة." };

  let options: string[] = [];
  let correctAnswer: any = null;

  if (type === "MULTIPLE_CHOICE") {
    const rawOptions = Array.isArray(body?.options) ? body.options : [];
    options = rawOptions.map((row: any) => String(row || "").trim()).filter(Boolean);
    if (options.length < 2 || options.length > 6) {
      return { ok: false as const, message: "سؤال الاختيار المتعدد يحتاج من 2 إلى 6 خيارات." };
    }
    const correctIndex = Number(body?.correctOption);
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
      return { ok: false as const, message: "الإجابة الصحيحة غير صالحة." };
    }
    correctAnswer = { correctOption: correctIndex };
  } else if (type === "TRUE_FALSE") {
    if (body?.correctAnswer !== true && body?.correctAnswer !== false) {
      return { ok: false as const, message: "حدد الإجابة الصحيحة لسؤال صح/خطأ." };
    }
    correctAnswer = { value: Boolean(body.correctAnswer) };
  } else {
    options = [];
    correctAnswer = null;
  }

  return {
    ok: true as const,
    value: {
      questionText,
      type,
      points: Math.round(points),
      order,
      options: type === "MULTIPLE_CHOICE" ? options : null,
      correctAnswer,
    },
  };
}

export function sanitizeAssessmentAnswer(type: QuestionType, value: any) {
  if (type === "MULTIPLE_CHOICE") {
    const picked = Number(value?.selectedOption);
    if (!Number.isInteger(picked) || picked < 0) return null;
    return { selectedOption: picked };
  }
  if (type === "TRUE_FALSE") {
    if (value?.value !== true && value?.value !== false) return null;
    return { value: Boolean(value.value) };
  }
  const text = String(value?.text ?? value ?? "").trim();
  if (!text) return null;
  if (text.length > MAX_TEXT_LEN) return null;
  return { text };
}
