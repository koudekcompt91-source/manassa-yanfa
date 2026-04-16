import Image from "next/image";
import { BRAND_LOGO_ICON_SIZE, BRAND_LOGO_ICON_SRC, BRAND_NAME } from "@/lib/brand";

const sizeClass = {
  sm: "h-7 w-7 min-h-7 min-w-7",
  md: "h-8 w-8 min-h-8 min-w-8",
  lg: "h-9 w-9 min-h-9 min-w-9",
} as const;

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
        sizes="40px"
        className="object-contain p-1"
      />
    </span>
  );
}
