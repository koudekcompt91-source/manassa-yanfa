/**
 * Canonical site URL for SEO (metadataBase, sitemap, robots).
 * Override with NEXT_PUBLIC_SITE_URL or SITE_URL (no trailing slash).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://manassa-yanfa-production.up.railway.app"
).replace(/\/+$/, "");

export const SITE_NAME = "منصة ينفع";

export const HOME_TITLE = "منصة ينفع | تعلم الأدب العربي";

export const HOME_DESCRIPTION =
  "منصة تعليمية عربية لتعلم الأدب العربي وعلومه عبر الدروس المسجلة، الحصص المباشرة، الاختبارات، متابعة التقدم، والشهادات.";

export function absoluteUrl(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_URL}${path}`;
}
