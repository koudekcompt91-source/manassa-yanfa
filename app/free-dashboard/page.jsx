"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, FileText, Gamepad2, Lock } from "lucide-react";
import { getDisplayLevelLabel } from "@/lib/student-level-codes";

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
        // Extra client guard: free dashboard only lists free courses.
        setCourses(list.filter((c) => (c.minSubscription || "FREE") === "FREE"));
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
    <div className="space-y-8">
      <header className="rounded-2xl border border-emerald-200/80 bg-gradient-to-l from-emerald-50 via-white to-sky-50 p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold text-emerald-700">مرحباً بك في الحساب المجاني</p>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          {userName ? `أهلاً ${userName}` : "لوحة التعلم المجاني"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          اطّلع على الدورات المجانية والمستندات المتاحة لمستواك. الألعاب قيد التطوير وستُفعَّل لاحقًا.
        </p>
      </header>

      <section id="courses" className="scroll-mt-28">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-extrabold text-slate-900">الدورات المجانية</h2>
        </div>
        {loading ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">جاري تحميل الدورات…</p>
        ) : !courses.length ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            لا توجد دورات مجانية متاحة لمستواك حاليًا.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <article
                key={course.id}
                className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                    مجاني
                  </span>
                  {course.level || course.academicLevel ? (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-700">
                      {getDisplayLevelLabel(course) || course.academicLevel}
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-3 text-base font-extrabold text-slate-900">{course.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 line-clamp-3">
                  {(course.description || "").trim() || "دورة مجانية لمستواك الدراسي."}
                </p>
                <Link
                  href={`/courses/${encodeURIComponent(course.slug || course.id)}`}
                  className="touch-button-primary mt-4 inline-flex w-full items-center justify-center px-4 text-sm font-extrabold"
                >
                  عرض الدورة
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="documents" className="scroll-mt-28">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-extrabold text-slate-900">المستندات (PDF)</h2>
        </div>
        {loading ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">جاري التحميل…</p>
        ) : !courses.length ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            لا توجد مستندات PDF مرتبطة بالدورات المجانية بعد.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {courses.map((course) => (
              <div
                key={`doc-${course.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-slate-900">{course.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">مستند تعليمي مرتبط بالدورة المجانية</p>
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

      <section id="games" className="scroll-mt-28">
        <div className="mb-4 flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-slate-400" />
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
