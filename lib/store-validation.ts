/** Shared validation + normalization for the marketplace (store) module. */

export type StoreItemInput = {
  title?: unknown;
  description?: unknown;
  price?: unknown;
  isFree?: unknown;
  imageUrl?: unknown;
  teacherId?: unknown;
  status?: unknown;
};

export type StoreItemValue = {
  title: string;
  description: string;
  price: number;
  isFree: boolean;
  imageUrl: string | null;
  teacherId: string | null;
  status: "DRAFT" | "PUBLISHED";
};

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

/** Validate a create/update payload for a store item (admin-managed). */
export function validateStoreItemInput(raw: StoreItemInput): ValidationResult<StoreItemValue> {
  const title = String(raw?.title || "").trim();
  const description = String(raw?.description || "").trim();
  const imageUrl = String(raw?.imageUrl || "").trim() || null;
  const teacherId = String(raw?.teacherId || "").trim() || null;
  const statusRaw = String(raw?.status || "").trim().toUpperCase();
  const status = statusRaw === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

  const isFree = Boolean(raw?.isFree);
  const numericPrice = Number(raw?.price ?? 0);
  const price = isFree ? 0 : Math.max(0, Math.round(Number.isFinite(numericPrice) ? numericPrice : 0));

  if (!title) {
    return { ok: false, message: "عنوان العنصر مطلوب." };
  }
  if (!isFree && price <= 0) {
    return { ok: false, message: "أدخل سعرًا صحيحًا أو فعّل خيار \u201cمجاني\u201d." };
  }
  // A published item must have an owning teacher assigned.
  if (status === "PUBLISHED" && !teacherId) {
    return { ok: false, message: "يجب اختيار الأستاذ المالك قبل نشر العنصر." };
  }

  return {
    ok: true,
    value: { title, description, price, isFree, imageUrl, teacherId, status },
  };
}

export type StoreOrderInput = {
  fullName?: unknown;
  lastName?: unknown;
  phone?: unknown;
};

export type StoreOrderValue = {
  fullName: string;
  lastName: string;
  phone: string;
};

const PHONE_REGEX = /^[0-9+\s()-]{6,20}$/;

/** Validate a student purchase-request payload. */
export function validateStoreOrderInput(raw: StoreOrderInput): ValidationResult<StoreOrderValue> {
  const fullName = String(raw?.fullName || "").trim();
  const lastName = String(raw?.lastName || "").trim();
  const phone = String(raw?.phone || "").trim();

  if (!fullName || !lastName || !phone) {
    return { ok: false, message: "يرجى تعبئة جميع الحقول المطلوبة." };
  }
  if (!PHONE_REGEX.test(phone)) {
    return { ok: false, message: "صيغة رقم الهاتف غير صحيحة." };
  }

  return { ok: true, value: { fullName, lastName, phone } };
}
