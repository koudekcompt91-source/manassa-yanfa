"use client";

import { useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminActionButton, AdminEmptyState, AdminInput, AdminListCard, AdminSectionCard } from "@/components/admin/AdminUI";
import { useDemoSection } from "@/lib/demo-store";
import { formatDzd } from "@/lib/format-money";

export default function AdminSubscriptionsPage() {
  const [subscriptionPlans, setSubscriptionPlans] = useDemoSection("plans");
  const [query, setQuery] = useState("");
  const [featuredPlanId, setFeaturedPlanId] = useState("plan-quarterly");
  const [newPlanName, setNewPlanName] = useState("");
  const plans = useMemo(
    () => (subscriptionPlans || []).filter((plan) => `${plan.name} ${plan.period}`.includes(query.trim())),
    [subscriptionPlans, query]
  );

  return (
    <AdminShell title="إدارة الاشتراكات" subtitle="التحكم في الباقات الشهرية والفصلية والسنوية ومزاياها.">
      <AdminSectionCard title="الباقات والاشتراكات" subtitle="إدارة خطط الاشتراك وتعيين الباقة المميزة.">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <AdminInput
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن باقة..."
            className="sm:max-w-xs"
          />
          <div className="flex gap-2">
            <AdminInput value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)} placeholder="اسم باقة" className="min-w-[160px]" />
            <AdminActionButton
              onClick={() => {
                const name = newPlanName.trim();
                if (!name) return;
                setSubscriptionPlans([
                  ...(subscriptionPlans || []),
                  { id: `plan-${Date.now()}`, name, period: "شهري", price: formatDzd(0), featured: false, active: true, features: ["ميزة جديدة"] },
                ]);
                setNewPlanName("");
              }}
              tone="primary"
              className="rounded-xl px-4 py-2 text-sm font-bold"
            >
              إضافة باقة
            </AdminActionButton>
          </div>
        </div>
        {!plans.length ? (
          <AdminEmptyState title="لا توجد باقات مطابقة" description="أضف باقة جديدة أو عدّل البحث." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => (
              <AdminListCard key={plan.id} className="rounded-2xl p-5">
                <h2 className="text-lg font-bold text-slate-900">{plan.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{plan.period}</p>
                <p className="mt-2 text-xl font-black text-brand-700">{plan.price}</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {plan.features.map((feature) => (
                    <li key={feature} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5">{feature}</li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <AdminActionButton onClick={() => setSubscriptionPlans((subscriptionPlans || []).map((row) => (row.id === plan.id ? { ...row, active: !row.active } : row)))}>{plan.active ? "إيقاف" : "تفعيل"}</AdminActionButton>
                  <AdminActionButton onClick={() => setSubscriptionPlans((subscriptionPlans || []).filter((row) => row.id !== plan.id))} tone="danger">حذف</AdminActionButton>
                  <AdminActionButton
                    onClick={() => {
                      setFeaturedPlanId(plan.id);
                      setSubscriptionPlans((subscriptionPlans || []).map((row) => ({ ...row, featured: row.id === plan.id })));
                    }}
                    className={`${featuredPlanId === plan.id ? "bg-brand-100 text-brand-700" : ""}`}
                  >
                    {featuredPlanId === plan.id ? "الباقة المميزة" : "تعيين كمميزة"}
                  </AdminActionButton>
                </div>
              </AdminListCard>
            ))}
          </div>
        )}
      </AdminSectionCard>
    </AdminShell>
  );
}
