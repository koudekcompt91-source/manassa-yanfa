"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { getDisplayLevelLabel } from "@/lib/student-level-codes";

/**
 * Student PAID "دروسي" — accessible published lessons only.
 * Uses existing /api/courses + /api/courses/[slug] (+ enrolled list from progress).
 * Opens the existing package lesson player route.
 */
export default function TeachersLessonsPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [listRes, progressRes] = await Promise.all([
        fetch("/api/courses", { credentials: "include", cache: "no-store" }),
        fetch("/api/progress/dashboard", { credentials: "include", cache: "no-store" }),
      ]);

      const listData = await listRes.json().catch(() => ({}));
      if (!listRes.ok || !listData?.ok) {
        setItems([]);
        setError(listData?.message || "تعذّر تحميل الدروس.");
        return;
      }

      const progressData = progressRes.ok ? await progressRes.json().catch(() => ({})) : {};
      const enrolledCourses =
        progressData?.ok && Array.isArray(progressData.courses) ? progressData.courses : [];
      const catalogCourses = Array.isArray(listData.courses) ? listData.courses : [];

      const byKey = new Map();
      for (const course of [...catalogCourses, ...enrolledCourses]) {
        const key = String(course.slug || course.id || "").trim();
        if (!key) continue;
        if (!byKey.has(key)) byKey.set(key, course);
      }

      const courseRefs = Array.from(byKey.values());
      const details = await Promise.all(
        courseRefs.map(async (course) => {
          const ref = course.slug || course.id;
          const res = await fetch(`/api/courses/${encodeURIComponent(ref)}`, {
            credentials: "include",
            cache: "no-store",
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.ok) return null;
          return data;
        })
      );

      const rows = [];
      for (const detail of details) {
        if (!detail?.course) continue;
        const course = detail.course;
        const lessons = Array.isArray(detail.lessons) ? detail.lessons : [];
        for (const lesson of lessons) {
          // Respect server access: enrollment / accessType / isFreePreview → locked
          if (lesson?.locked) continue;
          rows.push({
            id: lesson.id,
            title: lesson.title,
            description: lesson.description || "",
            order: lesson.order,
            courseTitle: course.title,
            courseSlug: course.slug,
            coverImage: course.coverImage || course.thumbnailUrl || "",
            levelLabel: getDisplayLevelLabel(course),
            subject: course.subject || "",
            href: `/packages/${encodeURIComponent(course.slug)}/lesson/${encodeURIComponent(lesson.id)}`,
          });
        }
      }

      rows.sort(
        (a, b) =>
          String(a.courseTitle).localeCompare(String(b.courseTitle), "ar") ||
          (a.order || 0) - (b.order || 0)
      );
      setItems(rows);
    } catch {
      setItems([]);
      setError("حدث خطأ أثناء تحميل الدروس.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-500">جاري تحميل دروسك…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-100 bg-white px-5 py-10 text-center shadow-sm">
        <p className="text-sm font-semibold text-red-700">{error}</p>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
        <p className="text-base font-extrabold text-slate-800">لا توجد دروس متاحة حاليًا.</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
          ستظهر هنا الدروس المنشورة من الدورات المدفوعة التي لديك صلاحية الوصول إليها.
        </p>
        <Link href="/packages" className="mt-4 inline-block text-sm font-bold text-brand-700 underline">
          تصفح الدورات
        </Link>
      </section>
    );
  }

  return (
    <section aria-label="دروسي" className="space-y-3">
      {items.map((item) => (
        <Link
          key={`${item.courseSlug}-${item.id}`}
          href={item.href}
          className="group flex w-full flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 no-underline shadow-[0_10px_28px_-22px_rgba(15,23,42,0.2)] transition hover:border-brand-200 hover:shadow-[0_14px_32px_-20px_rgba(37,99,235,0.28)] sm:flex-row sm:items-center sm:justify-between sm:p-5"
        >
          <div className="flex min-w-0 items-start gap-3">
            {item.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.coverImage}
                alt=""
                className="h-14 w-14 shrink-0 rounded-2xl object-cover"
              />
            ) : (
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white">
                <PlayCircle className="h-7 w-7" strokeWidth={1.75} />
              </span>
            )}
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">{item.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{item.courseTitle}</p>
              {item.description ? (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{item.description}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {item.levelLabel ? (
                  <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-extrabold text-sky-800">
                    {item.levelLabel}
                  </span>
                ) : null}
                {item.subject ? (
                  <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-extrabold text-violet-800">
                    {item.subject}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white group-hover:bg-brand-700">
            فتح الدرس
          </span>
        </Link>
      ))}
    </section>
  );
}
