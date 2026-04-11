"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Single main landmark: avoids nested flex/min-height chains that break RTL layouts.
 * Admin stays full-bleed; public/student routes get consistent page padding.
 */
export default function AppMain({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "";
  const isAdmin = pathname.startsWith("/admin");
  const isAuthPage = pathname === "/login" || pathname === "/register";

  const shell =
    isAdmin || isAuthPage
      ? "flex min-h-0 w-full flex-1 flex-col"
      : "flex min-h-0 w-full flex-1 flex-col px-4 py-6 sm:px-6";

  return (
    <div id="main-content" className={shell}>
      {children}
    </div>
  );
}
