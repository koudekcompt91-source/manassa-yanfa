"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SEEDED_STUDENT } from "@/lib/admin-auth";
import { authStore } from "@/lib/auth";
import BrandLogoFull from "@/components/brand/BrandLogoFull";
import { BRAND_NAME } from "@/lib/brand";

const fieldClass =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-start text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdminPortalLink, setShowAdminPortalLink] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.role === "STUDENT") router.replace("/dashboard");
      })
      .catch(() => {});
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setShowAdminPortalLink(false);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          intent: "student",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        const adminPortal = data.code === "STUDENT_PORTAL_ADMIN_ACCOUNT";
        setShowAdminPortalLink(adminPortal);
        setError(adminPortal ? "هذا الحساب خاص بالإدارة" : data.message || "بيانات الدخول غير صحيحة");
        setLoading(false);
        return;
      }
      if (data.user) authStore.saveUser(data.user);
      router.push("/dashboard");
    } catch {
      setError("تعذّر الاتصال بالخادم.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-100">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Link
            href="/"
            aria-label={BRAND_NAME}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm transition hover:border-brand-200"
          >
            <BrandLogoFull variant="auth" />
          </Link>
          <Link href="/" className="text-sm font-semibold text-brand-700 no-underline transition hover:underline">
            ← العودة للرئيسية
          </Link>
          <h1 className="text-xl font-bold text-slate-900">تسجيل الدخول</h1>
          <p className="mt-2 text-sm text-slate-600">أدخل بياناتك للوصول إلى حسابك.</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} method="post" className="flex flex-col gap-4" noValidate>
            <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              تجريبي: {SEEDED_STUDENT.email} / {SEEDED_STUDENT.passwordHint}
            </p>
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-800">
                البريد الإلكتروني
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                dir="ltr"
                className={`${fieldClass} font-mono`}
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-800">
                كلمة المرور
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                className={fieldClass}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
                minLength={6}
              />
            </div>
            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                <p>{error}</p>
                {showAdminPortalLink ? (
                  <p className="mt-2 border-t border-red-100 pt-2 text-center">
                    <Link href="/admin/login" className="font-semibold text-brand-700 underline">
                      الانتقال إلى تسجيل دخول الإدارة
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
              {loading ? "جاري الدخول…" : "دخول"}
            </button>

            <p className="text-center text-sm text-slate-600">
              ليس لديك حساب؟{" "}
              <Link href="/register" className="font-semibold text-brand-700 hover:underline">
                إنشاء حساب
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
