"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import TeachersLibraryPanel from "@/components/student/TeachersLibraryPanel";
import { getTeachersSection } from "@/lib/paid-teachers-sections";

export default function TeachersLibraryPage() {
  const section = getTeachersSection("library");
  const Icon = section.Icon;

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

        <TeachersLibraryPanel />
      </div>
    </div>
  );
}
