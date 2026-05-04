import type { Metadata } from "next";
import HomeLanding from "@/components/home/HomeLanding";
import { absoluteUrl, HOME_DESCRIPTION, HOME_TITLE, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    locale: "ar_DZ",
    type: "website",
    images: [{ url: "/brand/yanfa-icon-mark.png", width: 512, height: 512, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
};

export default function HomePage() {
  return <HomeLanding />;
}
