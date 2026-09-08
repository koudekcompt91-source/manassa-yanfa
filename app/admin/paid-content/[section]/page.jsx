"use client";

import PaidSectionScaffold from "@/components/admin/paid-content/PaidSectionScaffold";
import { getTeachersSection } from "@/lib/paid-teachers-sections";
import { useParams } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { AdminEmptyState, AdminSectionCard } from "@/components/admin/AdminUI";
import Link from "next/link";

const PLACEHOLDER_META = {
  diagnostic: {
    plannedFields: ["العنوان", "الوصف", "المستوى", "المادة", "رابط/ملف التشخيص", "النشر"],
    reuseNote: "لا يوجد Model تشخيصي مدفوع حاليًا. Assessment.QUIZ قريب وظيفيًا لكنه ليس مخصصًا للتقويم التشخيصي.",
    needsDatabase: true,
  },
  exams: {
    plannedFields: ["العنوان", "المستوى", "المادة", "رابط PDF للاختبار", "سلم التصحيح", "النشر"],
    reuseNote: "مختلفة عن الاختبار الإلكتروني (QUIZ). جاهزة عبر PaidFileContent.EXAM لاحقًا.",
    needsDatabase: false,
  },
  library: {
    plannedFields: ["عنوان المورد", "نوع الملف", "رابط التحميل", "المستوى", "المادة", "النشر"],
    reuseNote: "جاهزة عبر PaidFileContent.LIBRARY لاحقًا.",
    needsDatabase: false,
  },
};

/**
 * Dynamic admin placeholder for unpaid/unimplemented paid-content sections.
 * Static routes (lessons/live/homework/electronic-exam) take precedence.
 */
export default function AdminPaidContentSectionPage() {
  const params = useParams();
  const sectionId = Array.isArray(params?.section) ? String(params.section[0] || "") : String(params?.section || "");
  const section = getTeachersSection(sectionId);
  const meta = PLACEHOLDER_META[sectionId];

  if (!section || !meta) {
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
      plannedFields={meta.plannedFields}
      reuseNote={meta.reuseNote}
      needsDatabase={meta.needsDatabase}
    />
  );
}
