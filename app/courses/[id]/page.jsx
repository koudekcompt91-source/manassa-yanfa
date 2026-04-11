"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDemoSection } from "@/lib/demo-store";

export default function LegacyCourseDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [packages] = useDemoSection("packages");

  useEffect(() => {
    const pkg = (packages || []).find((row) => row.id === id || row.slug === id);
    if (!pkg) {
      router.replace("/packages");
      return;
    }
    router.replace(`/packages/${pkg.slug}`);
  }, [id, packages, router]);

  return <div className="container-page py-8 text-center text-slate-600">جاري التحويل إلى الباقة...</div>;
}
