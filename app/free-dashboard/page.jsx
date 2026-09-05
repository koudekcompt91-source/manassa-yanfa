"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, FileText, Gamepad2, Sparkles } from "lucide-react";
import FreeCourseCard from "@/components/student/FreeCourseCard";

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
        setCourses(list);
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

  const { freeCourses, lockedCourses } = useMemo(() => {
    const free = [];
    const locked = [];
    for (const c of courses) {
      if (isFreeCourse(c)) free.push(c);
      else locked.push(c);
    }
    return { freeCourses: free, lockedCourses: locked };
  }, [courses]);

  // Always surface a locked “paid content” row (games) so locked UX is visible even when API returns only FREE courses.
  const lockedPlaceholders = [
    {
      id: "locked-games",
      title: "الألعاب التعليمية",
      description: "محتوى مدفوع — الألعاب التفاعلية متاحة في الحساب الكامل.",
      lessonsCount: undefined,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-10">
      <header className="rounded-[1.125rem] border border-slate-200/90 bg-gradient-to-l from-white via-white to-brand-50/40 p-6 shadow-[0_14px_36px_-24px_rgba(15,23,42,0.3)] sm:p-8">
        <div className="flex flex-wrap items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-brand-700">مرحباً بك في الحساب المجاني</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {userName ? `أهلاً ${userName}` : "لوحة التعلم المجاني"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              اطّلع على الدورات المجانية والمستندات المتاحة لمستواك. الألعاب قيد التطوير وستُفعَّل لاحقًا.
            </p>
          </div>
        </div>
      </header>

      <section id="courses" className="scroll-mt-28 space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <BookOpen className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">الدورات المتاحة</h2>
            <p className="text-xs font-semibold text-slate-500">
              {loading ? "جاري التحميل…" : `${freeCourses.length} دورة مجانية`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-[1.125rem] border border-slate-200/80 bg-slate-100/80"
              />
            ))}
          </div>
        ) : !freeCourses.length ? (
          <p className="rounded-[1.125rem] border border-dashed border-slate-200 bg-slate-50/60 py-12 text-center text-sm text-slate-500">
            لا توجد دورات مجانية متاحة لمستواك حاليًا.
          </p>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {freeCourses.map((course, index) => (
              <FreeCourseCard
                key={course.id}
                course={course}
                iconVariant={index % 3 === 1 ? "grad" : "book"}
                badgeExtra={["مجانية"]}
              />
            ))}
          </div>
        )}
      </section>

      <section id="documents" className="scroll-mt-28 space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <FileText className="h-[1.125rem] w-[1.125rem]" />
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">المحتوى المجاني</h2>
            <p className="text-xs font-semibold text-slate-500">مستندات PDF مرتبطة بالدورات</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-32 animate-pulse rounded-[1.125rem] border border-slate-200/80 bg-slate-100/80" />
          </div>
        ) : !freeCourses.length ? (
          <p className="rounded-[1.125rem] border border-dashed border-slate-200 bg-slate-50/60 py-10 text-center text-sm text-slate-500">
            لا توجد مستندات PDF مرتبطة بالدورات المجانية بعد.
          </p>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {freeCourses.map((course) => (
              <FreeCourseCard
                key={`doc-${course.id}`}
                course={{
                  ...course,
                  description: "مستند تعليمي مرتبط بالدورة المجانية",
                }}
                iconVariant="file"
                badgeExtra={["PDF", "مجانية"]}
              />
            ))}
          </div>
        )}
      </section>

      <section id="games" className="scroll-mt-28 space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Gamepad2 className="h-[1.125rem] w-[1.125rem]" />
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">محتوى مقفل</h2>
            <p className="text-xs font-semibold text-slate-500">يظهر معطلًا — محتوى مدفوع</p>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-5">
          {lockedCourses.map((course) => (
            <FreeCourseCard key={`locked-${course.id}`} course={course} locked iconVariant="grad" badgeExtra={["مدفوع"]} />
          ))}
          {lockedPlaceholders.map((item) => (
            <FreeCourseCard key={item.id} course={item} locked iconVariant="book" badgeExtra={["قريبًا"]} />
          ))}
        </div>
      </section>
    </div>
  );
}
