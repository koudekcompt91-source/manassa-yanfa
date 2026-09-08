"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail } from "lucide-react";
import AuthPageShell from "@/components/auth/AuthPageShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.message || "تعذّر إرسال الطلب. حاول لاحقًا.");
        return;
      }
      setMessage(
        data.message ||
          "إذا كان البريد الإلكتروني مرتبطًا بحساب، فسيتم إرسال رابط إعادة تعيين كلمة المرور."
      );
      setDone(true);
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell
      title="نسيت كلمة المرور"
      subtitle="أدخل بريدك لإرسال رابط آمن لإعادة التعيين."
      mode="light-edu"
      brandHeadline="استعد الوصول إلى حسابك بسهولة"
      brandSubtitle="سنرسل رابطًا مؤقتًا إلى بريدك إن كان مرتبطًا بحساب على منصة ينفع."
      brandFeatures={["رابط مؤقت", "استخدام مرة واحدة", "تشفير آمن"]}
    >
      {done ? (
        <div className="space-y-5">
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm leading-relaxed text-emerald-900"
          >
            {message}
          </div>
          <Link
            href="/login"
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-l from-brand-600 via-blue-600 to-indigo-700 px-5 text-base font-extrabold text-white no-underline shadow-[0_16px_32px_-12px_rgba(24,117,245,0.5)]"
          >
            العودة لتسجيل الدخول
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} method="post" className="space-y-5 sm:space-y-6" noValidate>
          <div className="group space-y-2">
            <label htmlFor="forgot-email" className="block text-sm font-black text-slate-700">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute end-0 top-1/2 me-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                dir="ltr"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 pe-10 text-[0.94rem] font-mono text-slate-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85),0_10px_22px_-20px_rgba(15,23,42,0.24)] transition-[border-color,box-shadow,background-color] placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-l from-brand-600 via-blue-600 to-indigo-700 px-5 text-base font-extrabold text-white shadow-[0_16px_32px_-12px_rgba(24,117,245,0.5)] ring-1 ring-white/25 transition-[transform,filter,box-shadow] hover:-translate-y-px hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "جاري الإرسال…" : "إرسال رابط إعادة التعيين"}
          </button>

          <p className="pt-1.5 text-center text-sm text-slate-600">
            تذكرت كلمة المرور؟{" "}
            <Link href="/login" className="font-bold text-brand-700 underline underline-offset-2 hover:text-brand-800">
              تسجيل الدخول
            </Link>
          </p>
        </form>
      )}
    </AuthPageShell>
  );
}
