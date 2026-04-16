import Image from "next/image";
import { BRAND_LOGO_FULL_SIZE, BRAND_LOGO_FULL_SRC, BRAND_NAME } from "@/lib/brand";

type BrandLogoFullProps = {
  className?: string;
  priority?: boolean;
  /**
   * `toolbar` — public navbar / footer (compact).
   * `hero` — landing hero corner / dark surfaces on light panel.
   * `auth` — centered login & register focal.
   * `sidebar` — narrow column (~260–270px); small full lockup.
   */
  variant?: "toolbar" | "hero" | "auth" | "sidebar";
};

const variantClass: Record<NonNullable<BrandLogoFullProps["variant"]>, string> = {
  toolbar:
    "h-7 w-auto max-w-[min(190px,52vw)] object-contain object-center sm:h-8 sm:max-w-[210px]",
  hero: "h-8 w-auto max-w-[min(220px,58vw)] object-contain object-center sm:h-9 sm:max-w-[240px]",
  auth: "h-9 w-auto max-w-[min(240px,78vw)] object-contain object-center sm:h-10 sm:max-w-[260px]",
  sidebar:
    "h-6 w-auto max-w-[min(150px,85%)] object-contain object-center sm:h-7 sm:max-w-[168px]",
};

const variantSizes: Record<NonNullable<BrandLogoFullProps["variant"]>, string> = {
  toolbar: "(max-width: 640px) 190px, 210px",
  hero: "(max-width: 640px) 220px, 240px",
  auth: "(max-width: 640px) 240px, 260px",
  sidebar: "168px",
};

/**
 * Full "yanfa3 Education" lockup — primary brand asset (icon-only lives in `BrandLogoIcon`).
 */
export default function BrandLogoFull({
  className = "",
  priority = false,
  variant = "toolbar",
}: BrandLogoFullProps) {
  return (
    <span className={`inline-flex items-center ${className}`.trim()}>
      <Image
        src={BRAND_LOGO_FULL_SRC}
        alt={BRAND_NAME}
        width={BRAND_LOGO_FULL_SIZE.width}
        height={BRAND_LOGO_FULL_SIZE.height}
        priority={priority}
        sizes={variantSizes[variant]}
        className={variantClass[variant]}
      />
    </span>
  );
}
