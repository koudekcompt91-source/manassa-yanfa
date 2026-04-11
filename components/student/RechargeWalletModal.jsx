"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const MAX_RECEIPT_BYTES = 450 * 1024;

const paymentMethodLabels = {
  ccp: "حساب بريدي (CCP)",
  e_payment: "دفع إلكتروني",
  recharge_card: "بطاقة شحن",
};

export default function RechargeWalletModal({ open, onClose, onSuccess }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [form, setForm] = useState({
    paymentMethod: "ccp",
    firstName: "",
    lastName: "",
    wilaya: "",
    baladiya: "",
    phone: "",
    amount: "",
    receiptImage: "",
    note: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      paymentMethod: "ccp",
      firstName: "",
      lastName: "",
      wilaya: "",
      baladiya: "",
      phone: "",
      amount: "",
      receiptImage: "",
      note: "",
    });
    setError("");
    setDone(false);
    setBusy(false);
  }, [open]);

  if (!open || !mounted) return null;

  function reset() {
    setForm({
      paymentMethod: "ccp",
      firstName: "",
      lastName: "",
      wilaya: "",
      baladiya: "",
      phone: "",
      amount: "",
      receiptImage: "",
      note: "",
    });
    setError("");
    setDone(false);
    setBusy(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function onPickReceipt(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("يرجى اختيار ملف صورة.");
      return;
    }
    if (file.size > MAX_RECEIPT_BYTES) {
      setError("حجم الصورة كبير جدًا. الحد الأقصى ٤٥٠ كيلوبايت.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      const r = String(reader.result || "");
      setForm((s) => ({ ...s, receiptImage: r }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/wallet/recharge-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          paymentMethod: form.paymentMethod,
          firstName: form.firstName,
          lastName: form.lastName,
          wilaya: form.wilaya,
          baladiya: form.baladiya,
          phone: form.phone,
          amount: form.amount,
          receiptImage: form.receiptImage,
          note: form.note,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || "تعذّر إرسال الطلب.");
        setBusy(false);
        return;
      }
      setDone(true);
      onSuccess?.();
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    }
    setBusy(false);
  }

  const fieldClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">طلب شحن الرصيد</h2>
            <p className="mt-1 text-xs text-slate-500">سيتم مراجعة طلبك من الإدارة قبل إضافة الرصيد.</p>
          </div>
          <button type="button" onClick={handleClose} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600">
            إغلاق
          </button>
        </div>

        {done ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-center text-sm font-semibold text-emerald-900">
            تم إرسال الطلب بنجاح
            <button
              type="button"
              onClick={handleClose}
              className="mt-4 w-full rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white"
            >
              حسنًا
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="font-semibold text-slate-800">طريقة الدفع</span>
              <select
                className={fieldClass}
                value={form.paymentMethod}
                onChange={(e) => setForm((s) => ({ ...s, paymentMethod: e.target.value }))}
              >
                {Object.entries(paymentMethodLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-semibold text-slate-800">الاسم</span>
                <input className={fieldClass} value={form.firstName} onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))} required />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-slate-800">اللقب</span>
                <input className={fieldClass} value={form.lastName} onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))} required />
              </label>
            </div>
            <label className="block text-sm">
              <span className="font-semibold text-slate-800">الولاية</span>
              <input className={fieldClass} value={form.wilaya} onChange={(e) => setForm((s) => ({ ...s, wilaya: e.target.value }))} required />
            </label>
            <label className="block text-sm">
              <span className="font-semibold text-slate-800">البلدية</span>
              <input className={fieldClass} value={form.baladiya} onChange={(e) => setForm((s) => ({ ...s, baladiya: e.target.value }))} required />
            </label>
            <label className="block text-sm">
              <span className="font-semibold text-slate-800">الهاتف</span>
              <input className={`${fieldClass} text-left`} dir="ltr" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} required />
            </label>
            <label className="block text-sm">
              <span className="font-semibold text-slate-800">المبلغ (دج)</span>
              <input
                type="number"
                min={1}
                step={1}
                className={fieldClass}
                value={form.amount}
                onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))}
                required
              />
            </label>
            <label className="block text-sm">
              <span className="font-semibold text-slate-800">صورة الإيصال</span>
              <input type="file" accept="image/*" className="mt-1 text-xs" onChange={onPickReceipt} required={!form.receiptImage} />
              {form.receiptImage ? <p className="mt-1 text-xs text-emerald-700">تم اختيار صورة.</p> : null}
            </label>
            <label className="block text-sm">
              <span className="font-semibold text-slate-800">ملاحظة (اختياري)</span>
              <textarea className={fieldClass} rows={2} value={form.note} onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))} />
            </label>
            {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{error}</p> : null}
            <div className="flex flex-wrap gap-2 pt-2">
              <button type="submit" disabled={busy} className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                {busy ? "جاري الإرسال…" : "إرسال الطلب"}
              </button>
              <button type="button" onClick={handleClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}

export { paymentMethodLabels };
