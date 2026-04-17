"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthPageShell from "@/components/auth/AuthPageShell";
import {
  premiumAuthAlertErrorClass,
  premiumAuthAlertSuccessClass,
  premiumAuthFieldClass as fieldClass,
  premiumAuthFooterLinkClass as footerLinkClass,
  premiumAuthFormFooterClass,
  premiumAuthLabelClass as labelClass,
  premiumAuthSubmitClass as submitClass,
} from "@/components/auth/premiumAuthFormClasses";
import { STUDENT_LEVEL_SELECT_OPTIONS } from "@/lib/student-level-codes";

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
          <p id="register-error" role="alert" className={premiumAuthAlertErrorClass}>
            {error}
          </p>
        ) : null}
        {success ? (
          <p role="status" className={premiumAuthAlertSuccessClass}>
            {success}
          </p>
        ) : null}

        <button type="submit" disabled={loading || !!success} className={submitClass}>
          {loading ? "جاري إنشاء الحساب…" : "إنشاء حساب"}
        </button>

        <p className={premiumAuthFormFooterClass}>
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className={footerLinkClass}>
            تسجيل الدخول
          </Link>
        </p>
      </form>
    </AuthPageShell>
  );
}
