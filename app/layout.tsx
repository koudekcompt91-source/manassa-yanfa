import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cairo } from "next/font/google";
import Navbar from "@/components/Navbar";
import AppMain from "@/components/AppMain";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "yanfa3 Education | أكاديمية الأدب العربي",
  description:
    "yanfa3 Education — أكاديمية عربية متخصصة في النحو والبلاغة والشعر والنقد وتحليل النصوص الأدبية.",
  icons: {
    icon: [{ url: "/brand/yanfa-icon-mark.png", type: "image/png" }],
    apple: [{ url: "/brand/yanfa-icon-mark.png", type: "image/png" }],
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
