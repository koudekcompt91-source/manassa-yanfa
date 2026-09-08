"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, MonitorPlay } from "lucide-react";

/**
 * Student PAID assessments list filtered by QUIZ or ASSIGNMENT.
 * Uses enrollment-gated /api/courses/[slug]/assessments.
 */
export default function TeachersAssessmentsPanel({
  assessmentType = "QUIZ",
  emptyTitle = "لا توجد عناصر متاحة حاليًا.",
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const Icon = assessmentType === "ASSIGNMENT" ? ClipboardCheck : MonitorPlay;
  const tone =
    assessmentType === "ASSIGNMENT" ? "from-amber-500 to-orange-600" : "from-cyan-500 to-brand-600";

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
        setError(listData?.message || "تعذّر تحميل المحتوى.");
        setItems([]);
        return;
      }
      const progressData = progressRes.ok ? await progressRes.json().catch(() => ({})) : {};
      const enrolled = progressData?.ok && Array.isArray(progressData.courses) ? progressData.courses : [];
      const catalog = Array.isArray(listData.courses) ? listData.courses : [];
      const byKey = new Map();
      for (const c of [...catalog, ...enrolled]) {
        const key = String(c.slug || c.id || "").trim();
        if (key && !byKey.has(key)) byKey.set(key, c);
      }

      const rows = [];
      await Promise.all(
        Array.from(byKey.values()).map(async (course) => {
          const res = await fetch(`/api/courses/${encodeURIComponent(course.slug || course.id)}/assessments`, {
            credentials: "include",
            cache: "no-store",
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.ok) return;
          for (const row of Array.isArray(data.assessments) ? data.assessments : []) {
            if (row.type !== assessmentType) continue;
            rows.push({
              ...row,
              courseTitle: course.title,
              courseSlug: course.slug,
              href: `/packages/${encodeURIComponent(course.slug)}?tab=assessments`,
            });
          }
        })
      );
      rows.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
      setItems(rows);
    } catch {
      setError("حدث خطأ أثناء التحميل.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [assessmentType]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-500">جاري التحميل…</p>
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
        <p className="text-base font-extrabold text-slate-800">{emptyTitle}</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="flex w-full flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
        >
          <div className="flex min-w-0 items-start gap-3">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white ${tone}`}>
              <Icon className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-slate-900">{item.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{item.courseTitle}</p>
              {item.description ? (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{item.description}</p>
              ) : null}
              {assessmentType === "ASSIGNMENT" && item.fileName ? (
                <p className="mt-2 text-xs font-semibold text-slate-500">{item.fileName}</p>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {assessmentType === "ASSIGNMENT" && item.fileUrl ? (
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-bold text-brand-700 no-underline hover:bg-brand-50"
              >
                فتح ملف الواجب
              </a>
            ) : null}
            <Link
              href={item.href}
              className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white no-underline hover:bg-brand-700"
            >
              فتح
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}
