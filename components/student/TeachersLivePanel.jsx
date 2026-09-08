"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Radio } from "lucide-react";

/**
 * Student PAID live sessions list — published + accessible (canJoin / !locked).
 */
export default function TeachersLivePanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const listRes = await fetch("/api/courses", { credentials: "include", cache: "no-store" });
      const listData = await listRes.json().catch(() => ({}));
      if (!listRes.ok || !listData?.ok) {
        setError(listData?.message || "تعذّر تحميل البثوث.");
        setItems([]);
        return;
      }
      const courses = Array.isArray(listData.courses) ? listData.courses : [];
      const rows = [];
      await Promise.all(
        courses.map(async (course) => {
          const res = await fetch(`/api/courses/${encodeURIComponent(course.slug || course.id)}/live-sessions`, {
            credentials: "include",
            cache: "no-store",
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.ok) return;
          for (const session of Array.isArray(data.liveSessions) ? data.liveSessions : []) {
            if (session.locked) continue;
            rows.push({
              ...session,
              courseTitle: course.title,
              courseSlug: course.slug,
              href: `/packages/${encodeURIComponent(course.slug)}?tab=live`,
            });
          }
        })
      );
      rows.sort((a, b) => String(a.startsAt || "").localeCompare(String(b.startsAt || "")));
      setItems(rows);
    } catch {
      setError("حدث خطأ أثناء تحميل البثوث.");
      setItems([]);
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
        <p className="text-sm font-semibold text-slate-500">جاري تحميل البثوث…</p>
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
        <p className="text-base font-extrabold text-slate-800">لا توجد بثوث متاحة حاليًا.</p>
      </section>
    );
  }

  return (
    <section className="space-y-3" aria-label="بثوث مباشرة">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="group flex w-full flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 no-underline shadow-sm transition hover:border-brand-200 sm:flex-row sm:items-center sm:justify-between sm:p-5"
        >
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white">
              <Radio className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-slate-900">{item.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{item.courseTitle}</p>
              <p className="mt-2 text-xs font-semibold text-slate-500">
                {item.startsAt ? new Date(item.startsAt).toLocaleString("ar-DZ") : ""} · {item.durationMin || "—"} د
              </p>
            </div>
          </div>
          <span className="inline-flex rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white group-hover:bg-brand-700">
            فتح البث
          </span>
        </Link>
      ))}
    </section>
  );
}
