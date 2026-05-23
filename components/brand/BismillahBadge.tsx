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
      "border-white/16 bg-white/[0.06] text-sky-50/92 shadow-[0_0_22px_-8px_rgba(47,148,255,0.32),0_4px_18px_-10px_rgba(2,6,23,0.45),0_0_0_1px_rgba(255,255,255,0.05)_inset,inset_0_1px_0_0_rgba(255,255,255,0.1)]",
    glow: "from-brand-400/20 via-sky-400/24 to-indigo-500/20 opacity-70 group-hover:opacity-95",
    hoverGlow:
      "group-hover:shadow-[0_0_30px_-6px_rgba(47,148,255,0.42),0_6px_22px_-10px_rgba(2,6,23,0.5),0_0_0_1px_rgba(255,255,255,0.08)_inset,inset_0_1px_0_0_rgba(255,255,255,0.14)]",
  },
  light: {
    shell:
      "border-brand-200/50 bg-white/70 text-brand-900 shadow-[0_0_20px_-10px_rgba(24,117,245,0.24),0_4px_16px_-12px_rgba(15,23,42,0.08),0_0_0_1px_rgba(255,255,255,0.85)_inset,inset_0_1px_0_0_rgba(255,255,255,0.95)]",
    glow: "from-brand-300/26 via-sky-300/30 to-indigo-400/22 opacity-55 group-hover:opacity-85",
    hoverGlow:
      "group-hover:shadow-[0_0_28px_-8px_rgba(24,117,245,0.34),0_6px_20px_-12px_rgba(15,23,42,0.1),0_0_0_1px_rgba(255,255,255,0.92)_inset,inset_0_1px_0_0_rgba(255,255,255,1)]",
  },
} as const;

export default function BismillahBadge({
  variant = "hero",
  motionOk = true,
  className = "",
}: BismillahBadgeProps) {
  const styles = variantStyles[variant];
  const motionClass = motionOk ? "motion-safe:animate-bismillah-fade-in motion-reduce:animate-none" : "";
  const floatClass = motionOk ? "motion-safe:animate-bismillah-float motion-reduce:animate-none" : "";

  return (
    <div className={`flex w-full justify-center lg:justify-center ${motionClass} motion-reduce:opacity-100 ${className}`.trim()}>
      <p
        className={`bismillah-badge group relative inline-flex max-w-[min(100%,34rem)] touch-manipulation items-center justify-center rounded-full border px-3.5 py-1.5 text-center backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-lg motion-reduce:opacity-100 sm:px-5 sm:py-2 ${floatClass} ${styles.shell} ${styles.hoverGlow} transition-[transform,box-shadow,border-color,background-color] duration-500 ease-out motion-safe:hover:scale-[1.03] motion-reduce:hover:scale-100`}
      >
        <span
          className={`pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-l blur-md transition-opacity duration-500 ease-out motion-reduce:opacity-50 ${styles.glow}`}
          aria-hidden
        />
        <span
          className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-l from-transparent via-white/30 to-transparent opacity-75"
          aria-hidden
        />
        <span className="relative z-[1] text-pretty text-xs font-medium leading-[1.85] tracking-[0.015em] sm:text-[0.8125rem] sm:leading-[1.9]">
          {BISMILLAH}
        </span>
      </p>
    </div>
  );
}
