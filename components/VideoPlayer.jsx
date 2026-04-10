"use client";

import ReactPlayer from "react-player";

export default function VideoPlayer({ videoUrl, title, onEnded }) {
  if (!videoUrl) {
    return (
      <div className="flex h-full items-center justify-center text-white">
        No video available for this lesson
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ReactPlayer
        url={videoUrl}
        controls
        width="100%"
        height="100%"
        onEnded={onEnded}
        config={{
          file: { attributes: { controlsList: "nodownload" } },
        }}
        style={{ borderRadius: "0.75rem", overflow: "hidden" }}
      />
      <p className="mt-2 text-xs text-slate-300">{title || "Lesson video"}</p>
    </div>
  );
}
