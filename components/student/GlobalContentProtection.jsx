"use client";

import { useEffect, useState } from "react";
import { accountRefForWatermark, maskEmailForWatermark } from "@/lib/content-protection";
import ScreenshotProtection from "@/components/student/ScreenshotProtection";

/**
 * Browser-level deterrence for signed-in learning pages.
 * Does not stop OS screenshots or screen recording.
 * One watermark timer. Screenshot cover listeners live in ScreenshotProtection.
 */

const POSITIONS = [
  { top: "5.5rem", insetInlineStart: "1.25rem" },
  { top: "5.5rem", insetInlineEnd: "1.25rem" },
  { bottom: "1.5rem", insetInlineStart: "1.25rem" },
  { bottom: "1.5rem", insetInlineEnd: "1.25rem" },
  { top: "42%", insetInlineEnd: "1.25rem" },
];

function nextDelayMs() {
  return 8000 + Math.floor(Math.random() * 7000);
}

function isEditableTarget(target) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function WatermarkLayer() {
  const [mark, setMark] = useState(null);
  const [posIndex, setPosIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        const user = data?.user;
        if (cancelled || !user || user.role !== "STUDENT") return;
        setMark({
          fullName: String(user.fullName || "").trim() || "طالب",
          emailMasked: maskEmailForWatermark(user.email || ""),
          accountRef: accountRefForWatermark(user.id || ""),
        });
      } catch {
        /* watermark is optional if profile cannot load */
      }
    })();
    return () => {
      cancelled = true;
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

  if (!mark) return null;
  const pos = POSITIONS[posIndex] || POSITIONS[0];

  return (
    <div
      className="pointer-events-none fixed z-20 max-w-[14rem] rounded-lg bg-slate-950/25 px-2.5 py-1.5 text-[11px] font-semibold leading-5 text-slate-900/55 transition-all duration-700 sm:text-xs"
      style={pos}
      aria-hidden
    >
      <p>منصة ينفع</p>
      <p>الطالب: {mark.fullName}</p>
      <p dir="ltr">{mark.emailMasked}</p>
      <p dir="ltr">#{mark.accountRef}</p>
    </div>
  );
}

export default function GlobalContentProtection({ children, active = true }) {
  if (!active) return children;

  return (
    <>
      <style>{`
        .global-protected-content img { -webkit-user-drag: none; user-select: none; }
        @media print {
          .global-protected-content { display: none !important; }
          .global-protected-print-note { display: block !important; }
        }
      `}</style>
      <div
        className="global-protected-content flex min-h-0 w-full min-w-0 flex-1 flex-col"
        onContextMenu={(e) => {
          if (!isEditableTarget(e.target)) e.preventDefault();
        }}
        onDragStart={(e) => {
          if (e.target instanceof Element && e.target.closest("img")) e.preventDefault();
        }}
      >
        {children}
        <WatermarkLayer />
        <ScreenshotProtection />
      </div>
      <p className="global-protected-print-note hidden text-center text-sm font-bold">المحتوى محمي</p>
    </>
  );
}
