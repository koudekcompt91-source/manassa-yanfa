"use client";

import { extractYoutubeVideoId, youtubeEmbedUrlFromId } from "@/lib/youtube";

/** Watch-only YouTube embed for FREE LMS. */
export default function FreeCourseVideoPlayer({ videoUrl, title }) {
  const url = String(videoUrl || "").trim();
  if (!url) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-100 text-sm font-semibold text-slate-500">
        لا يوجد فيديو لهذه الدورة بعد.
      </div>
    );
  }

  const ytId = extractYoutubeVideoId(url);
  if (!ytId) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed border-amber-300 bg-amber-50 text-sm font-semibold text-amber-800">
        رابط يوتيوب غير صالح. يُقبل رابط YouTube فقط.
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
      <iframe
        title={title || "فيديو الدورة"}
        src={youtubeEmbedUrlFromId(ytId)}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
