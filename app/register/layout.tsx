import type { Metadata } from "next";
import type { ReactNode } from "react";
import { absoluteUrl, SITE_NAME } from "@/lib/site-config";

const title = "إنشاء حساب";
const description =
  "أنشئ حسابًا طلابيًا على منصة ينفع وابدأ رحلتك في تعلم الأدب العربي مع الدروس المسجلة والمتابعة الذكية للتقدم.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/register" },
  openGraph: {
    title: `${title} | ${SITE_NAME}`,
    description,
    url: absoluteUrl("/register"),
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

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
