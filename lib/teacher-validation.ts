export type TeacherCreateInput = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
};

export type TeacherValidationResult = {
  ok: boolean;
  message?: string;
  value?: {
    fullName: string;
    email: string;
    password: string;
    phone: string | null;
  };
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

export function validateTeacherCreateInput(raw: Partial<TeacherCreateInput>): TeacherValidationResult {
  const fullName = String(raw.fullName || "").trim();
  const email = normalizeEmail(raw.email);
  const password = String(raw.password || "");
  const confirmPassword = String(raw.confirmPassword || "");
  const phoneRaw = String(raw.phone || "").trim();

  if (!fullName || !email || !password) {
    return { ok: false, message: "البيانات المطلوبة غير مكتملة." };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { ok: false, message: "صيغة البريد الإلكتروني غير صالحة." };
  }
  if (password.length < 6) {
    return { ok: false, message: "كلمة المرور يجب ألا تقل عن 6 أحرف." };
  }
  if (password !== confirmPassword) {
    return { ok: false, message: "كلمتا المرور غير متطابقتين." };
  }

  return {
    ok: true,
    value: {
      fullName,
      email,
      password,
      phone: phoneRaw || null,
    },
  };
}
