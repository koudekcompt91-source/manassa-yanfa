"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, PlayCircle } from "lucide-react";
import { getDisplayLevelLabel } from "@/lib/student-level-codes";

const TONES = [
  "from-brand-600 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-600 to-indigo-700",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-brand-600",
];

function toneAt(i) {
  return TONES[i % TONES.length];
}

export default function FreeDashboardPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/free/courses", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (!data?.ok) {
          setError(data?.message || "تعذّر تحميل الدورات.");
          setCourses([]);
          return;
        }
        setCourses(Array.isArray(data.courses) ? data.courses : []);
      })
      .catch(() => {
        if (!cancelled) setError("تعذّر الاتصال بالخادم.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 rounded-2xl border border-slate-200/80 bg-white px-6 py-7 text-center shadow-[0_10px_28px_-20px_rgba(15,23,42,0.18)] sm:px-10 sm:py-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            مرحباً بك في الحساب المجاني
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500 sm:text-base">
            اختر دورة وابدأ المشاهدة مباشرة — نظام تعلم مجاني منفصل تمامًا.
          </p>
        </header>

        <section aria-label="قائمة الدورات المجانية">
          <div className="mb-5 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <BookOpen className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">الدورات</h2>
          </div>

          {loading ? (
            <div className="flex flex-col gap-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
              {error}
            </p>
          ) : !courses.length ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center text-sm text-slate-500">
              لا توجد دورات مجانية منشورة بعد.
            </p>
          ) : (
            <div className="flex flex-col gap-5 sm:gap-6">
              {courses.map((course, index) => {
                const level = getDisplayLevelLabel(course) || course.academicLevel || "";
                return (
                  <article
                    key={course.id}
                    className="w-full rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 hover:border-brand-300/50 hover:shadow-md sm:p-6"
                  >
                    <div dir="ltr" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                      <div
                        className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white sm:h-[5.5rem] sm:w-[5.5rem] ${toneAt(index)}`}
                      >
                        <PlayCircle className="h-9 w-9" strokeWidth={1.75} />
                      </div>
                      <div dir="rtl" className="min-w-0 flex-1 text-right">
                        <h3 className="text-xl font-extrabold text-slate-900 sm:text-[1.35rem]">{course.title}</h3>
                        <p className="mt-1.5 text-sm leading-7 text-slate-500 line-clamp-2">
                          {(course.description || "").trim() || "دورة مجانية — اضغط للمشاهدة."}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800">
                            FREE
                          </span>
                          {level ? (
                            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-extrabold text-sky-800">
                              {level}
                            </span>
                          ) : null}
                          {course.hasVideo ? (
                            <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-extrabold text-violet-800">
                              فيديو
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-4">
                          <Link
                            href={`/free-dashboard/courses/${encodeURIComponent(course.id)}`}
                            className="touch-button-primary inline-flex h-11 w-full items-center justify-center px-5 text-sm font-extrabold sm:w-auto"
                          >
                            دخول الدورة
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
