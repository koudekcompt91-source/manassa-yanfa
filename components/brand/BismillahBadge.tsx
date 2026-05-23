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
      "border-white/15 bg-white/[0.06] text-sky-50/92 shadow-[0_0_20px_-10px_rgba(47,148,255,0.3),0_4px_14px_-8px_rgba(2,6,23,0.45),0_0_0_1px_rgba(255,255,255,0.05)_inset,inset_0_1px_0_0_rgba(255,255,255,0.1)]",
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
  const fadeClass = motionOk ? "motion-safe:animate-bismillah-fade-in motion-reduce:animate-none" : "";
  const floatClass = motionOk ? "motion-safe:animate-bismillah-float motion-reduce:animate-none" : "";

  return (
    <div className={`flex w-full justify-center px-3 sm:px-0 ${fadeClass} motion-reduce:opacity-100 ${className}`.trim()}>
      <p
        className={`relative inline-flex max-w-[min(100%,34rem)] items-center justify-center rounded-full border px-4 py-1.5 text-center font-sans backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-sm sm:px-5 sm:py-2 ${floatClass} ${styles.shell}`}
      >
        <span
          className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-l from-transparent via-white/28 to-transparent opacity-75"
          aria-hidden
        />
        <span className="relative z-[1] text-pretty text-xs font-medium leading-[1.85] tracking-[0.01em] sm:text-[0.8125rem] sm:leading-[1.9]">
          {BISMILLAH}
        </span>
      </p>
    </div>
  );
}
