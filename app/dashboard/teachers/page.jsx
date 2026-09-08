"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import TeachersSectionCard from "@/components/student/TeachersSectionCard";
import { TEACHERS_SECTIONS } from "@/lib/paid-teachers-sections";

/**
 * PAID-only أساتذتي hub — 9 full-width section cards (not the courses catalog).
 * Protected by app/dashboard/layout.tsx (requirePaidStudentPage).
 */
export default function TeachersHubPage() {
  return (
    <div className="w-full" dir="rtl">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 sm:gap-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للوحة التحكم
        </Link>

        <header className="rounded-2xl border border-slate-200/80 bg-white px-6 py-7 text-center shadow-[0_10px_28px_-20px_rgba(15,23,42,0.18)] sm:px-10 sm:py-8">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <GraduationCap className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">أساتذتي</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500 sm:text-base">
            اختر القسم المناسب لمتابعة دروسك وملخصاتك وحصصك المباشرة ضمن الحساب الكامل.
          </p>
        </header>

        <section aria-label="أقسام أساتذتي" className="dashboard-nav-stack">
          {TEACHERS_SECTIONS.map((section) => (
            <TeachersSectionCard
              key={section.id}
              title={section.title}
              description={section.description}
              href={section.href}
              Icon={section.Icon}
              tone={section.tone}
              badges={[...section.badges]}
            />
          ))}
        </section>
      </div>
    </div>
  );
}
