"use client";

import { PlayCircle } from "lucide-react";
import FreeCourseVideoPlayer from "@/components/student/FreeCourseVideoPlayer";

/** Section 3 — CourseVideo.videoUrl only for the active course. */
export default function FreeVideoSection({ courseTitle, videoUrl }) {
  return (
    <section
      aria-label="الفيديو"
      className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 sm:p-6"
    >
      <div id="video" className="mb-5 flex scroll-mt-24 items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <PlayCircle className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">الفيديو</h2>
      </div>
      {!courseTitle ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm font-semibold text-slate-500">
          اختر دورة من القائمة لعرض الفيديو.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-bold text-slate-700">{courseTitle}</p>
          <FreeCourseVideoPlayer videoUrl={videoUrl || ""} title={courseTitle} />
        </div>
      )}
    </section>
  );
}
