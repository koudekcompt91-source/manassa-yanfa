"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  BookOpen,
  Award,
  Home,
  ShoppingBag,
  UserRound,
  Wallet,
} from "lucide-react";

/** Exact PAID student nav order — do not reorder. */
export const STUDENT_NAV = [
  { href: "/dashboard", label: "الرئيسية", id: "home", Icon: Home },
  { href: "/dashboard#my-courses", label: "دوراتي", id: "my-courses", Icon: BookOpen },
  { href: "/courses", label: "الدورات", id: "explore", Icon: BookOpen },
  { href: "/store", label: "المتجر", id: "store", Icon: ShoppingBag },
  { href: "/dashboard#wallet", label: "المحفظة", id: "wallet", Icon: Wallet },
  { href: "/dashboard/notifications", label: "الإشعارات", id: "notifications", Icon: Bell },
  { href: "/dashboard/certificates", label: "الشهادات", id: "certificates", Icon: Award },
  { href: "/profile", label: "حسابي", id: "account", Icon: UserRound },
];

function useHash() {
  const [hash, setHash] = useState("");
  useEffect(() => {
    const read = () => setHash(typeof window !== "undefined" ? window.location.hash || "" : "");
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  return hash;
}

export function studentNavActive(pathname, hash, item) {
  if (item.id === "explore")
    return (
      pathname === "/courses" ||
      pathname.startsWith("/courses/") ||
      pathname === "/packages" ||
      pathname.startsWith("/packages/")
    );
  if (item.id === "store") return pathname === "/store" || pathname.startsWith("/store/");
  if (item.id === "account") return pathname.startsWith("/profile");
  if (item.id === "home") return pathname === "/dashboard" && (!hash || hash === "#");
  if (item.id === "my-courses")
    return pathname === "/dashboard" && (hash === "#my-courses" || hash === "#my-packages");
  if (item.id === "wallet") return pathname === "/dashboard" && hash === "#wallet";
  if (item.id === "notifications") return pathname === "/dashboard/notifications";
  if (item.id === "certificates")
    return pathname === "/dashboard/certificates" || pathname.startsWith("/dashboard/certificates/");
  return false;
}

/**
 * Horizontal rectangular nav cards for PAID student shell.
 * Same links/order as the former sidebar — layout only.
 */
export default function StudentDashboardNav({ className = "" }) {
  const pathname = usePathname() || "";
  const hash = useHash();

  return (
    <nav
      dir="rtl"
      aria-label="تنقل لوحة الطالب"
      className={`dashboard-nav-grid w-full min-w-0 ${className}`.trim()}
    >
      {STUDENT_NAV.map((n) => {
        const active = studentNavActive(pathname, hash, n);
        const Icon = n.Icon;
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`dashboard-nav-card group ${
              active ? "dashboard-nav-card-active" : "dashboard-nav-card-idle"
            }`}
          >
            <span
              className={`dashboard-nav-card-icon ${
                active ? "dashboard-nav-card-icon-active" : "dashboard-nav-card-icon-idle"
              }`}
              aria-hidden
            >
              <Icon className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" strokeWidth={2} />
            </span>
            <span className="dashboard-nav-card-label">{n.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
