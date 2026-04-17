import Image from "next/image";
import { BRAND_LOGO_ICON_SIZE, BRAND_LOGO_ICON_SRC, BRAND_NAME, BRAND_NAME_SHORT } from "@/lib/brand";

type BrandLogoMarkProps = {
  className?: string;
  priority?: boolean;
  /** Typographic companion to the mark — sharp at any size, RTL-aware layout. */
  showWordmark?: boolean;
  /**
   * `navPrimary` — marketing home navbar (largest).
   * `nav` — standard public header (courses, pricing, …).
   * `authFocal` — login / register / admin auth hero (large mark + wordmark).
   * `footer` — footer & compact shells (sidebar rail).
   */
  variant?: "navPrimary" | "nav" | "authFocal" | "footer";
};

/**
 * One clean tile — reads as part of the header rail, not a separate floating widget.
 */
const variantFrame: Record<NonNullable<BrandLogoMarkProps["variant"]>, string> = {
  navPrimary:
    "relative flex shrink-0 items-center justify-center rounded-[0.9rem] bg-white shadow-sm ring-1 ring-slate-200/50 size-[3.95rem] sm:size-[4.35rem] md:size-[4.65rem]",
  nav: "relative flex shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/60 size-[3.2rem] sm:size-[3.55rem]",
  authFocal:
    "relative flex shrink-0 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-slate-200/55 size-[4.35rem] sm:size-[4.95rem]",
  footer:
    "relative flex shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/65 size-[3.15rem] sm:size-[3.5rem]",
};

const variantImage: Record<NonNullable<BrandLogoMarkProps["variant"]>, string> = {
  navPrimary: "size-[3.28rem] object-contain object-center sm:size-[3.58rem] md:size-[3.85rem]",
  nav: "size-[2.72rem] object-contain object-center sm:size-[3.02rem]",
  authFocal: "size-[3.78rem] object-contain object-center sm:size-[4.35rem]",
  footer: "size-[2.65rem] object-contain object-center sm:size-[2.95rem]",
};

const variantSizes: Record<NonNullable<BrandLogoMarkProps["variant"]>, string> = {
  navPrimary: "(max-width: 640px) 80px, (max-width: 1024px) 88px, 96px",
  nav: "(max-width: 640px) 58px, 64px",
  authFocal: "(max-width: 640px) 96px, 112px",
  footer: "(max-width: 640px) 56px, 64px",
};

const wordmarkTitle: Record<NonNullable<BrandLogoMarkProps["variant"]>, string> = {
  navPrimary: "text-[1.14rem] font-black tracking-tight text-slate-900 sm:text-[1.2rem] md:text-[1.35rem]",
  nav: "text-[1.02rem] font-black tracking-tight text-slate-900 sm:text-[1.08rem]",
  authFocal: "text-xl font-black tracking-tight text-slate-900 sm:text-2xl md:text-[1.65rem]",
  footer: "text-base font-black tracking-tight text-slate-900 sm:text-lg",
};

const wordmarkSubtitle: Record<NonNullable<BrandLogoMarkProps["variant"]>, string> = {
  navPrimary: "text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 sm:text-[11px] md:text-[0.7rem]",
  nav: "text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500 sm:text-[11px]",
  authFocal: "text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-500 sm:text-xs md:text-[0.8rem]",
  footer: "text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-500 sm:text-xs",
};

const wordmarkGap: Record<NonNullable<BrandLogoMarkProps["variant"]>, string> = {
  navPrimary: "gap-3.5 sm:gap-4 md:gap-[1.125rem]",
  nav: "gap-2.5 sm:gap-3",
  authFocal: "gap-4 sm:gap-5 md:gap-6",
  footer: "gap-3 sm:gap-3.5",
};

/**
 * Official brand **mark** (`BRAND_LOGO_ICON_SRC`) + optional typographic wordmark — use this instead of legacy full lockups in headers.
 */
export default function BrandLogoMark({
  className = "",
  priority = false,
  showWordmark = true,
  variant = "nav",
}: BrandLogoMarkProps) {
  const rest = BRAND_NAME.replace(BRAND_NAME_SHORT, "").trim();

  return (
    <span
      className={`inline-flex max-w-full items-center ${wordmarkGap[variant]} ${className}`.trim()}
    >
      <span className={variantFrame[variant]} {...(showWordmark ? { "aria-hidden": true as const } : {})}>
        <Image
          src={BRAND_LOGO_ICON_SRC}
          alt={showWordmark ? "" : BRAND_NAME}
          width={BRAND_LOGO_ICON_SIZE.width}
          height={BRAND_LOGO_ICON_SIZE.height}
          priority={priority}
          sizes={variantSizes[variant]}
          className={`${variantImage[variant]} select-none`}
        />
      </span>
      {showWordmark ? (
        <span className="flex min-w-0 flex-col justify-center gap-0.5 text-start leading-[1.15]" aria-hidden>
          <span className={`truncate ${wordmarkTitle[variant]}`}>{BRAND_NAME_SHORT}</span>
          {rest ? (
            <span className={`truncate ${wordmarkSubtitle[variant]}`} dir="ltr">
              {rest}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
