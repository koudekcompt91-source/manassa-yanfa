"use client";

import PaidAssessmentsAdmin from "@/components/admin/paid-content/PaidAssessmentsAdmin";

export default function AdminPaidElectronicExamPage() {
  return (
    <PaidAssessmentsAdmin
      assessmentType="QUIZ"
      pageTitle="اختبار إلكتروني — المحتوى المدفوع"
      pageSubtitle="Assessment.QUIZ · 10 أسئلة — 10 نقاط · النشر يتطلب اكتمال الأسئلة."
      createLabel="إنشاء اختبار إلكتروني"
    />
  );
}
