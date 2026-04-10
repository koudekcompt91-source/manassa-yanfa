import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cairo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "منصة ينفع | تحضير البكالوريا",
  description: "منصة ينفع — تعليم عربي للبكالوريا: دروس مباشرة، متابعة شخصية، ومسارات واضحة لطلاب البكالوريا.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${cairo.className}`}>
      <body className="min-h-screen">
        <Navbar />
        <main id="main-content" className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </body>
    </html>
  );
}
