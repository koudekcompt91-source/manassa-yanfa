"use client";

import { ClipboardList, Lock } from "lucide-react";

/** فروضي — assignments / exams only. No courses, no PDFs. */
export default function FreeAssignmentsSection({ assignments }) {
  const list = Array.isArray(assignments) ? assignments : [];

  return (
    <section
      aria-label="فروضي"
      className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 sm:p-6"
    >
      <div id="assignments" className="mb-5 flex scroll-mt-24 items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <ClipboardList className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">فروضي</h2>
      </div>

      {!list.length ? (
        <div
          className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center"
          aria-disabled="true"
        >
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
            <Lock className="h-5 w-5" />
          </span>
          <p className="text-base font-extrabold text-slate-700">الفروض والاختبارات</p>
          <p className="mt-2 text-sm font-semibold text-slate-500">مقفل — قريبًا</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((item) => (
            <li key={item.id}>
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-4 shadow-sm">
                <span className="flex min-w-0 items-center gap-2.5">
                  <ClipboardList className="h-4 w-4 shrink-0 text-brand-700" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-800">
                      {item.title}
                    </span>
                    <span className="block truncate text-xs font-semibold text-slate-400">
                      {item.courseTitle}
                    </span>
                  </span>
                </span>
                {item.locked ? (
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
