"use client";

const BISMILLAH = "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ";

type BismillahBadgeProps = {
  /** `hero` — dark glass on landing hero; `light` — soft glass on light surfaces */
  variant?: "hero" | "light";
  motionOk?: boolean;
  className?: string;
};

const variantStyles = {
  hero:
    "border-white/[0.12] bg-white/[0.08] text-white/85 backdrop-blur-[10px] supports-[backdrop-filter]:backdrop-blur-[10px]",
  light:
    "border-brand-200/45 bg-white/70 text-brand-900 backdrop-blur-[10px] supports-[backdrop-filter]:backdrop-blur-[10px]",
} as const;

export default function BismillahBadge({
  variant = "hero",
  motionOk = true,
  className = "",
}: BismillahBadgeProps) {
  const shell = variantStyles[variant];
  const fadeClass = motionOk ? "motion-safe:animate-bismillah-fade-in motion-reduce:animate-none" : "";

  return (
    <p
      className={`inline-flex w-fit items-center justify-center rounded-full border px-[14px] py-[6px] text-[13px] font-medium leading-normal tracking-normal ${fadeClass} motion-reduce:opacity-100 ${shell} ${className}`.trim()}
    >
      {BISMILLAH}
    </p>
  );
}
