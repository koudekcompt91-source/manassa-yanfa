"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthPageShell, { easePremium, inputFocus } from "@/components/auth/AuthPageShell";
import { STUDENT_LEVEL_SELECT_OPTIONS } from "@/lib/student-level-codes";

const fieldClass =
  `mt-1.5 w-full touch-manipulation rounded-xl border border-white/[0.1] bg-slate-950/40 px-4 py-3 text-start text-base text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.035)] transition-[border-color,background-color,box-shadow,transform,color] ${easePremium} placeholder:text-slate-500/90 hover:border-white/[0.14] hover:bg-slate-950/48 motion-safe:active:scale-[0.998] motion-reduce:active:scale-100 active:duration-[180ms] active:ease-out ${inputFocus}`;

const labelClass =
  `block text-sm font-medium tracking-wide text-slate-300 transition-colors ${easePremium} group-focus-within:text-slate-100`;

/** Matches homepage `btnHeroBrand` — full-width auth CTA + tactile press */
const submitClass =
  `inline-flex min-h-[3rem] w-full touch-manipulation select-none items-center justify-center rounded-2xl border border-white/22 bg-gradient-to-l from-brand-600 to-indigo-700 px-7 py-3.5 text-base font-bold text-white shadow-[0_1px_0_0_rgba(255,255,255,0.22)_inset,0_14px_36px_-8px_rgba(24,117,245,0.5)] ring-1 ring-white/28 transition-[transform,filter,box-shadow,ring-color,border-color] ${easePremium} motion-safe:hover:-translate-y-px motion-reduce:hover:translate-y-0 hover:ring-white/38 hover:shadow-[0_18px_48px_-10px_rgba(24,117,245,0.45)] hover:brightness-[1.02] motion-safe:active:translate-y-0 motion-safe:active:scale-[0.989] motion-reduce:active:scale-100 active:duration-[180ms] active:ease-out disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:brightness-100 disabled:hover:shadow-[0_1px_0_0_rgba(255,255,255,0.22)_inset,0_14px_36px_-8px_rgba(24,117,245,0.5)] disabled:hover:ring-white/28 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-200/50`;

const footerLinkClass =
  `font-semibold text-brand-300/95 no-underline transition-[color,transform,opacity] ${easePremium} motion-safe:hover:text-brand-200 motion-safe:hover:-translate-y-px motion-reduce:hover:translate-y-0 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98] motion-reduce:active:scale-100 active:duration-[180ms] active:ease-out focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-200/45`;

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
      <form onSubmit={handleSubmit} method="post" className="space-y-5 sm:space-y-[1.375rem]" noValidate>
        <div className="group">
          <label htmlFor="register-name" className={labelClass}>
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

        <div className="group">
          <label htmlFor="register-level" className={labelClass}>
            المستوى الدراسي
          </label>
          <select
            id="register-level"
            name="level"
            required
            value={form.level}
            onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
            className={`${fieldClass} cursor-pointer`}
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

        <div className="group">
          <label htmlFor="register-email" className={labelClass}>
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

        <div className="group">
          <label htmlFor="register-password" className={labelClass}>
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

        <div className="group">
          <label htmlFor="register-confirm" className={labelClass}>
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
          <p
            id="register-error"
            role="alert"
            className="rounded-xl border border-red-400/20 bg-red-950/45 px-3.5 py-2.5 text-sm leading-relaxed text-red-100/95"
          >
            {error}
          </p>
        ) : null}
        {success ? (
          <p role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-950/38 px-3.5 py-2.5 text-sm leading-relaxed text-emerald-100/95">
            {success}
          </p>
        ) : null}

        <button type="submit" disabled={loading || !!success} className={submitClass}>
          {loading ? "جاري إنشاء الحساب…" : "إنشاء حساب"}
        </button>

        <p className="pt-0.5 text-center text-sm text-slate-500">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className={`inline-flex touch-manipulation ${footerLinkClass}`}>
            تسجيل الدخول
          </Link>
        </p>
      </form>
    </AuthPageShell>
  );
}
