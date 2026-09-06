"use client";

import { PlayCircle } from "lucide-react";
import FreeCourseVideoPlayer from "@/components/student/FreeCourseVideoPlayer";

/** دروسي — videos only. Never mixes PDFs or exams. */
export default function FreeLessonsSection({ lessons, loading = false, courseSelected = true }) {
  const list = (Array.isArray(lessons) ? lessons : []).filter((l) => l?.videoUrl);

  return (
    <section
      aria-label="دروسي"
      className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 sm:p-6"
    >
      <div id="lessons" className="mb-5 flex scroll-mt-24 items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <PlayCircle className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">دروسي</h2>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : !courseSelected ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm font-semibold text-slate-500">
          اختر دورة لعرض الدروس.
        </p>
      ) : !list.length ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm font-semibold text-slate-500">
          لا توجد دروس مجانية حالياً
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {list.map((lesson, index) => (
            <div key={lesson?.id ?? index} className="space-y-3">
              <p className="text-sm font-bold text-slate-700">{lesson?.title ?? ""}</p>
              <FreeCourseVideoPlayer
                videoUrl={lesson?.videoUrl ?? ""}
                title={lesson?.title ?? ""}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
