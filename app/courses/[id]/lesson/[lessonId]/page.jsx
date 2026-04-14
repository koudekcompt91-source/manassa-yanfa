"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function LegacyCourseLessonPage() {
  const { id, lessonId } = useParams();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const ref = String(id || "");
      try {
        const res = await fetch(`/api/courses/${encodeURIComponent(ref)}`, { cache: "no-store", credentials: "include" });
        const data = await res.json().catch(() => ({}));
        const slug = data?.course?.slug || ref;
        router.replace(`/packages/${slug}/lesson/${lessonId}`);
      } catch {
        router.replace(`/packages/${id}/lesson/${lessonId}`);
      }
    })();
  }, [id, lessonId, router]);

  return <div className="container-page py-8 text-center text-slate-600">جاري التحويل إلى صفحة الدرس...</div>;
}
