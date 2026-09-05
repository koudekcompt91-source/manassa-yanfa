"use client";

import { useEffect, useState } from "react";
import FreeCourseCard from "@/components/student/FreeCourseCard";

/**
 * FREE course catalog — fixed order (do not reorder):
 * 1 دروسي · 2 ملخصاتي · 3 فروضي · 4 اختباراتي · 5 الدورات
 */
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
    locked: false,
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
    locked: false,
  },
  {
    id: "assignments",
    title: "فروضي",
    description: "الواجبات والتمارين التطبيقية لمتابعة مستواك خطوة بخطوة.",
    icon: "chart",
    tone: "orange",
    href: null,
    showFree: false,
    showPdf: false,
    locked: true,
  },
  {
    id: "quizzes",
    title: "اختباراتي",
    description: "اختبارات وتمارين تقييمية لقياس فهمك وتقدمك الدراسي.",
    icon: "exam",
    tone: "purple",
    href: null,
    showFree: false,
    showPdf: false,
    locked: true,
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
    locked: false,
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
    <div className="-mx-4 min-h-[70vh] bg-[#f7f9fc] px-4 py-3 sm:-mx-6 sm:px-6 sm:py-5">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 rounded-[1.125rem] border border-slate-200/80 bg-white px-6 py-7 text-center shadow-[0_10px_28px_-20px_rgba(15,23,42,0.22)] sm:mb-10 sm:px-10 sm:py-9">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            مرحباً بك في الحساب المجاني
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500 sm:text-base">
            ابدأ من الأقسام المتاحة أدناه وتابع محتواك التعليمي المجاني بسهولة.
          </p>
        </header>

        <section aria-label="كتالوج الأقسام المجانية" className="flex flex-col gap-5 sm:gap-6">
          {FREE_CATALOG.map((item) => (
            <div key={item.id} id={item.id}>
              <FreeCourseCard
                title={item.title}
                description={item.description}
                icon={item.icon}
                tone={item.tone}
                href={item.locked ? null : item.href}
                locked={item.locked}
                showFree={item.showFree}
                showPdf={item.showPdf}
                levelLabel={!item.locked && levelLabel ? levelLabel : ""}
                ctaLabel="دخول القسم"
              />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
