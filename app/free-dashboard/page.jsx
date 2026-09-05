"use client";

import { useEffect, useMemo, useState } from "react";
import FreeCoursesSection from "@/components/student/free-dashboard/FreeCoursesSection";
import FreeVideoSection from "@/components/student/free-dashboard/FreeVideoSection";
import FreePdfsSection from "@/components/student/free-dashboard/FreePdfsSection";
import FreeLockedSection from "@/components/student/free-dashboard/FreeLockedSection";

/**
 * LOCKED structure (do not change order):
 * 1 الدورات → 2 الفيديو → 3 المستندات → 4 الألعاب
 * API → UI → Render. No access/filter/transform logic.
 */
export default function FreeDashboardPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/free/courses", { credentials: "include" })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        return { okHttp: r.ok, data };
      })
      .then(({ okHttp, data }) => {
        if (cancelled) return;

        const list = Array.isArray(data?.courses) ? data.courses : [];
        console.log("[free-dashboard] courses:", data);

        if (!okHttp || data?.ok === false) {
          setError(data?.message || "تعذّر تحميل الدورات.");
          setCourses([]);
          setSelectedId("");
          return;
        }

        setError("");
        setCourses(list);
        setSelectedId((prev) => {
          if (prev && list.some((c) => (c.id || c.slug) === prev)) return prev;
          return list[0]?.id || list[0]?.slug || "";
        });
      })
      .catch(() => {
        if (!cancelled) {
          setError("تعذّر الاتصال بالخادم.");
          setCourses([]);
          setSelectedId("");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return courses.find((c) => (c.id || c.slug) === selectedId) || null;
  }, [courses, selectedId]);

  function selectCourse(course) {
    const id = course?.id || course?.slug || "";
    if (!id) return;
    setSelectedId(id);
    requestAnimationFrame(() => {
      document.getElementById("video")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
            اختر دورة لعرض الفيديو والمستندات المرتبطة بها.
          </p>
        </header>

        {/* 1. الدورات */}
        <FreeCoursesSection
          courses={courses}
          loading={loading}
          error={error}
          selectedId={selectedId}
          onSelect={selectCourse}
        />

        {/* 2. الفيديو */}
        <FreeVideoSection
          courseTitle={selected?.title || ""}
          videoUrl={selected?.videoUrl || ""}
        />

        {/* 3. المستندات */}
        <FreePdfsSection courseTitle={selected?.title || ""} pdfs={selected?.pdfs} />

        {/* 4. الألعاب */}
        <FreeLockedSection />
      </div>
    </div>
  );
}
