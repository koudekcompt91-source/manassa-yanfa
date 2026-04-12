"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SEEDED_ADMIN } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showStudentPortalLink, setShowStudentPortalLink] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me?intent=admin", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.role === "ADMIN") router.replace("/admin/dashboard");
      })
      .catch(() => {});
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setShowStudentPortalLink(false);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        const notAdmin = data.code === "NOT_ADMIN";
        setShowStudentPortalLink(notAdmin);
        setError(data.message || "بيانات الدخول غير صحيحة");
        setLoading(false);
        return;
      }
      router.replace("/admin/dashboard");
    } catch {
      setError("تعذّر الاتصال بالخادم.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-900 px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-slate-600 bg-slate-800 p-6 text-slate-100 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold text-brand-300">منصة ينفع — الإدارة</p>
          <h1 className="mt-2 text-xl font-bold text-white">تسجيل دخول الإدارة</h1>
          <p className="mt-2 text-sm text-slate-300">الدخول إلى لوحة التحكم</p>
          <p className="mt-2 text-xs text-slate-400">هذه الصفحة مخصصة لإدارة المنصة فقط</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-slate-200">
              البريد الإلكتروني
            </label>
            <input
              id="admin-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-500 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder={SEEDED_ADMIN.email}
              required
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-slate-200">
              كلمة المرور
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full rounded-md border border-slate-500 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="shrink-0 rounded-md border border-slate-500 bg-slate-700 px-3 text-xs font-medium text-slate-200 hover:bg-slate-600"
              >
                {showPassword ? "إخفاء" : "إظهار"}
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-md border border-red-400/50 bg-red-950/50 px-3 py-2 text-sm text-red-100">
              <p>{error}</p>
              {showStudentPortalLink ? (
                <p className="mt-2 border-t border-red-400/30 pt-2 text-center">
                  <Link href="/login" className="font-semibold text-brand-300 underline">
                    الانتقال إلى تسجيل دخول الطلاب
                  </Link>
                </p>
              ) : null}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "جارٍ التحقق..." : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
