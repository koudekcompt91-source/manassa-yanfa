"use client";

import type { CSSProperties } from "react";

type HeroAmbientLayersProps = {
  motionOk: boolean;
  nudge: { x: number; y: number };
  scrollShift: number;
};

/**
 * Layered deep-navy hero atmosphere: soft drift, gentle parallax, pointer-reactive light.
 * All decorative layers are `pointer-events-none`; motion uses transform/opacity only.
 */
export default function HeroAmbientLayers({ motionOk, nudge, scrollShift }: HeroAmbientLayersProps) {
  const nx = motionOk ? nudge.x : 0;
  const ny = motionOk ? nudge.y : 0;
  const s = scrollShift;

  const ease = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
  const pStyle = (mx: number, my: number, scrollX: number, scrollY: number) =>
    ({
      transform: `translate3d(${nx * mx + s * scrollX}px, ${ny * my + s * scrollY}px, 0)`,
      transition: motionOk ? `transform 1.08s ${ease}` : undefined,
      willChange: motionOk ? ("transform" as const) : undefined,
    }) as CSSProperties;

  /** Pointer-reactive “light pool” — follows gaze without washing out copy */
  const lightShift = motionOk
    ? {
        transform: `translate3d(${nx * 22}px, ${ny * 16}px, 0) scale(1.02)`,
        transition: `transform 1.2s ${ease}`,
        willChange: "transform" as const,
      }
    : { transform: "translate3d(0, 0, 0)" };

  const lightCounter = motionOk
    ? {
        transform: `translate3d(${nx * -14}px, ${ny * -11}px, 0)`,
        transition: `transform 1.35s ${ease}`,
        willChange: "transform" as const,
      }
    : { transform: "translate3d(0, 0, 0)" };

  return (
    <>
      {/* Navy ink floor + corners — sits over mesh; opacity keeps mesh drift visible */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-hero-atmosphere opacity-[0.9]" aria-hidden />

      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_118%_78%_at_50%_118%,rgba(2,6,23,0.94),transparent)]"
        style={pStyle(7, 5, -22, -32)}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute -start-36 top-0 z-0 h-[30rem] w-[30rem] rounded-full bg-indigo-950/35 blur-3xl"
        style={pStyle(24, 18, -36, -20)}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -end-28 top-36 z-0 h-[24rem] w-[24rem] rounded-full bg-blue-950/30 blur-3xl"
        style={pStyle(-16, 12, 30, -22)}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute start-1/4 top-1/3 z-0 h-[min(44rem,72vw)] w-[min(44rem,72vw)] -translate-x-1/2"
        aria-hidden
      >
        <div
          className="h-full w-full rounded-full bg-blue-900/14 blur-[100px] motion-safe:animate-ambient-drift motion-reduce:animate-none"
          style={pStyle(12, 16, -20, -28)}
        />
      </div>
      <div className="pointer-events-none absolute -end-1/4 bottom-0 z-0 h-[38rem] w-[38rem]" aria-hidden>
        <div
          className="h-full w-full rounded-full bg-indigo-950/22 blur-[95px] motion-safe:animate-ambient-drift motion-reduce:animate-none"
          style={{ ...pStyle(-10, 9, 18, 12), animationDelay: "-9s" }}
        />
      </div>

      <div
        className="pointer-events-none absolute left-1/2 top-[17%] z-0 h-px w-[min(74vw,58rem)] -translate-x-1/2 rotate-[-11deg] bg-gradient-to-l from-transparent via-sky-300/10 to-transparent blur-sm"
        style={pStyle(9, 3, -12, -6)}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 z-0 mix-blend-soft-light motion-safe:animate-hero-aurora motion-reduce:animate-none motion-reduce:opacity-[0.09]"
        style={{
          background:
            "radial-gradient(ellipse 72% 54% at 32% 22%, rgba(59,130,246,0.14), transparent 58%), radial-gradient(ellipse 62% 48% at 88% 62%, rgba(79,70,229,0.1), transparent 54%), radial-gradient(ellipse 44% 36% at 12% 78%, rgba(15,23,42,0.12), transparent 50%)",
        }}
        aria-hidden
      />

      <div
        className={`pointer-events-none absolute inset-0 z-0 motion-reduce:animate-none motion-reduce:opacity-[0.1] ${motionOk ? "motion-safe:animate-hero-veil" : "opacity-[0.11]"}`}
        style={{
          mixBlendMode: "normal",
          background:
            "radial-gradient(ellipse 84% 50% at 40% 36%, rgba(30,58,138,0.09), transparent 56%), radial-gradient(ellipse 70% 46% at 82% 74%, rgba(49,46,129,0.08), transparent 54%), radial-gradient(ellipse 46% 36% at 12% 82%, rgba(15,23,42,0.06), transparent 50%)",
        }}
        aria-hidden
      />

      {/* Pointer-reactive cool light — large, soft */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div
          className="absolute left-1/2 top-[38%] h-[min(118vw,54rem)] w-[min(118vw,54rem)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-90 blur-3xl"
          style={{
            ...lightShift,
            background:
              "radial-gradient(circle at 50% 50%, rgba(147,197,253,0.085) 0%, rgba(59,130,246,0.055) 28%, rgba(37,99,235,0.035) 48%, transparent 68%)",
          }}
        />
        <div
          className="absolute left-1/2 top-[44%] h-[min(95vw,42rem)] w-[min(95vw,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80 blur-3xl"
          style={{
            ...lightCounter,
            background:
              "radial-gradient(circle at 50% 50%, rgba(129,140,248,0.06) 0%, rgba(67,56,202,0.045) 40%, transparent 65%)",
          }}
        />
      </div>

      {/* Scroll-deepening ink — opacity only */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-slate-950"
        style={{
          opacity: motionOk ? Math.min(0.072, 0.016 + s * 0.06) : 0.032,
          mixBlendMode: "multiply",
        }}
        aria-hidden
      />
    </>
  );
}
