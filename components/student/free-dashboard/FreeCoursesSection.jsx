"use client";

import { BookOpen } from "lucide-react";

const TONES = [
  "from-brand-600 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-600 to-indigo-700",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-brand-600",
];

function toneAt(i) {
  return TONES[i % TONES.length];
}

/** Section 1 — course cards only. No PDF/video inside. */
export default function FreeCoursesSection({
  courses,
  loading,
  error,
  selectedId,
  onSelect,
}) {
  return (
    <section
      aria-label="الدورات"
      className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 sm:p-6"
    >
      <div id="courses" className="mb-5 flex scroll-mt-24 items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <BookOpen className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">الدورات</h2>
      </div>

      {loading ? (
        <div className="flex flex-col gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : error ? (
        <p
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm font-semibold text-red-700"
        >
          {error}
        </p>
      ) : !courses?.length ? (
        <p
          role="status"
          className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm font-semibold text-slate-500"
        >
          لا توجد دورات حالياً
        </p>
      ) : (
        <div className="flex flex-col gap-5 sm:gap-6">
          {courses.map((course, index) => {
            const id = course.id;
            const title = course.title || "دورة";
            const description = String(course.description || "").trim() || "دورة مجانية — اختر لعرض المحتوى.";
            // Single badge only — no overlapping FREE / level / system badges.
            const badge = course.academicLevel || course.level || "FREE";
            const isActive = selectedId === id;
            return (
              <article
                key={id}
                className={`w-full rounded-2xl border bg-white p-5 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.2)] transition sm:p-6 ${
                  isActive
                    ? "border-brand-400 ring-2 ring-brand-200"
                    : "border-slate-200/90 hover:-translate-y-0.5 hover:border-brand-300/50 hover:shadow-md"
                }`}
              >
                <div dir="ltr" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                  <div
                    className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white sm:h-[5.5rem] sm:w-[5.5rem] ${toneAt(index)}`}
                  >
                    <BookOpen className="h-9 w-9" strokeWidth={1.75} />
                  </div>
                  <div dir="rtl" className="min-w-0 flex-1 text-right">
                    <h3 className="text-xl font-extrabold text-slate-900 sm:text-[1.35rem]">{title}</h3>
                    <p className="mt-1.5 text-sm leading-7 text-slate-500 line-clamp-2">{description}</p>
                    <div className="mt-3">
                      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800">
                        {badge}
                      </span>
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => onSelect?.(course)}
                        className="touch-button-primary inline-flex h-11 w-full items-center justify-center px-5 text-sm font-extrabold sm:w-auto"
                      >
                        {isActive ? "محدّدة للعرض" : "اختيار الدورة"}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
