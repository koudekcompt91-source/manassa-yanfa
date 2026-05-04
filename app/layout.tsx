import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cairo } from "next/font/google";
import Navbar from "@/components/Navbar";
import AppMain from "@/components/AppMain";
import { HOME_DESCRIPTION, HOME_TITLE, SITE_NAME, SITE_URL } from "@/lib/site-config";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: HOME_DESCRIPTION,
  icons: {
    icon: [{ url: "/brand/yanfa-icon-mark.png", type: "image/png" }],
    apple: [{ url: "/brand/yanfa-icon-mark.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "ar_DZ",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
  },
  verification: {
    google: "PUy0AL891Dmmp4tuUc80XpVoIi-nLSpsqb_4BEGrvWA",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body
        className={`${cairo.className} relative isolate flex min-h-screen w-full flex-col bg-gray-50 text-slate-900 antialiased`}
      >
        <Navbar />
        <AppMain>{children}</AppMain>
      </body>
    </html>
  );
}
