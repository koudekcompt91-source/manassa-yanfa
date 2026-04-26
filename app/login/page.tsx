"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import AuthPageShell from "@/components/auth/AuthPageShell";
import {
  premiumAuthAlertSecondaryRowClass,
  premiumAuthFooterLinkClass as footerLinkClass,
} from "@/components/auth/premiumAuthFormClasses";
import { SEEDED_STUDENT } from "@/lib/admin-auth";
import { authStore } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdminPortalLink, setShowAdminPortalLink] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const errDescribedBy = error ? "login-error" : undefined;

  return (
    <AuthPageShell
      title="تسجيل الدخول"
      subtitle="ادخل إلى حسابك لمتابعة تعلمك."
      mode="split"
      brandHeadline="سجّل الدخول وواصل رحلتك التعليمية"
      brandSubtitle="منصة ينفع تجمع لك تجربة تعليمية حديثة: دروس مسجلة، حصص مباشرة، اختبارات، متابعة تقدم، وشهادات إتمام."
      brandFeatures={["الدروس المسجلة", "الحصص المباشرة", "الواجبات والاختبارات", "متابعة التقدم", "شهادات الإتمام"]}
    >
      <form onSubmit={handleSubmit} method="post" className="space-y-5" noValidate>
        <p className="rounded-xl border border-sky-100 bg-sky-50/70 px-3.5 py-2.5 text-xs text-slate-700">
          <span className="font-semibold text-slate-800">حساب تجريبي:</span>{" "}
          <span className="font-mono text-slate-700" dir="ltr">
            {SEEDED_STUDENT.email}
          </span>
          <span className="text-slate-500"> / </span>
          <span className="font-mono text-slate-700">{SEEDED_STUDENT.passwordHint}</span>
        </p>

        <div className="group space-y-1.5">
          <label htmlFor="login-email" className="block text-sm font-bold text-slate-700">
            البريد الإلكتروني
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            dir="ltr"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-mono text-slate-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7)] transition-[border-color,box-shadow] placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
            placeholder="name@example.com"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            required
            aria-invalid={Boolean(error)}
            aria-describedby={errDescribedBy}
          />
        </div>

        <div className="group space-y-1.5">
          <label htmlFor="login-password" className="block text-sm font-bold text-slate-700">
            كلمة المرور
          </label>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pe-11 text-sm text-slate-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7)] transition-[border-color,box-shadow] placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required
              minLength={6}
              aria-invalid={Boolean(error)}
              aria-describedby={errDescribedBy}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 end-0 me-2 inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error ? (
          <div id="login-error" role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm leading-relaxed text-red-700">
            <p>{error}</p>
            {showAdminPortalLink ? (
              <p className={premiumAuthAlertSecondaryRowClass}>
                <Link href="/admin/login" className={footerLinkClass}>
                  الانتقال إلى تسجيل دخول الإدارة
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-5 text-base font-bold text-white shadow-[0_12px_26px_-12px_rgba(24,117,245,0.45)] transition-[transform,filter,box-shadow] hover:-translate-y-px hover:brightness-105 hover:shadow-[0_16px_30px_-12px_rgba(24,117,245,0.55)] active:translate-y-0 active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "جاري الدخول…" : "تسجيل الدخول"}
        </button>

        <p className="pt-1 text-center text-sm text-slate-600">
          ليس لديك حساب؟{" "}
          <Link href="/register" className={`${footerLinkClass} text-brand-700 hover:text-brand-800`}>
            إنشاء حساب
          </Link>
        </p>
      </form>
    </AuthPageShell>
  );
}
