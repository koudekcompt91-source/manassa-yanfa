 "use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDemoSection } from "@/lib/demo-store";

export default function LessonAliasPage() {
  const router = useRouter();
  const { slug } = useParams();
  const [packages] = useDemoSection("packages");
  const [lessons] = useDemoSection("lessons");

  useEffect(() => {
    const normalizedSlug = decodeURIComponent(String(slug || "")).trim();
    const lesson = (lessons || []).find((row) => {
      const rowSlug = decodeURIComponent(String(row.slug || "")).trim();
      const rowId = String(row.id || "").trim();
      const published = row.isPublished === true || row.isPublished === "published" || row.status === "published";
      return (rowSlug === normalizedSlug || rowId === normalizedSlug || rowSlug === slug || rowId === slug) && published;
    });
    if (!lesson) {
      router.replace("/packages");
      return;
    }
    const pkg = (packages || []).find((row) => row.id === lesson.packageId);
    if (!pkg) {
      router.replace("/packages");
      return;
    }
    router.replace(`/packages/${pkg.slug}/lesson/${lesson.id}`);
  }, [slug, lessons, packages, router]);

  return <div className="container-page py-8 text-center text-slate-600">جاري التحويل إلى الدرس...</div>;
}
