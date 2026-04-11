"use client";

import Link from "next/link";
import { useDemoSection } from "@/lib/demo-store";

export default function PricingPage() {
  const [subscriptionPlans] = useDemoSection("plans");
  return (
    <section className="container-page space-y-6 py-8 sm:py-10">
      <header className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">الاشتراكات</h1>
        <p className="mt-2 text-slate-600">باقات مرنة لمنهج أدبي متكامل في النحو والبلاغة والنقد وتحليل النصوص.</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        {(subscriptionPlans || []).map((plan) => (
          <article key={plan.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-brand-700">{plan.period}</p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-900">{plan.name}</h2>
            <p className="mt-3 text-3xl font-black text-slate-900">{plan.price}</p>
            <ul className="mt-5 space-y-2 text-sm text-slate-700">
              {plan.features.map((feature) => (
                <li key={feature} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">{feature}</li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white"
            >
              اشترك الآن
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
