"use client";

import { ClipboardList, Lock } from "lucide-react";

/** SECTION 4 — tests only. Locked placeholder while empty. */
export default function FreeExamsSection({ exams }) {
  const list = Array.isArray(exams) ? exams : [];

  return (
    <section
      aria-label="الاختبارات"
      className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 sm:p-6"
    >
      <div id="exams" className="mb-5 flex scroll-mt-24 items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <ClipboardList className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">الاختبارات</h2>
      </div>

      {!list.length ? (
        <div
          className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center"
          aria-disabled="true"
        >
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
            <Lock className="h-5 w-5" />
          </span>
          <p className="text-base font-extrabold text-slate-700">الاختبارات والفروض</p>
          <p className="mt-2 text-sm font-semibold text-slate-500">مقفل — قريبًا</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((exam) => (
            <li key={exam.id}>
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-4 shadow-sm">
                <span className="inline-flex min-w-0 items-center gap-2">
                  <ClipboardList className="h-4 w-4 shrink-0 text-brand-700" />
                  <span className="truncate text-sm font-bold text-slate-800">{exam.title}</span>
                </span>
                {exam.locked ? (
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-extrabold text-slate-400">
                    <Lock className="h-3.5 w-3.5" />
                    مقفل
                  </span>
                ) : (
                  <span className="shrink-0 text-xs font-extrabold text-brand-700">متاح</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
