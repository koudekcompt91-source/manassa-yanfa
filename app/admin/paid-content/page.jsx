"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { AdminBadge, AdminSectionCard } from "@/components/admin/AdminUI";
import { TEACHERS_SECTIONS } from "@/lib/paid-teachers-sections";

/**
 * Central PAID content admin hub — 9 sections in أساتذتي order.
 */

const ACTIVE_ADMIN_HREF = {
  lessons: "/admin/paid-content/lessons",
  live: "/admin/paid-content/live",
  summaries: "/admin/paid-content/summaries",
  homework: "/admin/paid-content/homework",
  assignments: "/admin/paid-content/assignments",
  "electronic-exam": "/admin/paid-content/electronic-exam",
};

function manageHref(sectionId) {
  return ACTIVE_ADMIN_HREF[sectionId] || `/admin/paid-content/${sectionId}`;
}

function manageHint(sectionId) {
  if (sectionId === "lessons") return "Course + Lesson · إدارة فعلية";
  if (sectionId === "live") return "LiveSession · إدارة فعلية";
  if (sectionId === "summaries") return "PaidFileContent.SUMMARY · إدارة فعلية";
  if (sectionId === "homework") return "Assessment.ASSIGNMENT · إدارة فعلية";
  if (sectionId === "assignments") return "PaidFileContent.ASSIGNMENT · إدارة فعلية";
  if (sectionId === "electronic-exam") return "Assessment.QUIZ · إدارة فعلية";
  return "واجهة أولية · بدون Database change";
}

export default function AdminPaidContentPage() {
  const [counts, setCounts] = useState({});

  const loadCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/courses", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) return;
      const courses = Array.isArray(data.courses) ? data.courses : [];

      let lessons = 0;
      let live = 0;
      let homework = 0;
      let quiz = 0;
      let summaries = 0;
      let assignments = 0;

      const [summariesRes, assignmentsRes] = await Promise.all([
        fetch("/api/admin/paid-content?contentType=SUMMARY", { credentials: "include" }),
        fetch("/api/admin/paid-content?contentType=ASSIGNMENT", { credentials: "include" }),
      ]);
      const summariesData = await summariesRes.json().catch(() => ({}));
      const assignmentsData = await assignmentsRes.json().catch(() => ({}));
      if (summariesRes.ok && summariesData?.ok && Array.isArray(summariesData.items)) {
        summaries = summariesData.items.length;
      }
      if (assignmentsRes.ok && assignmentsData?.ok && Array.isArray(assignmentsData.items)) {
        assignments = assignmentsData.items.length;
      }

      await Promise.all(
        courses.map(async (course) => {
          const [lr, sr, ar] = await Promise.all([
            fetch(`/api/admin/courses/${course.id}/lessons`, { credentials: "include" }),
            fetch(`/api/admin/courses/${course.id}/live-sessions`, { credentials: "include" }),
            fetch(`/api/admin/courses/${course.id}/assessments`, { credentials: "include" }),
          ]);
          const ld = await lr.json().catch(() => ({}));
          const sd = await sr.json().catch(() => ({}));
          const ad = await ar.json().catch(() => ({}));
          if (lr.ok && ld?.ok) lessons += Array.isArray(ld.lessons) ? ld.lessons.length : 0;
          if (sr.ok && sd?.ok) live += Array.isArray(sd.liveSessions) ? sd.liveSessions.length : 0;
          if (ar.ok && ad?.ok && Array.isArray(ad.assessments)) {
            homework += ad.assessments.filter((x) => x.type === "ASSIGNMENT").length;
            quiz += ad.assessments.filter((x) => x.type === "QUIZ").length;
          }
        })
      );

      setCounts({
        lessons,
        live,
        summaries,
        homework,
        assignments,
        "electronic-exam": quiz,
      });
    } catch {
      /* ignore count errors */
    }
  }, []);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  return (
    <AdminShell
      title="إدارة المحتوى المدفوع"
      subtitle="مركز إدارة أقسام أساتذتي للحساب الكامل فقط — بنفس ترتيب لوحة الطالب."
    >
      <AdminSectionCard
        title="أقسام المحتوى المدفوع"
        subtitle="الأقسام ذات البنية الجاهزة قابلة للإدارة فورًا. الباقي واجهات أولية بانتظار قرار الـ Model."
      >
        <div className="grid gap-4" dir="rtl">
          {TEACHERS_SECTIONS.map((section) => {
            const Icon = section.Icon;
            const href = manageHref(section.id);
            const active = Boolean(ACTIVE_ADMIN_HREF[section.id]);
            const count = counts[section.id];

            return (
              <article
                key={section.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm ${section.tone}`}
                    aria-hidden
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900 sm:text-lg">{section.title}</h3>
                      <AdminBadge tone={active ? "brand" : "warning"}>{active ? "يعمل" : "أولي"}</AdminBadge>
                      {typeof count === "number" ? (
                        <AdminBadge tone="slate">{count} عنصر</AdminBadge>
                      ) : null}
                    </div>
                    <p className="text-sm leading-7 text-slate-600">{section.description}</p>
                    <p className="text-xs font-semibold text-slate-500">{manageHint(section.id)}</p>
                  </div>
                </div>

                <Link
                  href={href}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white no-underline transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  إدارة القسم
                </Link>
              </article>
            );
          })}
        </div>
      </AdminSectionCard>
    </AdminShell>
  );
}
