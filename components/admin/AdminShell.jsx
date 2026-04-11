"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutSession } from "@/lib/admin-auth";

const adminLinks = [
  { href: "/admin/dashboard", label: "لوحة التحكم" },
  { href: "/admin/packages", label: "الباقات" },
  { href: "/admin/lessons", label: "الدروس" },
  { href: "/admin/teachers", label: "الأساتذة" },
  { href: "/admin/students", label: "الطلاب" },
  { href: "/admin/recharge-requests", label: "طلبات الشحن" },
  { href: "/admin/categories", label: "التصنيفات" },
  { href: "/admin/plans", label: "الباقات" },
  { href: "/admin/pages", label: "الصفحات" },
  { href: "/admin/buttons", label: "الأزرار" },
  { href: "/admin/messages", label: "الرسائل" },
  { href: "/admin/settings", label: "الإعدادات" },
];

export default function AdminShell({ title, subtitle, children }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutSession();
    router.replace("/admin/login");
  };

  return (
    <section className="w-full bg-slate-100">
      <div className="container-landing grid gap-6 py-6 lg:grid-cols-[270px_1fr] lg:py-8">
      <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card lg:sticky lg:top-6 lg:h-fit">
        <h2 className="mb-1 text-sm font-extrabold text-slate-900">لوحة إدارة منصة ينفع</h2>
        <p className="mb-3 text-xs text-slate-500">مركز تحكم أكاديمية الأدب العربي</p>
        <nav className="space-y-1">
          {adminLinks.map((link) => {
            const active = pathname === link.href || (link.href === "/admin/dashboard" && pathname === "/admin");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-gradient-to-l from-brand-600 to-indigo-600 text-white"
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
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
              <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                لوحة إدارة خاصة
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                وضع إداري آمن
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
