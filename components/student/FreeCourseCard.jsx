"use client";

import Link from "next/link";
import { BarChart3, BookOpen, ClipboardList, FileText, Star } from "lucide-react";

const ICON_MAP = {
  book: BookOpen,
  document: FileText,
  exam: ClipboardList,
  chart: BarChart3,
  star: Star,
};

const TONE_MAP = {
  blue: "from-brand-600 to-indigo-600",
  green: "from-emerald-500 to-teal-600",
  orange: "from-amber-500 to-orange-600",
  purple: "from-violet-600 to-indigo-700",
  sky: "from-sky-500 to-brand-600",
};

/**
 * Uniform FREE catalog card — no locked/disabled UI.
 * Desktop: icon left · content right. Mobile: stacked, full-width CTA.
 */
export default function FreeCourseCard({
  title,
  description,
  icon = "book",
  tone = "blue",
  href = "/courses",
  showFree = true,
  showPdf = false,
  levelLabel = "",
}) {
  const Icon = ICON_MAP[icon] || BookOpen;
  const gradient = TONE_MAP[tone] || TONE_MAP.blue;

  return (
    <article className="w-full rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300/50 hover:shadow-[0_16px_36px_-18px_rgba(37,99,235,0.25)] sm:p-6">
      <div dir="ltr" className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        {/* LEFT — icon */}
        <div
          className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-[0_10px_24px_-12px_rgba(37,99,235,0.4)] sm:h-[5.5rem] sm:w-[5.5rem] ${gradient}`}
        >
          <Icon className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={1.75} />
        </div>

        {/* RIGHT — content (RTL) */}
        <div dir="rtl" className="flex min-w-0 flex-1 flex-col text-right">
          <h3 className="text-xl font-extrabold leading-snug text-slate-900 sm:text-[1.35rem]">{title}</h3>
          <p className="mt-1.5 text-sm leading-7 text-slate-500 line-clamp-2">{description}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {showFree ? (
              <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800">
                FREE
              </span>
            ) : null}
            {showPdf ? (
              <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-extrabold text-red-700">
                PDF
              </span>
            ) : null}
            {levelLabel ? (
              <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-extrabold text-sky-800">
                {levelLabel}
              </span>
            ) : null}
          </div>

          <div className="mt-4">
            <Link
              href={href}
              className="touch-button-primary inline-flex h-11 w-full items-center justify-center px-5 text-sm font-extrabold sm:w-auto"
            >
              دخول القسم
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
