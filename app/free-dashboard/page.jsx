"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FreeCoursesSection from "@/components/student/free-dashboard/FreeCoursesSection";
import FreeLessonsSection from "@/components/student/free-dashboard/FreeLessonsSection";
import FreePdfsSection from "@/components/student/free-dashboard/FreePdfsSection";
import FreeExamsSection from "@/components/student/free-dashboard/FreeExamsSection";

const EMPTY = { courses: [], lessons: [], pdfs: [], exams: [] };

/**
 * LOCKED structure (do not change order):
 * 1 الدورات → 2 الدروس → 3 المستندات → 4 الاختبارات
 * API returns normalized entities; sections render them independently.
 */
export default function FreeDashboardPage() {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
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
          setData(EMPTY);
          return;
        }

        setError("");
        setData({
          courses: Array.isArray(body?.courses) ? body.courses : [],
          lessons: Array.isArray(body?.lessons) ? body.lessons : [],
          pdfs: Array.isArray(body?.pdfs) ? body.pdfs : [],
          exams: Array.isArray(body?.exams) ? body.exams : [],
        });
      })
      .catch(() => {
        setError("تعذّر الاتصال بالخادم.");
        setData(EMPTY);
      })
      .finally(() => setLoading(false));
  }, []);

  // Relational scoping only — each entity belongs to the active course.
  const activeLessons = useMemo(
    () => (data.lessons ?? []).filter((l) => selectedId && l?.courseId === selectedId),
    [data.lessons, selectedId]
  );
  const activePdfs = useMemo(
    () => (data.pdfs ?? []).filter((p) => selectedId && p?.courseId === selectedId),
    [data.pdfs, selectedId]
  );
  const activeExams = useMemo(
    () => (data.exams ?? []).filter((e) => selectedId && e?.courseId === selectedId),
    [data.exams, selectedId]
  );

  function selectCourse(id) {
    if (!id) return;
    setSelectedId(id);
    requestAnimationFrame(() => {
      document.getElementById("lessons")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div className="w-full" dir="rtl">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 sm:gap-12">
        <header className="rounded-2xl border border-slate-200/80 bg-white px-6 py-7 text-center shadow-[0_10px_28px_-20px_rgba(15,23,42,0.18)] sm:px-10 sm:py-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            مرحباً بك في الحساب المجاني
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500 sm:text-base">
            اختر دورة لعرض دروسها ومستنداتها.
          </p>
        </header>

        {/* 1. الدورات */}
        <FreeCoursesSection
          courses={data.courses}
          loading={loading}
          error={error}
          selectedId={selectedId}
          onSelect={selectCourse}
        />

        {/* 2. الدروس */}
        <FreeLessonsSection lessons={activeLessons} courseSelected={Boolean(selectedId)} />

        {/* 3. المستندات */}
        <FreePdfsSection pdfs={activePdfs} />

        {/* 4. الاختبارات */}
        <FreeExamsSection exams={activeExams} />
      </div>
    </div>
  );
}
