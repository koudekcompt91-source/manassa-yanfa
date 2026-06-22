"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDzd } from "@/lib/format-money";
import { ALGERIA_WILAYAS } from "@/lib/algeria-wilayas";

function isRemoteCover(src) {
  const s = String(src || "").trim();
  return s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/");
}

function ItemCover({ title, imageUrl }) {
  const src = String(imageUrl || "").trim();
  if (isRemoteCover(src)) {
    // eslint-disable-next-line @next/next/no-img-element -- remote CMS URLs not in next.config images
    return <img src={src} alt="" className="h-40 w-full object-cover" loading="lazy" />;
  }
  const letter = (title || "م").charAt(0);
  return (
    <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-brand-600/90 via-indigo-600/85 to-slate-800 text-4xl font-black text-white/95">
      {letter}
    </div>
  );
}

export default function StorePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [wilayaFilter, setWilayaFilter] = useState("الكل");

  const [modalItem, setModalItem] = useState(null);
  const [form, setForm] = useState({ fullName: "", lastName: "", phone: "", wilaya: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [banner, setBanner] = useState("");

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/store/items", { cache: "no-store", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      setItems(res.ok && data?.ok && Array.isArray(data.items) ? data.items : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  function openPurchase(item) {
    setModalItem(item);
    setForm({ fullName: "", lastName: "", phone: "", wilaya: "" });
    setFormError("");
  }

  function closePurchase() {
    if (submitting) return;
    setModalItem(null);
    setFormError("");
  }

  async function submitPurchase(e) {
    e.preventDefault();
    if (!modalItem) return;
    setFormError("");
    if (!form.fullName.trim() || !form.lastName.trim() || !form.phone.trim()) {
      setFormError("يرجى تعبئة جميع الحقول المطلوبة.");
      return;
    }
    if (!form.wilaya.trim()) {
      setFormError("يرجى اختيار الولاية.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/store/orders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeItemId: modalItem.id,
          fullName: form.fullName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim(),
          wilaya: form.wilaya,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setFormError(data?.message || "تعذّر إرسال الطلب.");
        return;
      }
      setModalItem(null);
      setBanner(data?.message || "تم إرسال طلب الشراء بنجاح.");
      setTimeout(() => setBanner(""), 6000);
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const target = `${item.title} ${item.description} ${item.teacherName}`.toLowerCase();
      const matchesQuery = target.includes(query.trim().toLowerCase());
      // Items without a wilaya tag only appear under "الكل"; a specific wilaya shows only matching items.
      const matchesWilaya = wilayaFilter === "الكل" || String(item.wilaya || "") === wilayaFilter;
      return matchesQuery && matchesWilaya;
    });
  }, [items, query, wilayaFilter]);

  return (
    <section className="container-page premium-app-bg space-y-8 py-8 sm:py-10">
      <header className="interactive-card rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold text-brand-700">المتجر</p>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">متجر المنصة</h1>
        <p className="mt-2 text-slate-600">تصفّح العناصر المقدّمة من الأساتذة وأرسل طلب شراء بسهولة.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في المتجر…"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
          />
          <select
            value={wilayaFilter}
            onChange={(e) => setWilayaFilter(e.target.value)}
            aria-label="فلتر حسب الولاية"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm sm:w-64"
          >
            <option value="الكل">فلتر حسب الولاية: الكل</option>
            {ALGERIA_WILAYAS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
      </header>

      {banner ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {banner}
        </div>
      ) : null}

      {loading ? (
        <div className="interactive-card rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
          جاري تحميل عناصر المتجر…
        </div>
      ) : !filtered.length ? (
        <div className="interactive-card rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
          لا توجد عناصر متاحة حاليًا.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const isFree = item.isFree || Number(item.price || 0) <= 0;
            return (
              <article
                key={item.id}
                className="interactive-card flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:shadow-md"
              >
                <ItemCover title={item.title} imageUrl={item.imageUrl} />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                        isFree ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {isFree ? "مجاني" : "مدفوع"}
                    </span>
                    {item.wilaya ? (
                      <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-800">
                        {item.wilaya}
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-2 text-lg font-extrabold text-slate-900">{item.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                    {(item.description || "").trim() || "وصف مختصر للعنصر."}
                  </p>
                  {item.teacherName ? (
                    <p className="mt-2 text-xs text-slate-500">
                      الأستاذ: <span className="font-semibold text-slate-700">{item.teacherName}</span>
                    </p>
                  ) : null}
                  <p className="mt-3 text-lg font-black text-brand-700">{isFree ? "مجاني" : formatDzd(Number(item.price || 0))}</p>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => openPurchase(item)}
                      className="touch-button-primary w-full px-4 text-sm font-extrabold"
                    >
                      طلب شراء
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {modalItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="store-purchase-title"
          onClick={closePurchase}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="store-purchase-title" className="text-lg font-extrabold text-slate-900">
                  طلب شراء
                </h2>
                <p className="mt-1 text-sm text-slate-600">{modalItem.title}</p>
              </div>
              <button
                type="button"
                onClick={closePurchase}
                className="touch-button-secondary px-3 py-1.5 text-sm font-bold text-slate-700"
                aria-label="إغلاق"
              >
                إغلاق
              </button>
            </div>

            <form onSubmit={submitPurchase} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="store-fullname" className="block text-sm font-bold text-slate-700">
                  الاسم الكامل
                </label>
                <input
                  id="store-fullname"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
                  required
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="store-lastname" className="block text-sm font-bold text-slate-700">
                  اللقب
                </label>
                <input
                  id="store-lastname"
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))}
                  required
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100"
                  placeholder="أدخل لقبك"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="store-phone" className="block text-sm font-bold text-slate-700">
                  رقم الهاتف
                </label>
                <input
                  id="store-phone"
                  type="tel"
                  inputMode="tel"
                  dir="ltr"
                  value={form.phone}
                  onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                  required
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100"
                  placeholder="06xxxxxxxx"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="store-wilaya" className="block text-sm font-bold text-slate-700">
                  الولاية <span className="text-red-500">*</span>
                </label>
                <select
                  id="store-wilaya"
                  value={form.wilaya}
                  onChange={(e) => setForm((s) => ({ ...s, wilaya: e.target.value }))}
                  required
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100"
                >
                  <option value="" disabled>
                    اختر الولاية
                  </option>
                  {ALGERIA_WILAYAS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              {formError ? (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="touch-button-primary w-full px-4 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "جاري الإرسال…" : "إرسال الطلب"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
