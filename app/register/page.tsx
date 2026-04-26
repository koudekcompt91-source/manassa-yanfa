"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import AuthPageShell from "@/components/auth/AuthPageShell";
import {
  premiumAuthAlertErrorClass,
  premiumAuthAlertSuccessClass,
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
      title="إنشاء حساب جديد"
      subtitle="ابدأ رحلتك التعليمية الآن."
      mode="light-edu"
      brandHeadline="ابدأ رحلتك التعليمية بثقة"
      brandSubtitle="أنشئ حسابك للوصول إلى الدروس، الحصص المباشرة، الاختبارات، والتقدم داخل منصة ينفع."
      brandFeatures={["دروس مسجلة", "حصص مباشرة", "اختبارات", "شهادات"]}
      authNavHref="/login"
      authNavLabel="تسجيل الدخول"
    >
      <form onSubmit={handleSubmit} method="post" className="space-y-5 sm:space-y-6" noValidate>
        <div className="group space-y-2">
          <label htmlFor="register-name" className="block text-sm font-black text-slate-700">
            الاسم الكامل
          </label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute end-0 top-1/2 me-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="register-name"
              name="fullName"
              type="text"
              autoComplete="name"
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 pe-10 text-[0.94rem] text-slate-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85),0_10px_22px_-20px_rgba(15,23,42,0.24)] transition-[border-color,box-shadow,background-color] placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 focus:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_14px_24px_-20px_rgba(37,99,235,0.35)]"
              placeholder="أدخل اسمك الكامل"
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "register-error" : undefined}
            />
          </div>
        </div>

        <div className="group space-y-2">
          <label htmlFor="register-level" className="block text-sm font-black text-slate-700">
            المستوى الدراسي
          </label>
          <select
            id="register-level"
            name="level"
            required
            value={form.level}
            onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
            className="h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-[0.94rem] text-slate-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85),0_10px_22px_-20px_rgba(15,23,42,0.24)] transition-[border-color,box-shadow,background-color] hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 focus:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_14px_24px_-20px_rgba(37,99,235,0.35)]"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "register-error" : undefined}
          >
            <option value="" disabled>
              اختر مستواك الدراسي
            </option>
            {STUDENT_LEVEL_SELECT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="group space-y-2">
          <label htmlFor="register-email" className="block text-sm font-black text-slate-700">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute end-0 top-1/2 me-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              dir="ltr"
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 pe-10 text-[0.94rem] font-mono text-slate-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85),0_10px_22px_-20px_rgba(15,23,42,0.24)] transition-[border-color,box-shadow,background-color] placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 focus:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_14px_24px_-20px_rgba(37,99,235,0.35)]"
              placeholder="أدخل بريدك الإلكتروني"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "register-error" : undefined}
            />
          </div>
        </div>

        <div className="group space-y-2">
          <label htmlFor="register-password" className="block text-sm font-black text-slate-700">
            كلمة المرور
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute end-0 top-1/2 me-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 pe-10 text-[0.94rem] text-slate-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85),0_10px_22px_-20px_rgba(15,23,42,0.24)] transition-[border-color,box-shadow,background-color] placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 focus:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_14px_24px_-20px_rgba(37,99,235,0.35)]"
              placeholder="أنشئ كلمة مرور"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required
              minLength={6}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "register-error" : undefined}
            />
          </div>
        </div>

        <div className="group space-y-2">
          <label htmlFor="register-confirm" className="block text-sm font-black text-slate-700">
            تأكيد كلمة المرور
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute end-0 top-1/2 me-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="register-confirm"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 pe-10 text-[0.94rem] text-slate-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85),0_10px_22px_-20px_rgba(15,23,42,0.24)] transition-[border-color,box-shadow,background-color] placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 focus:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_14px_24px_-20px_rgba(37,99,235,0.35)]"
              placeholder="أنشئ كلمة مرور"
              value={form.confirmPassword}
              onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
              required
              minLength={6}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "register-error" : undefined}
            />
          </div>
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

        <button
          type="submit"
          disabled={loading || !!success}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-l from-brand-600 via-blue-600 to-indigo-700 px-5 text-base font-extrabold text-white shadow-[0_16px_32px_-12px_rgba(24,117,245,0.5)] ring-1 ring-white/25 transition-[transform,filter,box-shadow] hover:-translate-y-px hover:brightness-[1.03] hover:shadow-[0_20px_38px_-12px_rgba(24,117,245,0.58)] active:translate-y-0 active:scale-[0.992] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "جاري إنشاء الحساب…" : "إنشاء حساب"}
        </button>

        <p className="pt-1.5 text-center text-sm text-slate-600">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-bold text-brand-700 underline underline-offset-2 hover:text-brand-800">
            تسجيل الدخول
          </Link>
        </p>
        <p className="text-center text-xs text-slate-500">بياناتك تظهر فقط داخل حسابك بعد تسجيل الدخول.</p>
      </form>
    </AuthPageShell>
  );
}
