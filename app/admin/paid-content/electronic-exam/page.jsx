"use client";

import PaidAssessmentsAdmin from "@/components/admin/paid-content/PaidAssessmentsAdmin";

export default function AdminPaidElectronicExamPage() {
  return (
    <PaidAssessmentsAdmin
      assessmentType="QUIZ"
      pageTitle="اختبار إلكتروني — المحتوى المدفوع"
      pageSubtitle="إدارة Assessment من نوع QUIZ ضمن الدورات المدفوعة."
      createLabel="إنشاء اختبار إلكتروني"
    />
  );
}
