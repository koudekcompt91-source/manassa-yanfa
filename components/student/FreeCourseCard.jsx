"use client";

import Link from "next/link";
import { BarChart3, BookOpen, ClipboardList, FileText, Lock, Star } from "lucide-react";

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

const LOCKED_LABEL = "غير متاح في الحساب المجاني";

/**
 * Uniform full-width FREE catalog card.
 * Desktop: icon left · content right (RTL text). Mobile: stacked.
 */
export default function FreeCourseCard({
  title,
  description,
  icon = "book",
  tone = "blue",
  href,
  locked = false,
  showFree = true,
  showPdf = false,
  levelLabel = "",
  ctaLabel = "دخول القسم",
}) {
  const Icon = ICON_MAP[icon] || BookOpen;
  const gradient = TONE_MAP[tone] || TONE_MAP.blue;

  return (
    <article
      className={`group relative flex min-h-[9.5rem] overflow-hidden rounded-[1rem] border border-slate-200/90 bg-white p-5 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.22)] transition-all duration-300 sm:min-h-[10.5rem] sm:rounded-[1.125rem] sm:p-6 ${
        locked
          ? "opacity-[0.58]"
          : "hover:-translate-y-0.5 hover:border-brand-300/55 hover:shadow-[0_16px_36px_-18px_rgba(37,99,235,0.28)]"
      }`}
      title={locked ? LOCKED_LABEL : undefined}
      aria-disabled={locked || undefined}
    >
      <div
        dir="ltr"
        className="relative z-10 flex w-full flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-5"
      >
        {/* LEFT — large icon */}
        <div
          className={`relative flex h-20 w-20 shrink-0 items-center justify-center self-start rounded-[0.9rem] bg-gradient-to-br text-white shadow-[0_10px_24px_-12px_rgba(37,99,235,0.45)] sm:h-auto sm:min-h-[6.5rem] sm:w-[6.5rem] sm:self-stretch sm:rounded-[1rem] ${gradient}`}
        >
          <Icon className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={1.75} />
          {locked ? (
            <span className="absolute inset-0 flex items-center justify-center rounded-[0.9rem] bg-slate-900/55 sm:rounded-[1rem]">
              <Lock className="h-6 w-6 text-white" aria-hidden />
            </span>
          ) : null}
        </div>

        {/* RIGHT — typography hierarchy: title → description → badges → button */}
        <div dir="rtl" className="flex min-w-0 flex-1 flex-col text-right">
          <h3 className="text-xl font-extrabold leading-snug text-slate-900 sm:text-[1.35rem]">{title}</h3>

          <p className="mt-1.5 text-sm leading-7 text-slate-500 line-clamp-2">{description}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {locked ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold text-slate-500">
                <Lock className="h-3 w-3" />
                {LOCKED_LABEL}
              </span>
            ) : null}
            {showFree && !locked ? (
              <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800">
                FREE
              </span>
            ) : null}
            {showPdf ? (
              <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-extrabold text-red-700">
                PDF
              </span>
            ) : null}
            {levelLabel && !locked ? (
              <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-extrabold text-sky-800">
                {levelLabel}
              </span>
            ) : null}
          </div>

          <div className="mt-auto pt-4">
            {locked || !href ? (
              <button
                type="button"
                disabled
                title={LOCKED_LABEL}
                className="inline-flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-5 text-sm font-extrabold text-slate-400 sm:w-auto"
              >
                <Lock className="h-4 w-4" />
                {ctaLabel}
              </button>
            ) : (
              <Link
                href={href}
                className="touch-button-primary inline-flex h-11 w-full items-center justify-center px-5 text-sm font-extrabold sm:w-auto"
              >
                {ctaLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
