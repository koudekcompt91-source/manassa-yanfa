"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStudentHomePath, isFreeSubscription } from "@/lib/subscription";

type Mode = "paid-only" | "free-only";

/**
 * Client gate: routes FREE students to /free-dashboard and PAID to /dashboard.
 * Does not change JWT — reads subscriptionType from /api/auth/me.
 */
export default function SubscriptionRouteGate({
  mode,
  children,
}: {
  mode: Mode;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const user = data?.user;
        if (!user || user.role !== "STUDENT") {
          router.replace("/login");
          return;
        }
        const home = getStudentHomePath(user.subscriptionType);
        const isFree = isFreeSubscription(user.subscriptionType);
        if (mode === "paid-only" && isFree) {
          router.replace("/free-dashboard");
          return;
        }
        if (mode === "free-only" && !isFree) {
          router.replace(home);
          return;
        }
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) router.replace("/login");
      });
    return () => {
      cancelled = true;
    };
  }, [mode, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8 text-sm text-slate-600">
        جاري التحميل…
      </div>
    );
  }

  return <>{children}</>;
}
