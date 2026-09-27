"use client";

import { useEffect, useState } from "react";

/**
 * Student-page cover for signals the browser can actually observe.
 * Chrome and Edge do not emit an event for OS PrintScreen, Snipping Tool,
 * or OS-level screen recording. This component does not pretend they do.
 */
export default function ScreenshotProtection() {
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    const syncVisibility = () => {
      setCovered(document.visibilityState !== "visible");
    };
    const cover = () => setCovered(true);
    const uncoverIfVisible = () => {
      if (document.visibilityState === "visible") setCovered(false);
    };

    document.addEventListener("visibilitychange", syncVisibility);
    window.addEventListener("pagehide", cover);
    window.addEventListener("pageshow", uncoverIfVisible);
    window.addEventListener("beforeprint", cover);
    window.addEventListener("afterprint", uncoverIfVisible);

    return () => {
      document.removeEventListener("visibilitychange", syncVisibility);
      window.removeEventListener("pagehide", cover);
      window.removeEventListener("pageshow", uncoverIfVisible);
      window.removeEventListener("beforeprint", cover);
      window.removeEventListener("afterprint", uncoverIfVisible);
    };
  }, []);

  if (!covered) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950 text-base font-bold text-white"
      role="status"
    >
      المحتوى محمي
    </div>
  );
}
