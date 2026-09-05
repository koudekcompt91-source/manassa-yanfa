"use client";

import { extractYoutubeVideoId, youtubeEmbedUrlFromId } from "@/lib/youtube";

/** Watch-only video for FREE LMS (YouTube embed or direct media URL). */
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
  if (ytId) {
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

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
      <video
        className="h-full w-full"
        controls
        playsInline
        preload="metadata"
        src={url}
        title={title || "فيديو الدورة"}
      >
        متصفحك لا يدعم تشغيل الفيديو.
      </video>
    </div>
  );
}
