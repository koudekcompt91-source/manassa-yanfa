"use client";

const BISMILLAH = "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ";

type BismillahBadgeProps = {
  /** `hero` — dark glass on landing hero; `light` — soft glass on light surfaces */
  variant?: "hero" | "light";
  motionOk?: boolean;
  className?: string;
};

const variantStyles = {
  hero: {
    shell:
      "border-white/14 bg-white/[0.05] text-sky-50/90 shadow-[0_0_18px_-10px_rgba(47,148,255,0.28),0_2px_12px_-8px_rgba(2,6,23,0.4),0_0_0_1px_rgba(255,255,255,0.04)_inset,inset_0_1px_0_0_rgba(255,255,255,0.08)]",
  },
  light: {
    shell:
      "border-brand-200/45 bg-white/68 text-brand-900 shadow-[0_0_16px_-12px_rgba(24,117,245,0.2),0_2px_10px_-8px_rgba(15,23,42,0.06),0_0_0_1px_rgba(255,255,255,0.82)_inset,inset_0_1px_0_0_rgba(255,255,255,0.92)]",
  },
} as const;

export default function BismillahBadge({
  variant = "hero",
  motionOk = true,
  className = "",
}: BismillahBadgeProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={`flex w-full justify-center ${motionOk ? "motion-safe:animate-bismillah-fade-in motion-reduce:animate-none" : ""} motion-reduce:opacity-100 ${className}`.trim()}
    >
      <p
        className={`relative inline-flex max-w-[min(100%,32rem)] items-center justify-center rounded-full border px-3 py-1 text-center backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-sm sm:px-4 sm:py-1.5 ${styles.shell}`}
      >
        <span
          className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-l from-transparent via-white/25 to-transparent opacity-70"
          aria-hidden
        />
        <span className="relative z-[1] text-pretty text-[0.6875rem] font-medium leading-[1.8] tracking-[0.01em] sm:text-xs sm:leading-[1.85]">
          {BISMILLAH}
        </span>
      </p>
    </div>
  );
}
