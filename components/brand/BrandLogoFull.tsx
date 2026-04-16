import Image from "next/image";
import { BRAND_LOGO_FULL_SIZE, BRAND_LOGO_FULL_SRC, BRAND_NAME } from "@/lib/brand";

type BrandLogoFullProps = {
  className?: string;
  priority?: boolean;
  /**
   * `toolbar` — public navbar / footer (compact).
   * `landingNav` — marketing home navbar; larger brand weight.
   * `hero` — landing hero corner chip on dark hero.
   * `auth` — centered login & register focal.
   * `sidebar` — narrow column (~260–270px); small full lockup.
   */
  variant?: "toolbar" | "landingNav" | "hero" | "auth" | "sidebar";
};

const variantClass: Record<NonNullable<BrandLogoFullProps["variant"]>, string> = {
  toolbar:
    "h-7 w-auto max-w-[min(190px,52vw)] object-contain object-center sm:h-8 sm:max-w-[210px]",
  landingNav:
    "h-11 w-auto max-w-[min(300px,78vw)] object-contain object-center sm:h-12 sm:max-w-[min(330px,62vw)] md:h-[3.35rem] md:max-w-[min(360px,48vw)] lg:h-14 lg:max-w-[min(400px,40vw)] xl:h-[3.75rem] xl:max-w-[min(440px,34vw)]",
  hero:
    "h-12 w-auto max-w-[min(320px,82vw)] object-contain object-center sm:h-[3.35rem] sm:max-w-[min(380px,70vw)] md:h-14 md:max-w-[min(420px,56vw)] lg:h-16 lg:max-w-[min(460px,48vw)] xl:h-[4.25rem] xl:max-w-[min(500px,42vw)]",
  auth: "h-9 w-auto max-w-[min(240px,78vw)] object-contain object-center sm:h-10 sm:max-w-[260px]",
  sidebar:
    "h-6 w-auto max-w-[min(150px,85%)] object-contain object-center sm:h-7 sm:max-w-[168px]",
};

const variantSizes: Record<NonNullable<BrandLogoFullProps["variant"]>, string> = {
  toolbar: "(max-width: 640px) 190px, 210px",
  landingNav: "(max-width: 768px) 300px, (max-width: 1280px) 380px, 440px",
  hero: "(max-width: 768px) 360px, (max-width: 1280px) 460px, 500px",
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
