"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function fmtDate(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("ar-DZ");
  } catch {
    return "-";
  }
}

export default function CertificatesListPage() {
  const [state, setState] = useState({ loading: true, rows: [], error: "" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/certificates", { cache: "no-store", credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !data?.ok) {
          setState({ loading: false, rows: [], error: data?.message || "تعذّر تحميل الشهادات." });
          return;
        }
        setState({ loading: false, rows: Array.isArray(data.certificates) ? data.certificates : [], error: "" });
      } catch {
        if (!cancelled) setState({ loading: false, rows: [], error: "تعذّر تحميل الشهادات." });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-black text-slate-900">الشهادات</h1>
      <p className="mt-1 text-sm text-slate-500">جميع شهاداتك المتاحة بعد إكمال الدورات.</p>
      {state.loading ? <p className="mt-6 text-sm text-slate-600">جاري التحميل...</p> : null}
      {state.error ? <p className="mt-6 text-sm text-red-700">{state.error}</p> : null}
      {!state.loading && !state.error && !state.rows.length ? (
        <p className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">الشهادة غير متاحة بعد. أكمل الدورة للحصول على الشهادة.</p>
      ) : null}
      {!state.loading && !!state.rows.length ? (
        <div className="mt-6 grid gap-3">
          {state.rows.map((row) => (
            <article key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-base font-extrabold text-slate-900">{row.courseTitle}</p>
                  <p className="mt-1 text-xs text-slate-500">رقم الشهادة: {row.certificateCode}</p>
                  <p className="mt-1 text-xs text-slate-500">تاريخ الإصدار: {fmtDate(row.issuedAt)}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${row.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                  {row.status === "ACTIVE" ? "شهادة صالحة" : "تم إلغاء هذه الشهادة"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/dashboard/certificates/${encodeURIComponent(row.certificateCode)}`} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white no-underline">
                  عرض الشهادة
                </Link>
                <a href={`/verify-certificate/${encodeURIComponent(row.certificateCode)}`} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 no-underline">
                  التحقق من الشهادة
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
