"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(pathname === "/admin/login");

  useEffect(() => {
    if (pathname === "/admin/login") {
      setReady(true);
      return;
    }
    let cancelled = false;
    fetch("/api/auth/me?intent=admin", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (!data?.user || data.user.role !== "ADMIN") {
          router.replace("/admin/login");
          return;
        }
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) router.replace("/admin/login");
      });
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready && pathname !== "/admin/login") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-600">
        جاري التحقق من الجلسة…
      </div>
    );
  }

  return <>{children}</>;
}
