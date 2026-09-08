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

const ICON_TONES = [
  "from-brand-600 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-600 to-indigo-700",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-brand-600",
  "from-brand-600 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-600 to-indigo-700",
];

/** Exact PAID student nav order — do not reorder. Same hrefs as before. */
export const STUDENT_NAV = [
  {
    href: "/dashboard",
    label: "الرئيسية",
    description: "نظرة عامة على تقدمك الدراسي ونشاطك اليومي.",
    id: "home",
    Icon: Home,
  },
  {
    href: "/dashboard/teachers",
    label: "أساتذتي",
    description: "تابع الدورات المسجّل فيها وواصل من حيث توقفت.",
    id: "my-courses",
    Icon: BookOpen,
  },
  {
    href: "/courses",
    label: "الدورات",
    description: "تصفّح الدورات المتاحة واختر ما يناسب مستواك.",
    id: "explore",
    Icon: BookOpen,
  },
  {
    href: "/store",
    label: "المتجر",
    description: "استكشف منتجات ومواد تعليمية إضافية من المتجر.",
    id: "store",
    Icon: ShoppingBag,
  },
  {
    href: "/dashboard#wallet",
    label: "المحفظة",
    description: "راجع رصيدك وأدر عمليات الشحن والمدفوعات.",
    id: "wallet",
    Icon: Wallet,
  },
  {
    href: "/dashboard/notifications",
    label: "الإشعارات",
    description: "اطّلع على آخر التنبيهات والرسائل المهمة.",
    id: "notifications",
    Icon: Bell,
  },
  {
    href: "/dashboard/certificates",
    label: "الشهادات",
    description: "عرض شهادات إتمام الدورات التي حصلت عليها.",
    id: "certificates",
    Icon: Award,
  },
  {
    href: "/profile",
    label: "حسابي",
    description: "إدارة بيانات حسابك وإعدادات ملفك الشخصي.",
    id: "account",
    Icon: UserRound,
  },
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
    return pathname === "/dashboard/teachers" || pathname.startsWith("/dashboard/teachers/");
  if (item.id === "wallet") return pathname === "/dashboard" && hash === "#wallet";
  if (item.id === "notifications") return pathname === "/dashboard/notifications";
  if (item.id === "certificates")
    return pathname === "/dashboard/certificates" || pathname.startsWith("/dashboard/certificates/");
  return false;
}

/**
 * Full-width stacked horizontal nav cards (reference layout).
 * One card per row — never multi-column. RTL: icon right · copy · CTA left.
 */
export default function StudentDashboardNav({ className = "" }) {
  const pathname = usePathname() || "";
  const hash = useHash();

  return (
    <nav
      dir="rtl"
      aria-label="تنقل لوحة الطالب"
      className={`dashboard-nav-stack w-full min-w-0 ${className}`.trim()}
    >
      {STUDENT_NAV.map((n, index) => {
        const active = studentNavActive(pathname, hash, n);
        const Icon = n.Icon;
        const tone = ICON_TONES[index % ICON_TONES.length];

        return (
          <Link
            key={n.href}
            href={n.href}
            className={`dashboard-nav-row group ${active ? "dashboard-nav-row-active" : ""}`}
          >
            {/* Right (RTL start): icon */}
            <span
              className={`dashboard-nav-row-icon bg-gradient-to-br text-white ${tone}`}
              aria-hidden
            >
              <Icon className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={1.75} />
            </span>

            {/* Middle: title + short description */}
            <span className="dashboard-nav-row-copy">
              <span className="dashboard-nav-row-title">{n.label}</span>
              <span className="dashboard-nav-row-desc">{n.description}</span>
            </span>

            {/* Left (RTL end): CTA */}
            <span className="dashboard-nav-row-cta touch-button-primary" aria-hidden>
              دخول القسم
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
