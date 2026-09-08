"use client";

import PaidSectionScaffold from "@/components/admin/paid-content/PaidSectionScaffold";
import { getTeachersSection } from "@/lib/paid-teachers-sections";
import { useParams } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { AdminEmptyState, AdminSectionCard } from "@/components/admin/AdminUI";
import Link from "next/link";

/**
 * Fallback for unknown paid-content sections.
 * Known sections use dedicated static routes under /admin/paid-content/*.
 */
export default function AdminPaidContentSectionPage() {
  const params = useParams();
  const sectionId = Array.isArray(params?.section) ? String(params.section[0] || "") : String(params?.section || "");
  const section = getTeachersSection(sectionId);

  if (!section) {
    return (
      <AdminShell title="قسم غير موجود" subtitle="تعذّر العثور على هذا القسم ضمن المحتوى المدفوع.">
        <AdminSectionCard title="خطأ">
          <AdminEmptyState title="القسم غير موجود" description="ارجع إلى قائمة إدارة المحتوى المدفوع." />
          <div className="mt-4">
            <Link href="/admin/paid-content" className="text-sm font-bold text-brand-700 underline">
              العودة إلى إدارة المحتوى المدفوع
            </Link>
          </div>
        </AdminSectionCard>
      </AdminShell>
    );
  }

  return (
    <PaidSectionScaffold
      title={section.title}
      description={section.description}
      tone={section.tone}
      Icon={section.Icon}
      plannedFields={[]}
      reuseNote="استخدم الصفحة الثابتة الخاصة بالقسم من قائمة إدارة المحتوى المدفوع."
      needsDatabase={false}
    />
  );
}
