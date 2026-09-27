"use client";

import { useEffect, useState } from "react";

const POSITIONS = [
  { top: "8%", insetInlineStart: "6%" },
  { top: "8%", insetInlineEnd: "6%" },
  { bottom: "18%", insetInlineStart: "6%" },
  { bottom: "18%", insetInlineEnd: "6%" },
  { top: "38%", insetInlineStart: "8%" },
];

function nextDelayMs() {
  return 8000 + Math.floor(Math.random() * 7000);
}

/**
 * PAID lesson player. Playback URL comes from the authorized playback API.
 * Overlay protections are best-effort in the browser only.
 */
export default function ProtectedPaidVideo({ slug, lessonId, title }) {
  const [state, setState] = useState({ loading: true, error: "", embedUrl: "", watermark: null });
  const [obscured, setObscured] = useState(false);
  const [posIndex, setPosIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: "", embedUrl: "", watermark: null });
    (async () => {
      try {
        const res = await fetch(
          `/api/courses/${encodeURIComponent(slug)}/lessons/${encodeURIComponent(lessonId)}/playback`,
          { credentials: "include", cache: "no-store" }
        );
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !data?.ok || !data.embedUrl) {
          setState({
            loading: false,
            error: data?.message || "تعذّر تحميل الفيديو.",
            embedUrl: "",
            watermark: null,
          });
          return;
        }
        setState({
          loading: false,
          error: "",
          embedUrl: data.embedUrl,
          watermark: data.watermark || null,
        });
      } catch {
        if (!cancelled) {
          setState({ loading: false, error: "تعذّر الاتصال بالخادم.", embedUrl: "", watermark: null });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, lessonId]);

  useEffect(() => {
    const sync = () => setObscured(document.visibilityState !== "visible");
    const hide = () => setObscured(true);
    sync();
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pagehide", hide);
    window.addEventListener("pageshow", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pagehide", hide);
      window.removeEventListener("pageshow", sync);
    };
  }, []);

  useEffect(() => {
    let timer = 0;
    const tick = () => {
      setPosIndex((i) => (i + 1 + Math.floor(Math.random() * (POSITIONS.length - 1))) % POSITIONS.length);
      timer = window.setTimeout(tick, nextDelayMs());
    };
    timer = window.setTimeout(tick, nextDelayMs());
    return () => window.clearTimeout(timer);
  }, []);

  if (state.loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-200">جاري تحميل الفيديو...</div>
    );
  }

  if (!state.embedUrl) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-200">
        {state.error || "لا يمكن عرض هذا الفيديو."}
      </div>
    );
  }

  const mark = state.watermark;
  const pos = POSITIONS[posIndex] || POSITIONS[0];

  return (
    <div
      className="protected-paid-media relative h-full w-full select-none"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <style>{`@media print { .protected-paid-media { visibility: hidden !important; } }`}</style>
      <iframe
        title={title || "مشغل الدرس"}
        src={state.embedUrl}
        className="pointer-events-auto h-full w-full rounded-xl"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; encrypted-media; gyroscope"
        draggable={false}
      />
      {mark ? (
        <div
          className="pointer-events-none absolute z-10 max-w-[70%] rounded-lg bg-slate-950/35 px-2.5 py-1.5 text-[11px] font-semibold leading-5 text-white/80 shadow-sm transition-all duration-700 sm:text-xs"
          style={pos}
          aria-hidden
        >
          <p>{mark.platform}</p>
          <p>الطالب: {mark.fullName}</p>
          <p dir="ltr">{mark.emailMasked}</p>
          <p dir="ltr">#{mark.accountRef}</p>
        </div>
      ) : null}
      {obscured ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 text-sm font-bold text-white backdrop-blur-md">
          المحتوى محمي
        </div>
      ) : null}
    </div>
  );
}
