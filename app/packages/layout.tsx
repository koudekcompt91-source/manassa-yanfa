import type { Metadata } from "next";
import StudentAppShell from "@/components/student/StudentAppShell";
import { absoluteUrl, SITE_NAME } from "@/lib/site-config";

const title = "الدورات";
const description =
  "كتالوج دورات منصة ينفع في الأدب العربي وعلومه: تصفح المحتوى المنشور، الأسعار، والمسارات قبل الاشتراك.";

export const metadata: Metadata = {
  title,
  description,
  /** Catalog mirrors `/courses`; consolidate signals on one URL. Per-course pages set their own canonical under `/packages/[slug]`. */
  alternates: { canonical: "/courses" },
  openGraph: {
    title: `${title} | ${SITE_NAME}`,
    description,
    url: absoluteUrl("/courses"),
    siteName: SITE_NAME,
    locale: "ar_DZ",
    type: "website",
    images: [{ url: "/brand/yanfa-icon-mark.png", width: 512, height: 512, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | ${SITE_NAME}`,
    description,
  },
};

export default function PackagesLayout({ children }: { children: React.ReactNode }) {
  return <StudentAppShell>{children}</StudentAppShell>;
}
