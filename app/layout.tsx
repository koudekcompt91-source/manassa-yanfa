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
  title: "منصة ينفع | أكاديمية الأدب العربي",
  description: "منصة ينفع — أكاديمية عربية متخصصة في النحو والبلاغة والشعر والنقد وتحليل النصوص الأدبية.",
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
