import type { Metadata } from "next";
import StudentAppShell from "@/components/student/StudentAppShell";
import { absoluteUrl, SITE_NAME } from "@/lib/site-config";

const title = "الدورات التعليمية";
const description =
  "تصفح دورات الأدب العربي على منصة ينفع: دروس مسجلة، مسارات تعليمية، واشتراكات تناسب مستواك الدراسي.";

export const metadata: Metadata = {
  title,
  description,
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

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <StudentAppShell>{children}</StudentAppShell>;
}
