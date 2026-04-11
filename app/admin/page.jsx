"use client";

import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminUI";
import { useDemoSection } from "@/lib/demo-store";

export default function AdminOverviewPage() {
  const [announcements] = useDemoSection("announcements");
  const [packages] = useDemoSection("packages");
  const [lessons] = useDemoSection("lessons");
  const [students] = useDemoSection("students");
  const [subscriptionPlans] = useDemoSection("plans");

  const cards = [
    { label: "إجمالي الطلاب", value: (students || []).length },
    { label: "إجمالي الباقات", value: (packages || []).length },
    { label: "إجمالي الدروس", value: (lessons || []).length },
    { label: "الاشتراكات النشطة", value: (subscriptionPlans || []).filter((plan) => plan.active ?? plan.isActive).length },
  ];

  return (
    <AdminShell
      title="لوحة الإدارة"
      subtitle="نظرة شاملة على أداء المنصة ومتابعة التشغيل الأكاديمي لأقسام الأدب العربي."
    >
      <AdminCard className="bg-gradient-to-l from-brand-50 to-indigo-50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-brand-700">مركز التحكم الرئيسي</p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-900">إدارة أكاديمية منصة ينفع</h2>
            <p className="mt-1 text-sm text-slate-600">يمكنك متابعة المحتوى، الطلاب، المسارات، والإعدادات من لوحة واحدة منظمة.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/packages" className="rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold text-white">إدارة الباقات</Link>
            <Link href="/admin/messages" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700">إدارة الرسائل</Link>
          </div>
        </div>
      </AdminCard>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-1 text-3xl font-black text-brand-700">{card.value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="text-lg font-bold text-slate-900">أحدث الإعلانات</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {(announcements || []).map((item) => (
              <li key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                {item.title} - {item.date}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="text-lg font-bold text-slate-900">أكثر الباقات ظهورًا</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {(packages || []).filter((item) => item.isFeatured).map((item) => (
              <li key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                {item.title}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminShell>
  );
}
