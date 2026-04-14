const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

export function extractYoutubeVideoId(input: string): string | null {
  const raw = String(input || "").trim();
  if (!raw) return null;
  if (YOUTUBE_ID_REGEX.test(raw)) return raw;

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0] || "";
      return YOUTUBE_ID_REGEX.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      const watchId = url.searchParams.get("v") || "";
      if (YOUTUBE_ID_REGEX.test(watchId)) return watchId;

      const parts = url.pathname.split("/").filter(Boolean);
      const embedIdx = parts.findIndex((p) => p === "embed" || p === "shorts" || p === "live");
      if (embedIdx >= 0 && parts[embedIdx + 1] && YOUTUBE_ID_REGEX.test(parts[embedIdx + 1])) {
        return parts[embedIdx + 1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function isValidYoutubeUrl(input: string): boolean {
  return !!extractYoutubeVideoId(input);
}

export function youtubeEmbedUrlFromId(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}
