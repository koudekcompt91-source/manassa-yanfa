"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function LegacyCourseDetailsPage() {
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    (async () => {
      const ref = String(id || "");
      try {
        const res = await fetch(`/api/courses/${encodeURIComponent(ref)}`, { cache: "no-store", credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok || !data?.course?.slug) {
          router.replace("/packages");
          return;
        }
        router.replace(`/packages/${data.course.slug}`);
      } catch {
        router.replace("/packages");
      }
    })();
  }, [id, router]);

  return <div className="container-page py-8 text-center text-slate-600">جاري التحويل إلى الدورة...</div>;
}
