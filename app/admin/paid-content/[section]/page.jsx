"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminEmptyState, AdminSectionCard } from "@/components/admin/AdminUI";
import { getTeachersSection } from "@/lib/paid-teachers-sections";

/**
 * Placeholder admin shell for PAID sections not yet wired to real CMS.
 * Protected by existing admin layout / AdminRouteGuard.
 */
export default function AdminPaidContentSectionPage() {
  const params = useParams();
  const sectionId = String(params?.section || "");
  const section = getTeachersSection(sectionId);

  if (!section) {
    return (
      <AdminShell title="قسم غير موجود" subtitle="تعذّر العثور على هذا القسم ضمن المحتوى المدفوع.">
        <AdminSectionCard title="خطأ">
          <AdminEmptyState
            title="القسم غير موجود"
            description="تأكد من الرابط أو ارجع إلى قائمة إدارة المحتوى المدفوع."
          />
          <div className="mt-4">
            <Link href="/admin/paid-content" className="text-sm font-bold text-brand-700 underline">
              العودة إلى إدارة المحتوى المدفوع
            </Link>
          </div>
        </AdminSectionCard>
      </AdminShell>
    );
  }

  const Icon = section.Icon;

  return (
    <AdminShell
      title={section.title}
      subtitle="هذا القسم ضمن المحتوى المدفوع وجاهز للربط لاحقًا مع نظام الإدارة الكامل."
    >
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
        title={section.title}
        subtitle={section.description}
        action={
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white ${section.tone}`}
            aria-hidden
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </span>
        }
      >
        <AdminEmptyState
          title="القسم جاهز للربط لاحقًا"
          description="واجهة إدارية مؤقتة للمحتوى المدفوع فقط. لم يُبنَ نظام إدارة المحتوى لهذا القسم بعد، ولن يُستخدم أي محتوى مجاني هنا."
        />
      </AdminSectionCard>
    </AdminShell>
  );
}
