"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { getDisplayLevelLabel } from "@/lib/student-level-codes";

/**
 * Student PAID summaries — PaidFileContent SUMMARY via /api/paid-content.
 * Opens PDF with target=_blank + rel=noopener (same pattern as FREE PDF UI, different data source).
 */
export default function TeachersSummariesPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/paid-content?contentType=SUMMARY", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setItems([]);
        setError(data?.message || "تعذّر تحميل الملخصات.");
        return;
      }
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setItems([]);
      setError("حدث خطأ أثناء تحميل الملخصات.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-500">جاري تحميل الملخصات…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-100 bg-white px-5 py-10 text-center shadow-sm">
        <p className="text-sm font-semibold text-red-700">{error}</p>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
        <p className="text-base font-extrabold text-slate-800">لا توجد ملخصات متاحة حاليًا.</p>
      </section>
    );
  }

  return (
    <section aria-label="ملخصاتي" className="space-y-3">
      {items.map((item) => {
        const levelLabel = getDisplayLevelLabel(item);
        return (
          <a
            key={item.id}
            href={item.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-full flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 no-underline shadow-[0_10px_28px_-22px_rgba(15,23,42,0.2)] transition hover:border-brand-200 sm:flex-row sm:items-center sm:justify-between sm:p-5"
          >
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <FileText className="h-7 w-7" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">{item.title}</h2>
                {item.course?.title ? <p className="mt-1 text-sm text-slate-500">{item.course.title}</p> : null}
                {item.description ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{item.description}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {levelLabel ? (
                    <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-extrabold text-sky-800">
                      {levelLabel}
                    </span>
                  ) : null}
                  {item.subject ? (
                    <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-extrabold text-violet-800">
                      {item.subject}
                    </span>
                  ) : null}
                  {item.fileName ? (
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-extrabold text-red-700">PDF</span>
                  ) : null}
                </div>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white group-hover:bg-brand-700">
              فتح الملخص
            </span>
          </a>
        );
      })}
    </section>
  );
}
