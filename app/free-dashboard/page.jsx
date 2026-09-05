"use client";

import { useEffect, useState } from "react";
import FreeCourseCard from "@/components/student/FreeCourseCard";

/** Exact order — do not reorder. All sections unlocked in UI. */
const FREE_CATALOG = [
  {
    id: "lessons",
    title: "دروسي",
    description: "تابع دروسك المجانية المسجّلة وابدأ التعلم حسب مستواك الدراسي.",
    icon: "book",
    tone: "blue",
    href: "/courses",
    showFree: true,
    showPdf: false,
  },
  {
    id: "summaries",
    title: "ملخصاتي",
    description: "ملخصات PDF مختصرة تساعدك على المراجعة السريعة للمواضيع الأساسية.",
    icon: "document",
    tone: "green",
    href: "/free-dashboard#summaries",
    showFree: true,
    showPdf: true,
  },
  {
    id: "assignments",
    title: "فروضي",
    description: "الواجبات والتمارين التطبيقية لمتابعة مستواك خطوة بخطوة.",
    icon: "chart",
    tone: "orange",
    href: "/free-dashboard#assignments",
    showFree: true,
    showPdf: false,
  },
  {
    id: "quizzes",
    title: "اختباراتي",
    description: "اختبارات وتمارين تقييمية لقياس فهمك وتقدمك الدراسي.",
    icon: "exam",
    tone: "purple",
    href: "/free-dashboard#quizzes",
    showFree: true,
    showPdf: false,
  },
  {
    id: "courses",
    title: "الدورات",
    description: "تصفّح الدورات المجانية المتاحة لمستواك وادخل إلى محتوى الدورة مباشرة.",
    icon: "star",
    tone: "sky",
    href: "/courses",
    showFree: true,
    showPdf: false,
  },
];

export default function FreeDashboardPage() {
  const [levelLabel, setLevelLabel] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const level = data?.user?.academicLevel || data?.user?.level || "";
        setLevelLabel(level && level !== "unknown" ? String(level) : "");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="-mx-4 min-h-[70vh] bg-[#f7f9fc] px-4 py-4 sm:-mx-6 sm:px-6 sm:py-6">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 rounded-2xl border border-slate-200/80 bg-white px-6 py-7 text-center shadow-[0_10px_28px_-20px_rgba(15,23,42,0.18)] sm:mb-8 sm:px-10 sm:py-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            مرحباً بك في الحساب المجاني
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500 sm:text-base">
            ابدأ من الأقسام المتاحة أدناه وتابع محتواك التعليمي المجاني بسهولة.
          </p>
        </header>

        <section aria-label="كتالوج الأقسام" className="flex w-full flex-col gap-5 sm:gap-6">
          {FREE_CATALOG.map((item) => (
            <div key={item.id} id={item.id} className="w-full">
              <FreeCourseCard
                title={item.title}
                description={item.description}
                icon={item.icon}
                tone={item.tone}
                href={item.href}
                showFree={item.showFree}
                showPdf={item.showPdf}
                levelLabel={levelLabel}
              />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
