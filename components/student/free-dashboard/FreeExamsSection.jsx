"use client";

import { ClipboardList } from "lucide-react";

/** اختباراتي / فروضي — list items only (optional PDF link). */
export default function FreeExamsSection({
  exams,
  loading = false,
  title = "اختباراتي",
  emptyTitle = "لا توجد اختبارات حالياً",
  emptySubtitle = "ستظهر العناصر المجانية هنا عند إضافتها.",
}) {
  const list = Array.isArray(exams) ? exams : [];

  return (
    <section
      aria-label={title}
      className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 sm:p-6"
    >
      <div id="exams" className="mb-5 flex scroll-mt-24 items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <ClipboardList className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">{title}</h2>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : !list.length ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center">
          <p className="text-base font-extrabold text-slate-700">{emptyTitle}</p>
          <p className="mt-2 text-sm font-semibold text-slate-500">{emptySubtitle}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((exam, index) => {
            const url = String(exam?.url || "").trim();
            const inner = (
              <>
                <span className="inline-flex min-w-0 items-center gap-2">
                  <ClipboardList className="h-4 w-4 shrink-0 text-brand-700" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-800">
                      {exam?.title ?? ""}
                    </span>
                    {exam?.subject ? (
                      <span className="mt-0.5 block truncate text-xs text-slate-500">{exam.subject}</span>
                    ) : null}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-extrabold text-brand-700">
                  {url ? "فتح" : "متاح"}
                </span>
              </>
            );

            return (
              <li key={exam?.id ?? index}>
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-4 shadow-sm transition hover:border-brand-300 hover:bg-brand-50/40"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-4 shadow-sm">
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
