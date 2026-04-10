"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authStore } from "@/lib/auth";

const navLinks = [
  { href: "/#hero", label: "الرئيسية" },
  { href: "/courses", label: "الدورات" },
  { href: "/#pricing", label: "الأسعار" },
  { href: "/#contact", label: "تواصل" },
] as const;

const linkClass =
  "rounded-lg px-1 py-1 text-sm font-semibold text-slate-600 no-underline decoration-transparent transition-colors hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const ctaGhostClass =
  "rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 no-underline transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2";

const ctaPrimaryClass =
  "rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white no-underline shadow-md shadow-brand-500/25 transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2";

export default function Navbar() {
  const [user, setUser] = useState<ReturnType<typeof authStore.getUser>>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setUser(authStore.getUser());
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const onLogout = () => {
    authStore.clearAuth();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 isolate border-b border-slate-200/90 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/75">
      <nav className="container-landing flex h-16 items-center gap-3 lg:h-[4.25rem] lg:gap-6" aria-label="التنقل الرئيسي">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 no-underline text-lg font-bold tracking-tight text-ink-950 decoration-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-xl"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-sm font-extrabold text-white shadow-sm">
            م
          </span>
          <span className="hidden min-[380px]:inline">منصة ينفع</span>
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="flex items-center gap-1 lg:gap-2">
            {navLinks.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            {user ? (
              <>
                <Link href="/dashboard" className={ctaGhostClass}>
                  لوحة التحكم
                </Link>
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                >
                  خروج
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={ctaGhostClass}>
                  تسجيل الدخول
                </Link>
                <Link href="/register" className={ctaPrimaryClass}>
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 transition hover:bg-slate-50 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav-menu"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {open ? (
        <>
          <div
            className="fixed inset-0 top-16 z-40 bg-slate-950/50 md:hidden"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-nav-menu"
            className="fixed inset-x-0 top-16 z-50 border-b border-slate-200 bg-white shadow-lg md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="قائمة التنقل"
          >
            <div className="container-landing flex flex-col gap-1 py-4">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-3 py-3 text-base font-semibold text-slate-800 no-underline hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-4">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="rounded-xl px-3 py-3 text-center text-base font-semibold text-slate-800 no-underline hover:bg-slate-50"
                      onClick={() => setOpen(false)}
                    >
                      لوحة التحكم
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        onLogout();
                      }}
                      className="rounded-xl bg-slate-900 py-3 text-center text-sm font-semibold text-white"
                    >
                      خروج
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-800 no-underline hover:bg-slate-50"
                      onClick={() => setOpen(false)}
                    >
                      تسجيل الدخول
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-xl bg-brand-600 py-3 text-center text-sm font-semibold text-white no-underline hover:bg-brand-700"
                      onClick={() => setOpen(false)}
                    >
                      إنشاء حساب
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
