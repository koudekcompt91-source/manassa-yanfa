"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import TeachersLessonsPanel from "@/components/student/TeachersLessonsPanel";
import TeachersLivePanel from "@/components/student/TeachersLivePanel";
import TeachersAssessmentsPanel from "@/components/student/TeachersAssessmentsPanel";
import TeachersSummariesPanel from "@/components/student/TeachersSummariesPanel";
import TeachersAssignmentsPanel from "@/components/student/TeachersAssignmentsPanel";
import TeachersExamsPanel from "@/components/student/TeachersExamsPanel";
import TeachersLibraryPanel from "@/components/student/TeachersLibraryPanel";
import { getTeachersSection } from "@/lib/paid-teachers-sections";

/**
 * Fallback dynamic section page.
 * Static routes own lessons/live/summaries/assignments/exams/library/homework/electronic-exam.
 */
export default function TeachersSectionPage() {
  const params = useParams();
  const normalizedSection = Array.isArray(params?.section)
    ? String(params.section[0] || "")
    : String(params?.section || "");
  const section = getTeachersSection(normalizedSection);

  if (!section) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 py-10 text-center" dir="rtl">
        <p className="text-sm font-semibold text-red-700">القسم غير موجود.</p>
        <Link href="/dashboard/teachers" className="text-sm font-bold text-brand-700 underline">
          العودة إلى أساتذتي
        </Link>
      </div>
    );
  }

  const Icon = section.Icon;
  let body = (
    <section className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
      <p className="text-base font-extrabold text-slate-800">المحتوى قيد التجهيز</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
        هذا القسم جاهز للربط لاحقًا مع إدارة المحتوى المدفوع. سيظهر هنا محتوى أساتذتك الخاص بهذا القسم فقط.
      </p>
    </section>
  );

  if (section.id === "lessons") body = <TeachersLessonsPanel />;
  else if (section.id === "live") body = <TeachersLivePanel />;
  else if (section.id === "summaries") body = <TeachersSummariesPanel />;
  else if (section.id === "assignments") body = <TeachersAssignmentsPanel />;
  else if (section.id === "exams") body = <TeachersExamsPanel />;
  else if (section.id === "library") body = <TeachersLibraryPanel />;
  else if (section.id === "homework") {
    body = <TeachersAssessmentsPanel assessmentType="ASSIGNMENT" emptyTitle="لا توجد واجبات منزلية متاحة حاليًا." />;
  } else if (section.id === "electronic-exam") {
    body = <TeachersAssessmentsPanel assessmentType="QUIZ" emptyTitle="لا توجد اختبارات إلكترونية متاحة حاليًا." />;
  }

  return (
    <div className="w-full" dir="rtl">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 sm:gap-8">
        <Link
          href="/dashboard/teachers"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى أساتذتي
        </Link>

        <header className="rounded-2xl border border-slate-200/80 bg-white px-6 py-7 shadow-[0_10px_28px_-20px_rgba(15,23,42,0.18)] sm:px-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-right">
            <span
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-[0_10px_24px_-12px_rgba(37,99,235,0.4)] ${section.tone}`}
              aria-hidden
            >
              <Icon className="h-8 w-8" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{section.title}</h1>
              <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">{section.description}</p>
            </div>
          </div>
        </header>

        {body}
      </div>
    </div>
  );
}
