"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import AuthPageShell from "@/components/auth/AuthPageShell";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => String(searchParams.get("token") || "").trim(), [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("رابط إعادة التعيين غير صالح.");
      return;
    }
    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.message || "تعذّر إعادة تعيين كلمة المرور.");
        return;
      }
      setDone(true);
      window.setTimeout(() => {
        router.push("/login");
      }, 1800);
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-4">
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          رابط إعادة التعيين غير صالح أو ناقص.
        </div>
        <Link href="/forgot-password" className="font-bold text-brand-700 underline">
          طلب رابط جديد
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-5">
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm leading-relaxed text-emerald-900"
        >
          تم تغيير كلمة المرور بنجاح.
        </div>
        <p className="text-center text-sm text-slate-600">جاري التحويل إلى تسجيل الدخول…</p>
        <Link href="/login" className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand-600 px-5 text-base font-extrabold text-white no-underline">
          تسجيل الدخول الآن
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} method="post" className="space-y-5 sm:space-y-6" noValidate>
      <div className="group space-y-2">
        <label htmlFor="reset-password" className="block text-sm font-black text-slate-700">
          كلمة المرور الجديدة
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute end-0 top-1/2 me-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="reset-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 pe-[4.5rem] text-[0.94rem] text-slate-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85),0_10px_22px_-20px_rgba(15,23,42,0.24)] focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 end-0 me-2 inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="group space-y-2">
        <label htmlFor="reset-confirm" className="block text-sm font-black text-slate-700">
          تأكيد كلمة المرور
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute end-0 top-1/2 me-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="reset-confirm"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 pe-10 text-[0.94rem] text-slate-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85),0_10px_22px_-20px_rgba(15,23,42,0.24)] focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
      </div>

      {error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-l from-brand-600 via-blue-600 to-indigo-700 px-5 text-base font-extrabold text-white shadow-[0_16px_32px_-12px_rgba(24,117,245,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "جاري الحفظ…" : "إعادة تعيين كلمة المرور"}
      </button>

      <p className="pt-1.5 text-center text-sm text-slate-600">
        <Link href="/login" className="font-bold text-brand-700 underline underline-offset-2">
          العودة لتسجيل الدخول
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthPageShell
      title="إعادة تعيين كلمة المرور"
      subtitle="اختر كلمة مرور جديدة لحسابك."
      mode="light-edu"
      brandHeadline="كلمة مرور جديدة لحسابك"
      brandSubtitle="الرابط مؤقت ويُستخدم مرة واحدة فقط لحماية حسابك."
      brandFeatures={["رابط مؤقت", "استخدام مرة واحدة", "تشفير آمن"]}
    >
      <Suspense fallback={<p className="text-sm text-slate-500">جاري التحميل…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthPageShell>
  );
}
