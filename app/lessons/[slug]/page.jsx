 "use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function LessonAliasPage() {
  const router = useRouter();
  const { slug } = useParams();

  useEffect(() => {
    (async () => {
      const lessonRef = decodeURIComponent(String(slug || "")).trim();
      try {
        const coursesRes = await fetch("/api/courses", { cache: "no-store", credentials: "include" });
        const coursesData = await coursesRes.json().catch(() => ({}));
        const courses = Array.isArray(coursesData?.courses) ? coursesData.courses : [];

        for (const course of courses) {
          const detailsRes = await fetch(`/api/courses/${encodeURIComponent(course.slug || course.id)}`, {
            cache: "no-store",
            credentials: "include",
          });
          const detailsData = await detailsRes.json().catch(() => ({}));
          if (!detailsRes.ok || !detailsData?.ok) continue;
          const found = (detailsData.lessons || []).find((lesson) => String(lesson.id) === lessonRef);
          if (found) {
            router.replace(`/packages/${detailsData.course.slug}/lesson/${found.id}`);
            return;
          }
        }
      } catch {
        // ignore and redirect
      }
      router.replace("/packages");
    })();
  }, [slug, router]);

  return <div className="container-page py-8 text-center text-slate-600">جاري التحويل إلى الدرس...</div>;
}
