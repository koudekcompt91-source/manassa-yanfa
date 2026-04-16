"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthPageShell, { inputFocus } from "@/components/auth/AuthPageShell";
import { STUDENT_LEVEL_SELECT_OPTIONS } from "@/lib/student-level-codes";

const fieldClass =
  `mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-start text-base text-slate-900 placeholder:text-slate-400 transition ${inputFocus}`;

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    level: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }
    if (form.password.length < 6) {
      setError("كلمة المرور يجب ألا تقل عن 6 أحرف.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          confirmPassword: form.confirmPassword,
          level: form.level,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || "تعذّر إنشاء الحساب.");
        setLoading(false);
        return;
      }
      setSuccess("تم إنشاء الحساب بنجاح! جاري التحويل لتسجيل الدخول…");
      setTimeout(() => router.push("/login"), 1200);
    } catch {
      setError("تعذّر الاتصال بالخادم.");
      setLoading(false);
    }
  }

  return (
    <AuthPageShell
      title="إنشاء حساب"
      subtitle="انضم إلى yanfa3 Education وابدأ مسارك الأكاديمي في الأدب العربي بخطوات واضحة وآمنة."
    >
      <form onSubmit={handleSubmit} method="post" className="space-y-5" noValidate>
        <div>
          <label htmlFor="register-name" className="block text-sm font-semibold text-slate-800">
            الاسم الكامل
          </label>
          <input
            id="register-name"
            name="fullName"
            type="text"
            autoComplete="name"
            className={fieldClass}
            placeholder="الاسم كما يظهر في الوثائق"
            value={form.fullName}
            onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "register-error" : undefined}
          />
        </div>

        <div>
          <label htmlFor="register-level" className="block text-sm font-semibold text-slate-800">
            المستوى الدراسي
          </label>
          <select
            id="register-level"
            name="level"
            required
            value={form.level}
            onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
            className={fieldClass}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "register-error" : undefined}
          >
            <option value="" disabled>
              اختر المستوى
            </option>
            {STUDENT_LEVEL_SELECT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="register-email" className="block text-sm font-semibold text-slate-800">
            البريد الإلكتروني
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            dir="ltr"
            className={`${fieldClass} font-mono text-sm sm:text-base`}
            placeholder="name@example.com"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "register-error" : undefined}
          />
        </div>

        <div>
          <label htmlFor="register-password" className="block text-sm font-semibold text-slate-800">
            كلمة المرور
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            className={fieldClass}
            placeholder="6 أحرف على الأقل"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            required
            minLength={6}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "register-error" : undefined}
          />
        </div>

        <div>
          <label htmlFor="register-confirm" className="block text-sm font-semibold text-slate-800">
            تأكيد كلمة المرور
          </label>
          <input
            id="register-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            className={fieldClass}
            placeholder="أعد إدخال كلمة المرور"
            value={form.confirmPassword}
            onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
            required
            minLength={6}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "register-error" : undefined}
          />
        </div>

        {error ? (
          <p id="register-error" role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}
        {success ? (
          <p role="status" className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            {success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading || !!success}
          className="w-full rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-500/25 transition hover:opacity-[0.97] disabled:cursor-not-allowed disabled:opacity-55 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          {loading ? "جاري إنشاء الحساب…" : "إنشاء حساب"}
        </button>

        <p className="text-center text-sm text-slate-600">
          لديك حساب بالفعل؟{" "}
          <Link
            href="/login"
            className="font-bold text-brand-700 no-underline transition hover:text-brand-800 focus:outline-none focus-visible:underline"
          >
            تسجيل الدخول
          </Link>
        </p>
      </form>
    </AuthPageShell>
  );
}
