import Image from "next/image";
import { BRAND_LOGO_ICON_SIZE, BRAND_LOGO_ICON_SRC, BRAND_NAME, BRAND_NAME_SHORT } from "@/lib/brand";

type BrandLogoMarkProps = {
  className?: string;
  priority?: boolean;
  /** Typographic companion to the mark — sharp at any size, RTL-aware layout. */
  showWordmark?: boolean;
  /** `navPrimary` — homepage bar (largest); `nav` — other public pages; `footer` — footer. */
  variant?: "navPrimary" | "nav" | "footer";
};

/**
 * One clean tile — reads as part of the header rail, not a separate floating widget.
 */
const variantFrame: Record<NonNullable<BrandLogoMarkProps["variant"]>, string> = {
  navPrimary:
    "relative flex shrink-0 items-center justify-center rounded-xl bg-white shadow-[0_1px_0_0_rgba(255,255,255,0.9)_inset,0_1px_2px_rgba(15,23,42,0.04),0_4px_16px_-4px_rgba(15,23,42,0.07)] ring-1 ring-slate-200/65 size-[3.65rem] sm:size-[4.1rem] md:size-[4.35rem]",
  nav: "relative flex shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70 size-[2.85rem] sm:size-[3.15rem]",
  footer:
    "relative flex shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/65 size-[3.15rem] sm:size-[3.5rem]",
};

const variantImage: Record<NonNullable<BrandLogoMarkProps["variant"]>, string> = {
  navPrimary: "size-[3rem] object-contain object-center sm:size-[3.35rem] md:size-[3.55rem]",
  nav: "size-[2.45rem] object-contain object-center sm:size-[2.7rem]",
  footer: "size-[2.65rem] object-contain object-center sm:size-[2.95rem]",
};

const variantSizes: Record<NonNullable<BrandLogoMarkProps["variant"]>, string> = {
  navPrimary: "(max-width: 640px) 72px, (max-width: 1024px) 80px, 88px",
  nav: "(max-width: 640px) 52px, 56px",
  footer: "(max-width: 640px) 56px, 64px",
};

const wordmarkTitle: Record<NonNullable<BrandLogoMarkProps["variant"]>, string> = {
  navPrimary: "text-[1.06rem] font-black tracking-tight text-slate-900 sm:text-lg md:text-xl",
  nav: "text-[1rem] font-black tracking-tight text-slate-900 sm:text-[1.05rem]",
  footer: "text-base font-black tracking-tight text-slate-900 sm:text-lg",
};

const wordmarkSubtitle: Record<NonNullable<BrandLogoMarkProps["variant"]>, string> = {
  navPrimary: "text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:text-[11px] md:text-xs",
  nav: "text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500 sm:text-[11px]",
  footer: "text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-500 sm:text-xs",
};

const wordmarkGap: Record<NonNullable<BrandLogoMarkProps["variant"]>, string> = {
  navPrimary: "gap-3 sm:gap-3.5 md:gap-4",
  nav: "gap-2.5 sm:gap-3",
  footer: "gap-3 sm:gap-3.5",
};

/**
 * Official brand **mark** (raster from `BRAND_LOGO_ICON_SRC`) + optional typographic wordmark.
 * Replace `public/brand/yanfa-icon-mark.png` to update the mark everywhere.
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
