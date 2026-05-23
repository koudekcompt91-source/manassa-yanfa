"use client";

const BISMILLAH = "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ";

type BismillahBadgeProps = {
  /** `hero` — dark glass on landing hero; `light` — soft glass on light surfaces */
  variant?: "hero" | "light";
  scrollShift?: number;
  motionOk?: boolean;
  className?: string;
};

const variantStyles = {
  hero: {
    shell:
      "border-white/18 bg-white/[0.07] text-sky-50/95 shadow-[0_0_28px_-6px_rgba(47,148,255,0.38),0_0_0_1px_rgba(255,255,255,0.06)_inset,inset_0_1px_0_0_rgba(255,255,255,0.12)]",
    glow: "from-brand-400/25 via-sky-400/30 to-indigo-500/25 opacity-75 group-hover:opacity-100",
    hoverGlow:
      "group-hover:shadow-[0_0_36px_-4px_rgba(47,148,255,0.52),0_0_0_1px_rgba(255,255,255,0.1)_inset,inset_0_1px_0_0_rgba(255,255,255,0.16)]",
  },
  light: {
    shell:
      "border-brand-200/55 bg-white/72 text-brand-900 shadow-[0_0_24px_-8px_rgba(24,117,245,0.28),0_0_0_1px_rgba(255,255,255,0.85)_inset,inset_0_1px_0_0_rgba(255,255,255,0.95)]",
    glow: "from-brand-300/30 via-sky-300/35 to-indigo-400/25 opacity-60 group-hover:opacity-90",
    hoverGlow:
      "group-hover:shadow-[0_0_32px_-6px_rgba(24,117,245,0.38),0_0_0_1px_rgba(255,255,255,0.92)_inset,inset_0_1px_0_0_rgba(255,255,255,1)]",
  },
} as const;

export default function BismillahBadge({
  variant = "hero",
  scrollShift = 0,
  motionOk = true,
  className = "",
}: BismillahBadgeProps) {
  const styles = variantStyles[variant];
  const parallax =
    motionOk && scrollShift !== 0
      ? { transform: `translate3d(0, ${(scrollShift * -0.12).toFixed(2)}px, 0)` }
      : undefined;

  return (
    <div
      className={`flex w-full justify-center px-1 sm:px-0 ${className}`.trim()}
      style={parallax}
    >
      <p
        className={`bismillah-badge group relative inline-flex max-w-[min(100%,36rem)] touch-manipulation items-center justify-center rounded-full border px-4 py-2 text-center backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-lg motion-safe:animate-bismillah-fade-in motion-reduce:animate-none motion-reduce:opacity-100 sm:px-6 sm:py-2.5 ${styles.shell} ${styles.hoverGlow} transition-[transform,box-shadow,border-color,background-color] duration-500 ease-out motion-safe:hover:scale-[1.025] motion-reduce:hover:scale-100`}
      >
        <span
          className={`pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-l blur-md transition-opacity duration-500 ease-out motion-reduce:opacity-50 ${styles.glow}`}
          aria-hidden
        />
        <span
          className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-l from-transparent via-white/35 to-transparent opacity-80"
          aria-hidden
        />
        <span className="relative z-[1] text-pretty text-[0.8125rem] font-semibold leading-[1.85] tracking-[0.01em] sm:text-sm sm:leading-[1.9] md:text-[0.9375rem]">
          {BISMILLAH}
        </span>
      </p>
    </div>
  );
}
