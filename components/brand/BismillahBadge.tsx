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
      "border-white/[0.15] bg-gradient-to-b from-white/[0.11] to-white/[0.05] text-sky-50/95 shadow-[0_4px_20px_-6px_rgba(2,6,23,0.55),0_0_24px_-10px_rgba(47,148,255,0.22),inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-[12px] supports-[backdrop-filter]:backdrop-blur-[12px]",
  },
  light: {
    shell:
      "border-brand-200/50 bg-gradient-to-b from-white/80 to-white/65 text-brand-900 shadow-[0_4px_16px_-8px_rgba(15,23,42,0.1),0_0_20px_-12px_rgba(24,117,245,0.18),inset_0_1px_0_0_rgba(255,255,255,0.95)] backdrop-blur-[12px] supports-[backdrop-filter]:backdrop-blur-[12px]",
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
    <div
      className={`flex w-full justify-center px-4 sm:px-0 ${fadeClass} motion-reduce:opacity-100 ${className}`.trim()}
    >
      <p
        className={`relative inline-flex max-w-[min(100%,34rem)] items-center justify-center rounded-full px-3.5 py-1.5 text-center font-sans font-medium leading-[1.85] sm:font-semibold sm:leading-[1.9] ${floatClass} ${styles.shell}`}
      >
        <span
          className="pointer-events-none absolute inset-x-3.5 top-0 h-px bg-gradient-to-l from-transparent via-white/30 to-transparent opacity-80"
          aria-hidden
        />
        <span className="relative z-[1] text-pretty text-[0.8125rem] tracking-normal sm:text-sm">
          {BISMILLAH}
        </span>
      </p>
    </div>
  );
}
