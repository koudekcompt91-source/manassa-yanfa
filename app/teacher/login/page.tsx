"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import AuthPageShell from "@/components/auth/AuthPageShell";

export default function TeacherLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetch("/api/teacher/me", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.role === "TEACHER") router.replace("/teacher/dashboard");
      })
      .catch(() => {});
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.message || "بيانات الدخول غير صحيحة.");
        setLoading(false);
        return;
      }
      router.replace("/teacher/dashboard");
    } catch {
      setError("تعذّر الاتصال بالخادم.");
      setLoading(false);
    }
  }

  const errDescribedBy = error ? "teacher-login-error" : undefined;

  return (
    <AuthPageShell
      title="دخول الأستاذ"
      subtitle="هذه الصفحة مخصصة لحسابات الأساتذة فقط."
      mode="light-edu"
      brandHeadline="لوحة الأستاذ"
      brandSubtitle="تابع دوراتك المعيّنة في نظام الحساب الكامل من مكان واحد."
      brandFeatures={["دوراتي", "المحتوى المعيّن", "حساب الأستاذ"]}
      authNavHref="/"
      authNavLabel="الرئيسية"
    >
      <form onSubmit={handleSubmit} method="post" className="space-y-5 sm:space-y-6" noValidate>
        <div className="group space-y-2">
          <label htmlFor="teacher-email" className="block text-sm font-black text-slate-700">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="teacher-email"
              type="email"
              autoComplete="username"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              aria-describedby={errDescribedBy}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pe-3 ps-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              placeholder="teacher@example.com"
              required
              dir="ltr"
            />
          </div>
        </div>
        <div className="group space-y-2">
          <label htmlFor="teacher-password" className="block text-sm font-black text-slate-700">
            كلمة المرور
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="teacher-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              aria-describedby={errDescribedBy}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pe-12 ps-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error ? (
          <p id="teacher-login-error" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-sm hover:brightness-105 disabled:opacity-50"
        >
          {loading ? "جارٍ التحقق..." : "دخول"}
        </button>
        <p className="text-center text-xs text-slate-500">
          طالب؟{" "}
          <Link href="/login" className="font-bold text-brand-700 underline">
            تسجيل دخول الطلاب
          </Link>
        </p>
      </form>
    </AuthPageShell>
  );
}
