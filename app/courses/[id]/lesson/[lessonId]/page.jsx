"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function LegacyCourseLessonPage() {
  const { id, lessonId } = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/packages/${id}/lesson/${lessonId}`);
  }, [id, lessonId, router]);

  return <div className="container-page py-8 text-center text-slate-600">جاري التحويل إلى صفحة الدرس...</div>;
}
