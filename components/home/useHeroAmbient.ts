"use client";

import { useEffect, useRef, useState } from "react";

type Nudge = { x: number; y: number };

/**
 * Subtle pointer + scroll-driven offsets for hero atmosphere (transform-only, rAF-throttled).
 * Respects `prefers-reduced-motion: reduce`.
 */
export function useHeroAmbient(heroId = "hero", enabled = true) {
  const [motionOk, setMotionOk] = useState(true);
  const [nudge, setNudge] = useState<Nudge>({ x: 0, y: 0 });
  const [scrollShift, setScrollShift] = useState(0);
  const rafMove = useRef(0);
  const rafScroll = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionOk(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!motionOk || !enabled) return;
    const el = document.getElementById(heroId);
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(rafMove.current);
      rafMove.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const nx = (e.clientX - r.left) / Math.max(1, r.width) - 0.5;
        const ny = (e.clientY - r.top) / Math.max(1, r.height) - 0.5;
        /* Restrained range: cinematic depth without busy tracking */
        setNudge({
          x: Math.max(-0.32, Math.min(0.32, nx * 0.65)),
          y: Math.max(-0.32, Math.min(0.32, ny * 0.65)),
        });
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(rafMove.current);
      setNudge({ x: 0, y: 0 });
    };

    const onScroll = () => {
      cancelAnimationFrame(rafScroll.current);
      rafScroll.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height * 0.85)));
        setScrollShift(p);
      });
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      cancelAnimationFrame(rafMove.current);
      cancelAnimationFrame(rafScroll.current);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, [heroId, motionOk, enabled]);

  return { nudge, scrollShift, motionOk };
}
