"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthPageShell from "@/components/auth/AuthPageShell";
import {
  premiumAuthAlertErrorClass,
  premiumAuthAlertSecondaryRowClass,
  premiumAuthAuxNoteClass,
  premiumAuthFieldClass as fieldClass,
  premiumAuthFooterLinkClass as footerLinkClass,
  premiumAuthFormFooterClass,
  premiumAuthLabelClass as labelClass,
  premiumAuthSubmitClass as submitClass,
} from "@/components/auth/premiumAuthFormClasses";
import { SEEDED_STUDENT } from "@/lib/admin-auth";
import { authStore } from "@/lib/auth";

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

  const errDescribedBy = error ? "login-error" : undefined;

  return (
    <AuthPageShell
      title="تسجيل الدخول"
      subtitle="أدخل بياناتك للوصول إلى حسابك ومتابعة مسارك في yanfa3 Education."
    >
      <form onSubmit={handleSubmit} method="post" className="space-y-5 sm:space-y-[1.375rem]" noValidate>
        <p className={premiumAuthAuxNoteClass}>
          <span className="font-medium text-slate-300">تجريبي:</span>{" "}
          <span className="font-mono text-slate-200/90" dir="ltr">
            {SEEDED_STUDENT.email}
          </span>
          <span className="text-slate-500"> / </span>
          <span className="font-mono text-slate-200/90">{SEEDED_STUDENT.passwordHint}</span>
        </p>

        <div className="group">
          <label htmlFor="login-email" className={labelClass}>
            البريد الإلكتروني
          </label>
          <input
            id="login-email"
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
            aria-describedby={errDescribedBy}
          />
        </div>

        <div className="group">
          <label htmlFor="login-password" className={labelClass}>
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
            aria-invalid={Boolean(error)}
            aria-describedby={errDescribedBy}
          />
        </div>

        {error ? (
          <div id="login-error" role="alert" className={premiumAuthAlertErrorClass}>
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

        <button type="submit" disabled={loading} className={submitClass}>
          {loading ? "جاري الدخول…" : "دخول"}
        </button>

        <p className={premiumAuthFormFooterClass}>
          ليس لديك حساب؟{" "}
          <Link href="/register" className={footerLinkClass}>
            إنشاء حساب
          </Link>
        </p>
      </form>
    </AuthPageShell>
  );
}
