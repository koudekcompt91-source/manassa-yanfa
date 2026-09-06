"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { recordDailyLogin } from "@/lib/student-progress";
import StudentDashboardNav from "@/components/student/StudentDashboardNav";

function isStudentLockedRoute(pathname) {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/store" ||
    pathname.startsWith("/store/")
  );
}

function isPackagesRoute(pathname) {
  return (
    pathname === "/packages" ||
    pathname.startsWith("/packages/") ||
    pathname === "/courses" ||
    pathname.startsWith("/courses/")
  );
}

/**
 * PAID student chrome — full-width content (no vertical sidebar).
 * Horizontal nav lives on /dashboard (below welcome). Other shell routes keep a top nav strip.
 */
export default function StudentAppShell({ children }) {
  const pathname = usePathname() || "";
  const [session, setSession] = useState(null);
  const lockedStudentPath = isStudentLockedRoute(pathname);
  const packagesPath = isPackagesRoute(pathname);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        setSession({ user: data?.user ?? null });
        const r = data?.user?.role ?? "";
        if (r === "STUDENT") {
          try {
            recordDailyLogin();
          } catch {
            /* ignore */
          }
        }
      } catch {
        if (!cancelled) setSession({ user: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const role = session?.user?.role ?? "";
  const isStudent = role === "STUDENT";
  const useShellLayout = lockedStudentPath || (packagesPath && isStudent);
  const isDashboardHome = pathname === "/dashboard";

  if (!useShellLayout) {
    return <div className="min-h-0 w-full min-w-0 flex-1">{children}</div>;
  }

  return (
    <div className="dashboard-shell relative isolate flex min-h-0 w-full min-w-0 flex-1 flex-col bg-gray-50">
      <main className="relative z-10 min-h-0 min-w-0 flex-1">
        <div className="relative z-10 mx-auto flex min-h-0 w-full min-w-0 max-w-[86rem] flex-col gap-5 px-3 py-5 sm:gap-6 sm:px-4 sm:py-6 lg:px-6">
          {!isDashboardHome ? <StudentDashboardNav /> : null}
          {children}
        </div>
      </main>
    </div>
  );
}
