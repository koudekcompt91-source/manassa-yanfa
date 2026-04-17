/** Official product / marketing name (matches logo wordmark). */
export const BRAND_NAME = "yanfa3 Education";
export const BRAND_NAME_SHORT = "yanfa3";

/** Legacy full raster lockup — prefer `BrandLogoMark` + wordmark for new UI. */
export const BRAND_LOGO_FULL_SRC = "/brand/yanfa-education-full.jpg";
/** Official brand symbol (header, favicon, shell) — single source of truth. Update `public/brand/yanfa-icon-mark.png`. */
export const BRAND_LOGO_ICON_SRC = "/brand/yanfa-icon-mark.png";

/** Intrinsic asset size (both provided files are square 1024×1024). */
export const BRAND_LOGO_FULL_SIZE = { width: 1024, height: 1024 } as const;
export const BRAND_LOGO_ICON_SIZE = { width: 1024, height: 1024 } as const;
