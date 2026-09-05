"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Gift, LockKeyhole, Mail, UserRound } from "lucide-react";
import AuthPageShell from "@/components/auth/AuthPageShell";
import BrandLogoMark from "@/components/brand/BrandLogoMark";
import {
  premiumAuthAlertErrorClass,
  premiumAuthAlertSuccessClass,
} from "@/components/auth/premiumAuthFormClasses";
import { BRAND_NAME } from "@/lib/brand";
import { STUDENT_LEVEL_SELECT_OPTIONS } from "@/lib/student-level-codes";
import { authStore } from "@/lib/auth";
import { getStudentHomePath } from "@/lib/subscription";

type Plan = "choose" | "FREE" | "PAID";

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 pe-10 text-[0.94rem] text-slate-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85),0_10px_22px_-20px_rgba(15,23,42,0.24)] transition-[border-color,box-shadow,background-color] placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 focus:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_14px_24px_-20px_rgba(37,99,235,0.35)]";

const selectClass =
  "h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-[0.94rem] text-slate-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85),0_10px_22px_-20px_rgba(15,23,42,0.24)] transition-[border-color,box-shadow,background-color] hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 focus:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_14px_24px_-20px_rgba(37,99,235,0.35)]";

const submitClass =
  "inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-l from-brand-600 via-blue-600 to-indigo-700 px-5 text-base font-extrabold text-white shadow-[0_16px_32px_-12px_rgba(24,117,245,0.5)] ring-1 ring-white/25 transition-[transform,filter,box-shadow] hover:-translate-y-px hover:brightness-[1.03] hover:shadow-[0_20px_38px_-12px_rgba(24,117,245,0.58)] active:translate-y-0 active:scale-[0.992] disabled:cursor-not-allowed disabled:opacity-60";

export default function RegisterPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan>("choose");
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
    if (plan !== "FREE" && plan !== "PAID") return;
    setError("");
    setSuccess("");

    if (plan === "PAID" && form.password !== form.confirmPassword) {
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
          confirmPassword: plan === "FREE" ? form.password : form.confirmPassword,
          level: form.level,
          subscriptionType: plan,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || "تعذّر إنشاء الحساب.");
        setLoading(false);
        return;
      }

      // FREE: sign in with existing login API, then land on free courses dashboard.
      // PAID: keep existing “go to login” flow unchanged.
      if (plan === "FREE") {
        setSuccess("تم إنشاء الحساب بنجاح! جاري الدخول إلى لوحة الدورات…");
        try {
          const loginRes = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              email: form.email.trim(),
              password: form.password,
              intent: "student",
            }),
          });
          const loginData = await loginRes.json().catch(() => ({}));
          if (loginRes.ok && loginData?.ok && loginData.user) {
            authStore.saveUser(loginData.user);
            router.push(getStudentHomePath(loginData.user.subscriptionType || "FREE"));
            return;
          }
        } catch {
          /* fall through to login page */
        }
        setTimeout(() => router.push("/login"), 800);
        return;
      }

      setSuccess("تم إنشاء الحساب بنجاح! جاري التحويل لتسجيل الدخول…");
      setTimeout(() => router.push("/login"), 1200);
    } catch {
      setError("تعذّر الاتصال بالخادم.");
      setLoading(false);
    }
  }

  function selectPlan(next: "FREE" | "PAID") {
    setPlan(next);
    setError("");
  }

  /* Full-viewport premium plan picker — UI only; texts & handlers unchanged. */
  if (plan === "choose") {
    return (
      <div
        className="relative flex min-h-[100dvh] min-h-screen flex-col overflow-hidden bg-[#0b1220] text-slate-900"
        dir="rtl"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_10%_0%,rgba(16,185,129,0.22),transparent_55%),radial-gradient(ellipse_70%_50%_at_90%_10%,rgba(37,99,235,0.28),transparent_50%),radial-gradient(ellipse_60%_45%_at_50%_100%,rgba(79,70,229,0.2),transparent_55%),linear-gradient(180deg,#0b1220_0%,#111827_45%,#0f172a_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,184,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.14) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden
        />

        <header className="relative z-10 border-b border-white/10 bg-white/[0.06] backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
            <Link
              href="/"
              aria-label={BRAND_NAME}
              className="inline-flex rounded-2xl border border-white/20 bg-white/95 px-3 py-2 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.55)] no-underline backdrop-blur-sm transition hover:bg-white"
            >
              <BrandLogoMark variant="navPrimary" showWordmark priority />
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white no-underline backdrop-blur-sm transition hover:bg-white/16"
            >
              تسجيل الدخول
            </Link>
          </div>
        </header>

        <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
              إنشاء حساب جديد
            </h1>
            <p className="mt-3 text-base font-semibold text-slate-300 sm:text-lg">اختر نوع التسجيل المناسب لك.</p>
            <p className="mt-2 text-sm font-semibold text-slate-400">كيف تريد التسجيل؟</p>
          </div>

          {/* LTR placement so FREE=left, PAID=right; card content stays RTL */}
          <div
            dir="ltr"
            className="grid w-full gap-5 sm:gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-8"
          >
            {/* LEFT — FREE */}
            <article
              dir="rtl"
              className="group relative flex min-h-[22rem] flex-col overflow-hidden rounded-[1.75rem] border border-emerald-400/35 bg-white/10 p-6 shadow-[0_28px_80px_-28px_rgba(16,185,129,0.45)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-emerald-300/55 hover:bg-white/[0.14] hover:shadow-[0_36px_90px_-24px_rgba(16,185,129,0.55)] sm:min-h-[26rem] sm:p-8 lg:p-10"
            >
              <div
                className="pointer-events-none absolute -start-16 -top-16 h-48 w-48 rounded-full bg-emerald-400/25 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden
              />
              <div className="relative z-10 flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/20 px-3.5 py-1.5 text-xs font-extrabold text-emerald-100">
                    <Gift className="h-3.5 w-3.5" />
                    تسجيل مجاني
                  </span>
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-500/20 text-emerald-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]">
                    <Gift className="h-7 w-7" strokeWidth={1.75} />
                  </span>
                </div>

                <h2 className="mt-6 text-2xl font-black text-white sm:text-3xl">حساب مجاني</h2>
                <p className="mt-4 flex-1 text-sm leading-8 text-slate-200 sm:text-base sm:leading-8">
                  دورات مجانية، مستندات PDF، وألعاب تعليمية لاحقًا — بلا محفظة ولا متجر.
                </p>

                <button
                  type="button"
                  onClick={() => selectPlan("FREE")}
                  className="mt-8 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-600 px-6 text-base font-extrabold text-white shadow-[0_18px_40px_-14px_rgba(16,185,129,0.65)] ring-1 ring-white/20 transition-[transform,filter,box-shadow] duration-300 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_22px_48px_-12px_rgba(16,185,129,0.75)] active:translate-y-0 active:scale-[0.99]"
                >
                  تسجيل مجاني
                </button>
              </div>
            </article>

            {/* RIGHT — PAID (VIP) */}
            <article
              dir="rtl"
              className="group relative flex min-h-[22rem] flex-col overflow-hidden rounded-[1.75rem] border border-brand-300/40 bg-gradient-to-br from-brand-600/25 via-indigo-700/20 to-slate-900/40 p-6 shadow-[0_28px_80px_-28px_rgba(37,99,235,0.55)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-brand-200/60 hover:shadow-[0_36px_90px_-24px_rgba(37,99,235,0.65)] sm:min-h-[26rem] sm:p-8 lg:p-10"
            >
              <div
                className="pointer-events-none absolute -end-10 -top-10 h-56 w-56 rounded-full bg-brand-400/30 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-16 start-8 h-40 w-40 rounded-full bg-indigo-400/25 blur-3xl"
                aria-hidden
              />
              <div className="relative z-10 flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/35 bg-amber-400/15 px-3.5 py-1.5 text-xs font-extrabold text-amber-100">
                    <Crown className="h-3.5 w-3.5" />
                    تسجيل مدفوع
                  </span>
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-brand-500/40 to-indigo-600/40 text-amber-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)]">
                    <Crown className="h-7 w-7" strokeWidth={1.75} />
                  </span>
                </div>

                <h2 className="mt-6 text-2xl font-black text-white sm:text-3xl">الحساب الكامل</h2>
                <p className="mt-4 flex-1 text-sm leading-8 text-slate-200 sm:text-base sm:leading-8">
                  الوصول الكامل للمنصة كما هو اليوم: الدورات، المحفظة، المتجر، والشهادات.
                </p>

                <button
                  type="button"
                  onClick={() => selectPlan("PAID")}
                  className="mt-8 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-l from-brand-600 via-blue-600 to-indigo-700 px-6 text-base font-extrabold text-white shadow-[0_18px_40px_-14px_rgba(37,99,235,0.7)] ring-1 ring-white/25 transition-[transform,filter,box-shadow] duration-300 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_22px_48px_-12px_rgba(37,99,235,0.8)] active:translate-y-0 active:scale-[0.99]"
                >
                  تسجيل مدفوع
                </button>
              </div>
            </article>
          </div>

          <p className="mt-8 text-center text-sm text-slate-300 sm:mt-10">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="font-bold text-sky-300 underline underline-offset-2 hover:text-sky-200">
              تسجيل الدخول
            </Link>
          </p>
        </main>
      </div>
    );
  }

  return (
    <AuthPageShell
      title="إنشاء حساب جديد"
      subtitle="اختر نوع التسجيل المناسب لك."
      mode="light-edu"
      brandHeadline="ابدأ رحلتك التعليمية بثقة"
      brandSubtitle="أنشئ حسابك للوصول إلى الدروس، الحصص المباشرة، الاختبارات، والتقدم داخل منصة ينفع."
      brandFeatures={["دروس مسجلة", "حصص مباشرة", "اختبارات", "شهادات"]}
      authNavHref="/login"
      authNavLabel="تسجيل الدخول"
    >
      <form onSubmit={handleSubmit} method="post" className="space-y-5 sm:space-y-6" noValidate>
        <button
          type="button"
          onClick={() => {
            setPlan("choose");
            setError("");
            setSuccess("");
          }}
          className="text-sm font-bold text-brand-700 underline underline-offset-2"
        >
          ← العودة لاختيار نوع الحساب
        </button>

        <div
          className={`rounded-xl border px-3.5 py-2.5 text-sm font-bold ${
            plan === "FREE"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-brand-200 bg-brand-50 text-brand-800"
          }`}
        >
          {plan === "FREE" ? "أنت تسجّل في الحساب المجاني" : "أنت تسجّل في الحساب الكامل (مدفوع)"}
        </div>

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
              className={inputClass}
              placeholder="أدخل اسمك الكامل"
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              required
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
            className={selectClass}
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
              className={`${inputClass} font-mono`}
              placeholder="أدخل بريدك الإلكتروني"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
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
              className={inputClass}
              placeholder="أنشئ كلمة مرور"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required
              minLength={6}
            />
          </div>
        </div>

        {plan === "PAID" ? (
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
                className={inputClass}
                placeholder="أنشئ كلمة مرور"
                value={form.confirmPassword}
                onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                required
                minLength={6}
              />
            </div>
          </div>
        ) : null}

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
          {loading ? "جاري إنشاء الحساب…" : plan === "FREE" ? "إنشاء حساب مجاني" : "إنشاء حساب"}
        </button>

        <p className="pt-1.5 text-center text-sm text-slate-600">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-bold text-brand-700 underline underline-offset-2 hover:text-brand-800">
            تسجيل الدخول
          </Link>
        </p>
      </form>
    </AuthPageShell>
  );
}
