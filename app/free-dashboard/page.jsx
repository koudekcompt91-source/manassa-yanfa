"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, FileText, Gamepad2, Lock } from "lucide-react";
import { getDisplayLevelLabel } from "@/lib/student-level-codes";

function isRemoteCover(src) {
  const s = String(src || "").trim();
  return s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/");
}

function CourseCover({ title, coverImage }) {
  const src = String(coverImage || "").trim();
  if (isRemoteCover(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote CMS URLs not in next.config images
      <img src={src} alt="" className="h-44 w-full object-cover" loading="lazy" />
    );
  }
  const letter = (title || "د").charAt(0);
  return (
    <div className="relative flex h-44 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-brand-600/90 via-indigo-600/85 to-slate-800">
      <div className="absolute inset-0 opacity-30" aria-hidden>
        <div className="absolute -end-6 -top-6 h-28 w-28 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute -bottom-8 start-4 h-24 w-24 rounded-full bg-emerald-300/30 blur-2xl" />
      </div>
      <span className="relative text-5xl font-black text-white/95">{letter}</span>
    </div>
  );
}

function isFreeCourse(course) {
  const minSub = String(course?.minSubscription || "FREE").toUpperCase();
  const access = String(course?.accessType || "").toUpperCase();
  const priceType = String(course?.priceType || "").toLowerCase();
  return minSub === "FREE" || access === "FREE" || priceType === "free" || Number(course?.price || 0) <= 0;
}

export default function FreeDashboardPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/auth/me", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/courses", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([me, coursesRes]) => {
        if (cancelled) return;
        if (me?.user?.fullName) setUserName(me.user.fullName);
        const list = Array.isArray(coursesRes?.courses) ? coursesRes.courses : [];
        // FREE dashboard: only free / minSubscription FREE content
        setCourses(list.filter(isFreeCourse));
      })
      .catch(() => {
        if (!cancelled) setCourses([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-10">
      <header className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold text-brand-700">مرحباً بك في الحساب المجاني</p>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          {userName ? `أهلاً ${userName}` : "لوحة التعلم المجاني"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          اطّلع على الدورات المجانية والمستندات المتاحة لمستواك. الألعاب قيد التطوير وستُفعَّل لاحقًا.
        </p>
      </header>

      <section id="courses" className="scroll-mt-28 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">الدورات المجانية</h2>
              <p className="text-xs font-semibold text-slate-500">
                {loading ? "جاري التحميل…" : `${courses.length} دورة متاحة`}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-2xl border border-slate-200/80 bg-slate-100/80"
              />
            ))}
          </div>
        ) : !courses.length ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-12 text-center text-sm text-slate-500">
            لا توجد دورات مجانية متاحة لمستواك حاليًا.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => {
              const href = `/courses/${encodeURIComponent(course.slug || course.id)}`;
              const levelLabel = getDisplayLevelLabel(course) || course.academicLevel;
              return (
                <article
                  key={course.id}
                  className="interactive-card group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative">
                    <CourseCover title={course.title} coverImage={course.coverImage} />
                    <div className="absolute start-3 top-3 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm">
                        FREE
                      </span>
                      {levelLabel ? (
                        <span className="inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold text-slate-700 shadow-sm backdrop-blur-sm">
                          {levelLabel}
                        </span>
                      ) : null}
                    </div>
                    <span className="absolute bottom-3 end-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/95 text-brand-700 shadow-sm backdrop-blur-sm">
                      <BookOpen className="h-5 w-5" />
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-extrabold leading-snug text-slate-900 group-hover:text-brand-800">
                      {course.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 line-clamp-3">
                      {(course.description || "").trim() || "دورة مجانية لمستواك الدراسي."}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800">مجانية</span>
                      {typeof course.lessonsCount === "number" ? (
                        <span>{course.lessonsCount} درس</span>
                      ) : null}
                    </div>
                    <Link
                      href={href}
                      className="touch-button-primary mt-5 inline-flex w-full items-center justify-center gap-2 px-4 text-sm font-extrabold"
                    >
                      الدخول إلى الدورة
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section id="documents" className="scroll-mt-28 space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <FileText className="h-5 w-5" />
          </span>
          <h2 className="text-lg font-extrabold text-slate-900">المستندات (PDF)</h2>
        </div>
        {loading ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">جاري التحميل…</p>
        ) : !courses.length ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-10 text-center text-sm text-slate-500">
            لا توجد مستندات PDF مرتبطة بالدورات المجانية بعد.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {courses.map((course) => (
              <div
                key={`doc-${course.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-slate-900">{course.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">مستند تعليمي مرتبط بالدورة المجانية</p>
                  </div>
                </div>
                <Link
                  href={`/courses/${encodeURIComponent(course.slug || course.id)}`}
                  className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  فتح
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="games" className="scroll-mt-28 space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <Gamepad2 className="h-5 w-5" />
          </span>
          <h2 className="text-lg font-extrabold text-slate-900">الألعاب التعليمية</h2>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-100/80 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
            <Lock className="h-6 w-6 text-slate-400" />
          </div>
          <p className="mt-4 text-base font-extrabold text-slate-800">قريبًا — الألعاب مقفلة حاليًا</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            قسم الألعاب التعليمية قيد التطوير. سيظهر هنا لاحقًا دون التأثير على باقي المنصة.
          </p>
          <button
            type="button"
            disabled
            className="mt-5 inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-slate-300 px-5 py-2.5 text-sm font-bold text-slate-500"
          >
            <Lock className="h-4 w-4" />
            غير متاح الآن
          </button>
        </div>
      </section>
    </div>
  );
}
