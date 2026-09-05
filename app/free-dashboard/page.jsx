"use client";

import { useEffect, useRef, useState } from "react";
import FreeCoursesSection from "@/components/student/free-dashboard/FreeCoursesSection";
import FreeNotesSection from "@/components/student/free-dashboard/FreeNotesSection";
import FreeAssignmentsSection from "@/components/student/free-dashboard/FreeAssignmentsSection";

/**
 * LOCKED structure (do not change order):
 * 1 دروسي → 2 ملخصاتي → 3 فروضي
 * API → render. Each section is independent; no cross-rendering.
 */
export default function FreeDashboardPage() {
  const [data, setData] = useState({ courses: [], notes: [], assignments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // React StrictMode re-invokes effects in dev; fetch exactly once.
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetch("/api/free/courses", { credentials: "include" })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        return { okHttp: r.ok, body };
      })
      .then(({ okHttp, body }) => {
        console.log("[free-dashboard] courses:", body);

        if (!okHttp || body?.ok === false) {
          setError(body?.message || "تعذّر تحميل المحتوى.");
          setData({ courses: [], notes: [], assignments: [] });
          return;
        }

        setError("");
        setData({
          courses: Array.isArray(body?.courses) ? body.courses : [],
          notes: Array.isArray(body?.notes) ? body.notes : [],
          assignments: Array.isArray(body?.assignments) ? body.assignments : [],
        });
      })
      .catch(() => {
        setError("تعذّر الاتصال بالخادم.");
        setData({ courses: [], notes: [], assignments: [] });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full" dir="rtl">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 sm:gap-12">
        <header className="rounded-2xl border border-slate-200/80 bg-white px-6 py-7 text-center shadow-[0_10px_28px_-20px_rgba(15,23,42,0.18)] sm:px-10 sm:py-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            مرحباً بك في الحساب المجاني
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500 sm:text-base">
            دروسك وملخصاتك وفروضك في مكان واحد.
          </p>
        </header>

        {/* 1. دروسي */}
        <FreeCoursesSection courses={data.courses} loading={loading} error={error} />

        {/* 2. ملخصاتي */}
        <FreeNotesSection notes={data.notes} loading={loading} />

        {/* 3. فروضي */}
        <FreeAssignmentsSection assignments={data.assignments} />
      </div>
    </div>
  );
}
