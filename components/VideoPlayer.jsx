"use client";

function toYoutubeEmbed(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "").trim();
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const pathParts = parsed.pathname.split("/").filter(Boolean);
      const shortsId = pathParts[0] === "shorts" ? pathParts[1] : null;
      const embedId = pathParts[0] === "embed" ? pathParts[1] : null;
      const id = parsed.searchParams.get("v") || shortsId || embedId;
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

export default function VideoPlayer({ videoUrl, title }) {
  const embedUrl = toYoutubeEmbed(videoUrl);
  if (!embedUrl) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl bg-slate-900 px-4 text-center text-sm text-slate-200">
        لا يوجد رابط يوتيوب صالح لهذا الدرس حاليًا.
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <iframe
        title={title || "مشغل الدرس"}
        src={embedUrl}
        className="h-full w-full rounded-xl"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      <p className="mt-2 text-xs text-slate-300">{title || "مشغل الدرس"}</p>
    </div>
  );
}
