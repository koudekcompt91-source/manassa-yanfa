"use client";

import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { AdminBadge, AdminSectionCard } from "@/components/admin/AdminUI";
import { TEACHERS_SECTIONS } from "@/lib/paid-teachers-sections";

/**
 * Phase-1 PAID content admin hub — UI + navigation only.
 * Reuses existing /admin/courses for lessons, live sessions, and QUIZ assessments.
 * No FREE APIs / FreeContentType.
 */

/** Sections already managed inside the PAID courses admin UI. */
const EXISTING_ADMIN_HREF = {
  lessons: "/admin/courses",
  live: "/admin/courses",
  "electronic-exam": "/admin/courses",
};

function manageHref(sectionId) {
  return EXISTING_ADMIN_HREF[sectionId] || `/admin/paid-content/${sectionId}`;
}

function manageHint(sectionId) {
  if (sectionId === "lessons") return "عبر إدارة الدورات · الدروس";
  if (sectionId === "live") return "عبر إدارة الدورات · البث المباشر";
  if (sectionId === "electronic-exam") return "عبر إدارة الدورات · الاختبارات";
  return "قيد التجهيز";
}

export default function AdminPaidContentPage() {
  return (
    <AdminShell
      title="إدارة المحتوى المدفوع"
      subtitle="إدارة أقسام أساتذتي للحساب الكامل فقط — بنفس ترتيب لوحة الطالب."
    >
      <AdminSectionCard
        title="أقسام المحتوى المدفوع"
        subtitle="اختر قسمًا لإدارته. الأقسام المرتبطة بالدورات تفتح إدارة الدورات الحالية؛ الباقي جاهز للربط لاحقًا."
      >
        <div className="grid gap-4" dir="rtl">
          {TEACHERS_SECTIONS.map((section) => {
            const Icon = section.Icon;
            const href = manageHref(section.id);
            const linked = Boolean(EXISTING_ADMIN_HREF[section.id]);

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
                      <AdminBadge tone={linked ? "brand" : "warning"}>
                        {linked ? "مرتبط" : "لاحقًا"}
                      </AdminBadge>
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
