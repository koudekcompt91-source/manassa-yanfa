"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDemoSection } from "@/lib/demo-store";
import { logoutSession } from "@/lib/admin-auth";
import { useRouter } from "next/navigation";
import { formatDzd } from "@/lib/format-money";

export default function ProfilePage() {
  const router = useRouter();
  const [plans] = useDemoSection("plans");
  const [meState, setMeState] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then(setMeState);
  }, []);

  const user = meState?.user;
  const plan = (plans || [])[1] || (plans || [])[0];

  return (
    <div className="relative z-10 min-h-0 w-full min-w-0">
      <section className="container-page max-w-full space-y-6 py-8 sm:py-10">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">الملف الشخصي</h1>
            <p className="mt-2 text-slate-600">بيانات حسابك المسجّلة في المنصة.</p>
          </div>
          {user ? (
            <button
              type="button"
              onClick={async () => {
                await logoutSession();
                router.replace("/login");
              }}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700"
            >
              تسجيل الخروج
            </button>
          ) : null}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">بيانات الحساب</h2>
          <p className="mt-3 text-sm text-slate-700">الاسم: {user?.fullName || "—"}</p>
          <p className="mt-1 text-sm text-slate-700">البريد: {user?.email || "—"}</p>
          <p className="mt-1 text-sm text-slate-700">الهاتف: {user?.phone || "—"}</p>
          <p className="mt-1 text-sm text-slate-700">رصيد المحفظة: {formatDzd(user?.walletBalance ?? 0)}</p>
          <p className="mt-1 text-sm text-slate-700">الحالة: {user?.status === "ACTIVE" ? "نشط" : "معطّل"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">الخطة الحالية (عرض)</h2>
          <p className="mt-3 text-sm text-slate-700">{plan?.name || "—"}</p>
          <p className="mt-1 text-sm text-brand-700">{plan?.price || "—"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">التسجيلات</h2>
          <p className="mt-3 text-sm text-slate-700">عدد الباقات: {(meState?.enrollments || []).length}</p>
          <Link href="/dashboard" className="mt-3 inline-block text-sm font-bold text-brand-700 underline">
            لوحة التحكم
          </Link>
        </div>
      </div>
    </section>
    </div>
  );
}
