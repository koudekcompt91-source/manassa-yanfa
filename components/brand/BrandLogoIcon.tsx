import Image from "next/image";
import { BRAND_LOGO_ICON_SIZE, BRAND_LOGO_ICON_SRC, BRAND_NAME } from "@/lib/brand";

const sizeClass = {
  sm: "h-8 w-8 min-h-8 min-w-8",
  md: "h-10 w-10 min-h-10 min-w-10",
  lg: "h-11 w-11 min-h-11 min-w-11",
} as const;

const imgSizes: Record<keyof typeof sizeClass, string> = {
  sm: "32px",
  md: "40px",
  lg: "44px",
};

type BrandLogoIconProps = {
  className?: string;
  size?: keyof typeof sizeClass;
  priority?: boolean;
};

/** Icon-only mark for sidebars, compact headers, favicon source, and small badges. */
export default function BrandLogoIcon({ className = "", size = "md", priority = false }: BrandLogoIconProps) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200/90 ${sizeClass[size]} ${className}`.trim()}
    >
      <Image
        src={BRAND_LOGO_ICON_SRC}
        alt={BRAND_NAME}
        width={BRAND_LOGO_ICON_SIZE.width}
        height={BRAND_LOGO_ICON_SIZE.height}
        priority={priority}
        sizes={imgSizes[size]}
        className="object-contain p-[5px]"
      />
    </span>
  );
}
