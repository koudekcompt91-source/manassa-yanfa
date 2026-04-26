"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import BrandLogoMark from "@/components/brand/BrandLogoMark";
import { logoutSession } from "@/lib/admin-auth";
import { BRAND_NAME } from "@/lib/brand";
import {
  Bell,
  BookOpen,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Settings,
  Shapes,
  UserRound,
  Users,
} from "lucide-react";

const adminLinks = [
  { href: "/admin/dashboard", label: "لوحة التحكم", Icon: LayoutDashboard },
  { href: "/admin/courses", label: "الدورات", Icon: BookOpen },
  { href: "/admin/teachers", label: "الأساتذة", Icon: UserRound },
  { href: "/admin/students", label: "الطلاب", Icon: Users },
  { href: "/admin/recharge-requests", label: "طلبات الشحن", Icon: CreditCard },
  { href: "/admin/categories", label: "التصنيفات", Icon: Shapes },
  { href: "/admin/learning-paths", label: "المسارات التعليمية", Icon: Shapes },
  { href: "/admin/pages", label: "الصفحات", Icon: LayoutDashboard },
  { href: "/admin/buttons", label: "الأزرار", Icon: LayoutDashboard },
  { href: "/admin/messages", label: "الرسائل", Icon: MessageCircle },
  { href: "/admin/dashboard/messages", label: "محادثات الطلاب", Icon: MessageCircle },
  { href: "/admin/notifications", label: "الإشعارات", Icon: Bell },
  { href: "/admin/settings", label: "الإعدادات", Icon: Settings },
];

function isActiveLink(pathname, href) {
  if (href === "/admin/dashboard") {
    return pathname === "/admin/dashboard" || pathname === "/admin";
  }
  if (href === "/admin/courses") {
    // Keep old route compatibility while showing the new label.
    return pathname === "/admin/courses" || pathname.startsWith("/admin/courses/") || pathname === "/admin/packages" || pathname.startsWith("/admin/packages/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({ title, subtitle, children }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutSession();
    router.replace("/admin/login");
  };

  return (
    <section className="premium-app-bg w-full">
      <div className="container-landing grid gap-6 py-6 lg:grid-cols-[270px_1fr] lg:py-8">
      <aside className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:h-fit">
        <Link
          href="/admin/dashboard"
          className="pressable mb-3 flex flex-col items-center gap-2 rounded-lg no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          aria-label={BRAND_NAME}
        >
          <span className="flex justify-center">
            <BrandLogoMark variant="footer" showWordmark className="justify-center" />
          </span>
        </Link>
        <h2 className="mb-1 text-sm font-extrabold text-slate-900">لوحة الإدارة</h2>
        <nav className="space-y-1">
          {adminLinks.map((link) => {
            const active = isActiveLink(pathname, link.href);
            const Icon = link.Icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`interactive-tab touch-target flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-gradient-to-l from-brand-600 to-indigo-600 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className="touch-button-secondary mt-4 w-full justify-center gap-2 border-slate-300 bg-slate-900 px-3 text-white hover:bg-slate-800"
        >
          <LogOut className="h-4 w-4" />
          <span>تسجيل الخروج</span>
        </button>
      </aside>

      <div className="space-y-5">
        <header className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
              <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                لوحة موحدة
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                إدارة المنصة
              </span>
            </div>
          </div>
        </header>
        {children}
      </div>
      </div>
    </section>
  );
}
