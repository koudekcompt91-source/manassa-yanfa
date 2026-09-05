"use client";

import Link from "next/link";
import { BookOpen, FileText, GraduationCap, Lock } from "lucide-react";
import { getDisplayLevelLabel } from "@/lib/student-level-codes";

const ICON_TONES = [
  "from-brand-600 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-600 to-indigo-700",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-brand-600",
];

function toneForId(id) {
  const s = String(id || "");
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) hash = (hash + s.charCodeAt(i) * (i + 1)) % ICON_TONES.length;
  return ICON_TONES[hash] || ICON_TONES[0];
}

function SubjectIcon({ variant = "book", className = "h-8 w-8" }) {
  if (variant === "file") return <FileText className={className} strokeWidth={1.75} />;
  if (variant === "grad") return <GraduationCap className={className} strokeWidth={1.75} />;
  return <BookOpen className={className} strokeWidth={1.75} />;
}

/**
 * Full-width SaaS-style course row for the FREE student dashboard only.
 * locked=true → faded + lock overlay + tooltip "محتوى مدفوع" (no navigation).
 */
export default function FreeCourseCard({
  course,
  locked = false,
  iconVariant = "book",
  badgeExtra = [],
  href,
}) {
  const title = course?.title || "دورة";
  const description =
    (course?.description || "").trim() ||
    (locked ? "محتوى مدفوع — متاح في الحساب الكامل." : "دورة مجانية لمستواك الدراسي.");
  const levelLabel = getDisplayLevelLabel(course) || course?.academicLevel || "";
  const tone = toneForId(course?.id || title);
  const detailHref = href || `/courses/${encodeURIComponent(course?.slug || course?.id || "")}`;

  const chips = [
    locked ? "مدفوع" : "FREE",
    ...badgeExtra,
    levelLabel || null,
    typeof course?.lessonsCount === "number" ? `${course.lessonsCount} درس` : null,
  ].filter(Boolean);

  const cardInner = (
    <div dir="ltr" className="relative z-10 flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
      {/* Visual LEFT: gradient subject icon */}
      <div
        className={`relative flex h-20 w-20 shrink-0 items-center justify-center rounded-[1rem] bg-gradient-to-br text-white shadow-[0_12px_28px_-12px_rgba(37,99,235,0.45)] sm:h-24 sm:w-24 sm:rounded-[1.125rem] ${tone}`}
      >
        <SubjectIcon variant={iconVariant} className="h-9 w-9 sm:h-10 sm:w-10" />
        {locked ? (
          <span className="absolute inset-0 flex items-center justify-center rounded-[1rem] bg-slate-900/45 sm:rounded-[1.125rem]">
            <Lock className="h-6 w-6 text-white" />
          </span>
        ) : null}
      </div>

      {/* Visual RIGHT: RTL copy + CTA */}
      <div dir="rtl" className="min-w-0 flex-1 text-right">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-extrabold leading-snug text-slate-900 sm:text-xl">{title}</h3>
            <p className="mt-1.5 text-sm leading-7 text-slate-600 line-clamp-2 sm:text-[0.95rem]">{description}</p>
          </div>
          {locked ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-extrabold text-amber-800"
              title="محتوى مدفوع"
            >
              <Lock className="h-3.5 w-3.5" />
              محتوى مدفوع
            </span>
          ) : (
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800">
              FREE
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <span
              key={`${title}-${chip}`}
              className="inline-flex rounded-full border border-slate-200/90 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600"
            >
              {chip}
            </span>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {locked ? (
            <button
              type="button"
              disabled
              title="محتوى مدفوع"
              className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-5 text-sm font-extrabold text-slate-400"
            >
              <Lock className="h-4 w-4" />
              الدخول إلى الدورة
            </button>
          ) : (
            <Link
              href={detailHref}
              className="touch-button-primary inline-flex h-11 items-center justify-center px-5 text-sm font-extrabold"
            >
              الدخول إلى الدورة
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <article
      className={`group relative overflow-hidden rounded-[1.125rem] border border-slate-200/90 bg-white p-4 shadow-[0_14px_36px_-24px_rgba(15,23,42,0.35)] transition-all duration-300 sm:p-5 ${
        locked
          ? "opacity-70"
          : "hover:-translate-y-1 hover:border-brand-300/70 hover:shadow-[0_22px_48px_-22px_rgba(37,99,235,0.35)]"
      }`}
      title={locked ? "محتوى مدفوع" : undefined}
      aria-disabled={locked || undefined}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-brand-400/50 to-transparent opacity-70"
        aria-hidden
      />
      {cardInner}
      {locked ? (
        <div className="pointer-events-none absolute inset-0 rounded-[1.125rem] bg-slate-50/40" aria-hidden />
      ) : null}
    </article>
  );
}
