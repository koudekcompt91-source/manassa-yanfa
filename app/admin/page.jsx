"use client";

import AdminShell from "@/components/admin/AdminShell";
import { useDemoSection } from "@/lib/demo-store";

export default function AdminOverviewPage() {
  const [announcements] = useDemoSection("announcements");
  const [packages] = useDemoSection("packages");
  const [teachers] = useDemoSection("teachers");
  const [students] = useDemoSection("students");
  const [subscriptionPlans] = useDemoSection("plans");

  const cards = [
    { label: "إجمالي الطلاب", value: (students || []).length },
    { label: "إجمالي الدورات", value: (packages || []).length },
    { label: "إجمالي الأساتذة", value: (teachers || []).length },
    { label: "الاشتراكات النشطة", value: (subscriptionPlans || []).filter((plan) => plan.active ?? plan.isActive).length },
  ];

  const featuredCourses = (packages || []).filter((item) => item.isFeatured);
  const toCourseLabel = (value) => String(value || "").replace(/باقة/g, "دورة").replace(/الباقات/g, "الدورات");

  return (
    <AdminShell
      title="لوحة الإدارة"
      subtitle="متابعة أداء المنصة وإدارة المحتوى التعليمي من لوحة موحدة."
    >
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-slate-400">لوحة التشغيل</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">مرحبًا بك في إدارة منصة ينفع</h2>
        <p className="mt-2 text-base text-slate-500">تحكم في الدورات والأساتذة والطلاب ومحتوى المنصة بنفس تجربة الواجهة الموحدة.</p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6" aria-label="مؤشرات لوحة الإدارة">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-400">{card.label}</p>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{card.value}</p>
          </article>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-slate-900">أحدث الإعلانات</h2>
          <p className="mt-1 text-sm text-slate-400">آخر التحديثات والتنبيهات المنشورة للإدارة والطلاب.</p>
          {!(announcements || []).length ? (
            <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-6 text-center text-sm text-slate-500">
              لا توجد إعلانات حالية.
            </p>
          ) : (
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              {(announcements || []).map((item) => (
                <li key={item.id} className="rounded-xl border border-slate-200/80 bg-slate-50/40 px-4 py-3">
                  {item.title} - {item.date}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-slate-900">أكثر الدورات ظهورًا</h2>
          <p className="mt-1 text-sm text-slate-400">الدورات الأكثر تمييزًا وظهورًا في واجهة المنصة.</p>
          {!featuredCourses.length ? (
            <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-6 text-center text-sm text-slate-500">
              لا توجد دورات مميزة حاليًا.
            </p>
          ) : (
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              {featuredCourses.map((item) => (
                <li key={item.id} className="rounded-xl border border-slate-200/80 bg-slate-50/40 px-4 py-3">
                  {toCourseLabel(item.title)}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
