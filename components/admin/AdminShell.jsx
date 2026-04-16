"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import BrandLogoFull from "@/components/brand/BrandLogoFull";
import { logoutSession } from "@/lib/admin-auth";
import { BRAND_NAME } from "@/lib/brand";

const adminLinks = [
  { href: "/admin/dashboard", label: "لوحة التحكم" },
  { href: "/admin/courses", label: "الدورات" },
  { href: "/admin/teachers", label: "الأساتذة" },
  { href: "/admin/students", label: "الطلاب" },
  { href: "/admin/recharge-requests", label: "طلبات الشحن" },
  { href: "/admin/categories", label: "التصنيفات" },
  { href: "/admin/pages", label: "الصفحات" },
  { href: "/admin/buttons", label: "الأزرار" },
  { href: "/admin/messages", label: "الرسائل" },
  { href: "/admin/settings", label: "الإعدادات" },
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
    <section className="w-full bg-gray-50">
      <div className="container-landing grid gap-6 py-6 lg:grid-cols-[270px_1fr] lg:py-8">
      <aside className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:h-fit">
        <Link
          href="/admin/dashboard"
          className="mb-3 flex flex-col items-center gap-2 no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-lg"
          aria-label={BRAND_NAME}
        >
          {/* Narrow sticky column (lg+): small full lockup; stacked full-width aside: slightly larger toolbar preset */}
          <span className="flex justify-center lg:hidden">
            <BrandLogoFull variant="toolbar" />
          </span>
          <span className="hidden justify-center lg:flex">
            <BrandLogoFull variant="sidebar" />
          </span>
          <span className="sr-only">{BRAND_NAME}</span>
        </Link>
        <h2 className="mb-1 text-sm font-extrabold text-slate-900">لوحة الإدارة</h2>
        <nav className="space-y-1">
          {adminLinks.map((link) => {
            const active = isActiveLink(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          تسجيل الخروج
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
