"use client";

import { PlayCircle } from "lucide-react";
import FreeCourseVideoPlayer from "@/components/student/FreeCourseVideoPlayer";

/** SECTION 2 — videos only, for the active course. Missing video never crashes. */
export default function FreeLessonsSection({ lessons, courseSelected }) {
  const list = (Array.isArray(lessons) ? lessons : []).filter((l) => l?.videoUrl);

  return (
    <section
      aria-label="الدروس"
      className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 sm:p-6"
    >
      <div id="lessons" className="mb-5 flex scroll-mt-24 items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <PlayCircle className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">الدروس</h2>
      </div>

      {!courseSelected ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm font-semibold text-slate-500">
          اختر دورة لعرض الدروس.
        </p>
      ) : !list.length ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm font-semibold text-slate-500">
          لا يوجد فيديو لهذه الدورة
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
