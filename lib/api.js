export const API_BASE_URL = "http://localhost:5000/api/v1";

function getApiBaseUrl() {
  return API_BASE_URL;
}

/** Unwrap `{ data: T }` → `T`, or return body. */
export function unwrapResource(body) {
  if (body == null || typeof body !== "object") return body;
  if (Object.prototype.hasOwnProperty.call(body, "data")) return body.data;
  return body;
}

/**
 * Login/register success payloads vary by backend.
 */
export function parseAuthSuccess(body) {
  if (!body || typeof body !== "object") return null;
  const root = body;
  const inner = root.data != null && typeof root.data === "object" ? root.data : root;

  const token =
    (typeof inner.token === "string" && inner.token) ||
    (typeof inner.accessToken === "string" && inner.accessToken) ||
    (typeof root.token === "string" && root.token) ||
    (typeof root.accessToken === "string" && root.accessToken) ||
    null;

  const user = inner.user !== undefined ? inner.user : root.user;
  if (typeof token !== "string" || user == null || typeof user !== "object") return null;
  return { token, user };
}

function collectRawMessages(data) {
  const out = [];
  if (!data || typeof data !== "object") return out;

  const push = (v) => {
    if (typeof v === "string" && v.trim()) out.push(v.trim());
  };

  if (typeof data.message === "string") push(data.message);
  else if (Array.isArray(data.message)) {
    for (const m of data.message) {
      if (typeof m === "string") push(m);
      else if (m && typeof m === "object" && typeof m.message === "string") push(m.message);
    }
  }

  push(data.error);
  if (data.error && typeof data.error === "object" && typeof data.error.message === "string") {
    push(data.error.message);
  }

  if (Array.isArray(data.errors)) {
    for (const e of data.errors) {
      if (typeof e === "string") push(e);
      else if (e && typeof e === "object") {
        if (typeof e.msg === "string") push(e.msg);
        if (typeof e.message === "string") push(e.message);
      }
    }
  }

  if (typeof data.detail === "string") push(data.detail);

  return out;
}

const EN_TO_AR = [
  [/invalid\s+(credentials|email|password)|wrong\s+password|incorrect\s+password|authentication\s+failed/i, "البريد الإلكتروني أو كلمة المرور غير صحيحة."],
  [/unauthorized|not\s+authorized/i, "يجب تسجيل الدخول أو أن البيانات غير صحيحة."],
  [/user\s+not\s+found|no\s+user|account\s+not\s+found/i, "لم يُعثر على حساب بهذا البريد."],
  [/email\s+.*already|already\s+registered|already\s+exists|duplicate/i, "هذا البريد مسجّل مسبقًا."],
  [/validation\s+error|invalid\s+input/i, "البيانات المدخلة غير صالحة."],
  [/password\s+too\s+short|password.*length/i, "كلمة المرور قصيرة جدًا."],
  [/network|econnrefused|fetch failed/i, "تعذّر الاتصال بالخادم."],
];

function statusToArabic(status) {
  if (status === 400) return "طلب غير صالح. تحقق من البيانات المدخلة.";
  if (status === 401) return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  if (status === 403) return "تم رفض الوصول. قد تحتاج إلى صلاحيات أعلى.";
  if (status === 404) return "عنوان الخدمة غير موجود. تحقق من إعدادات الرابط (API).";
  if (status === 422) return "البيانات المدخلة غير مقبولة.";
  if (status === 429) return "محاولات كثيرة. انتظر قليلًا ثم أعد المحاولة.";
  if (status >= 500 && status < 600) return "حدث خطأ في الخادم. حاول لاحقًا.";
  return "تعذّر إتمام الطلب.";
}

export function formatApiErrorMessage(data, status) {
  const rawParts = collectRawMessages(data);
  const joined = rawParts.join(" — ");

  if (joined && /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(joined)) {
    return joined;
  }

  if (joined) {
    for (const [re, ar] of EN_TO_AR) {
      if (re.test(joined)) return ar;
    }
  }

  if (status && status >= 400) return statusToArabic(status);

  return joined || "تعذّر إتمام الطلب.";
}

export async function apiRequest(path, options = {}) {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error("عنوان واجهة البرمجة غير صالح.");
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const mapped = EN_TO_AR.find(([re]) => re.test(msg));
    throw new Error(
      mapped
        ? mapped[1]
        : "تعذّر الاتصال بالخادم. تأكد أن الواجهة الخلفية تعمل وأن الرابط في .env.local صحيح (مثال: http://localhost:5000/api/v1)."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    throw new Error(formatApiErrorMessage(data, response.status));
  }

  return data;
}
