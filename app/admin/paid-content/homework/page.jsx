"use client";

import PaidAssessmentsAdmin from "@/components/admin/paid-content/PaidAssessmentsAdmin";

export default function AdminPaidHomeworkPage() {
  return (
    <PaidAssessmentsAdmin
      assessmentType="ASSIGNMENT"
      pageTitle="واجباتي المنزلية — المحتوى المدفوع"
      pageSubtitle="إدارة Assessment من نوع ASSIGNMENT ضمن الدورات المدفوعة."
      createLabel="إنشاء واجب"
    />
  );
}
