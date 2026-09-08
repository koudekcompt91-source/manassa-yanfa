"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import {
  AdminActionButton,
  AdminBadge,
  AdminEmptyState,
  AdminSectionCard,
} from "@/components/admin/AdminUI";

/**
 * Organized admin shell for PAID sections that still need future content models.
 * No FREE APIs. No DB writes yet — UI slots for add/edit/delete/publish only.
 */
export default function PaidSectionScaffold({
  title,
  description,
  tone = "from-slate-600 to-slate-800",
  Icon,
  plannedFields = [],
  reuseNote = "",
  needsDatabase = true,
}) {
  return (
    <AdminShell title={title} subtitle="قسم ضمن إدارة المحتوى المدفوع (PAID فقط).">
      <div className="mb-4">
        <Link
          href="/admin/paid-content"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 no-underline hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى إدارة المحتوى المدفوع
        </Link>
      </div>

      <AdminSectionCard
        title={title}
        subtitle={description}
        action={
          Icon ? (
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white ${tone}`}
              aria-hidden
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
          ) : null
        }
      >
        <div className="mb-4 flex flex-wrap gap-2">
          <AdminBadge tone="warning">واجهة أولية</AdminBadge>
          <AdminBadge tone={needsDatabase ? "warning" : "brand"}>
            {needsDatabase ? "يحتاج قرار Model لاحقًا" : "يمكن الربط بدون Model جديد"}
          </AdminBadge>
        </div>

        {reuseNote ? <p className="mb-4 text-sm leading-7 text-slate-600">{reuseNote}</p> : null}

        <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "إضافة محتوى", hint: "قريبًا" },
            { label: "تعديل محتوى", hint: "قريبًا" },
            { label: "حذف محتوى", hint: "قريبًا" },
            { label: "نشر / إخفاء", hint: "قريبًا" },
          ].map((action) => (
            <div
              key={action.label}
              className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-center"
            >
              <p className="text-sm font-extrabold text-slate-800">{action.label}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{action.hint}</p>
            </div>
          ))}
        </div>

        {plannedFields.length ? (
          <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-extrabold text-slate-900">الحقول المتوقعة لاحقًا</p>
            <ul className="mt-2 list-disc space-y-1 pr-5 text-sm text-slate-600">
              {plannedFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <AdminEmptyState
          title="لا يوجد محتوى قابل للإدارة بعد"
          description="هذه الواجهة جاهزة هيكليًا. لن تُستخدم جداول FREE ولن تُنشأ Models في هذه المرحلة."
        />
      </AdminSectionCard>
    </AdminShell>
  );
}
