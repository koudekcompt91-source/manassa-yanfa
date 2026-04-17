"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { authStore } from "@/lib/auth";
import { formatDzd } from "@/lib/format-money";
import BrandLogoMark from "@/components/brand/BrandLogoMark";
import { BRAND_NAME } from "@/lib/brand";

type StudentNavUser = {
  id: string;
  email: string;
  fullName: string;
  walletBalance?: number;
};

const navLinks = [
  { href: "/#hero", label: "الرئيسية" },
  { href: "/courses", label: "الدورات" },
  { href: "/pricing", label: "الاشتراكات" },
  { href: "/contact", label: "تواصل" },
] as const;

const linkClass =
  "touch-manipulation rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 no-underline decoration-transparent transition-[color,background-color] duration-[220ms] ease-out hover:bg-slate-100/80 hover:text-slate-900 active:bg-slate-100/95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const navEase = "duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

const ctaGhostClass =
  `touch-manipulation rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 no-underline shadow-sm shadow-slate-900/[0.025] ring-1 ring-slate-200/72 transition-[transform,background-color,box-shadow,filter,ring-color] ${navEase} motion-safe:hover:-translate-y-px motion-reduce:hover:translate-y-0 hover:bg-white hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)] hover:ring-slate-200/95 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.989] motion-reduce:active:scale-100 active:duration-[180ms] ease-out active:brightness-[0.997] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2`;

const ctaPrimaryClass =
  `touch-manipulation rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white no-underline shadow-md shadow-brand-500/22 ring-1 ring-white/14 transition-[transform,filter,box-shadow,ring-color] ${navEase} motion-safe:hover:-translate-y-px motion-reduce:hover:translate-y-0 hover:brightness-[1.015] hover:ring-white/22 hover:shadow-[0_10px_32px_-12px_rgba(24,117,245,0.28)] motion-safe:active:translate-y-0 motion-safe:active:scale-[0.989] motion-reduce:active:scale-100 active:duration-[180ms] ease-out active:brightness-[0.992] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2`;

function avatarLetter(fullName: string, email: string) {
  const s = (fullName || email || "?").trim();
  return s ? s.charAt(0) : "?";
}

export default function Navbar() {
  const pathname = usePathname();
  const [student, setStudent] = useState<StudentNavUser | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const refreshSession = useCallback(async () => {
    try {
      const r = await fetch("/api/auth/me", { credentials: "include" });
      const data = await r.json().catch(() => ({}));
      const u = data?.user;
      if (u?.role === "STUDENT") {
        const next: StudentNavUser = {
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          walletBalance: typeof u.walletBalance === "number" ? u.walletBalance : Number(u.walletBalance) || 0,
        };
        setStudent(next);
        authStore.saveUser(u);
      } else {
        setStudent(null);
        authStore.clearAuth();
      }
    } catch {
      setStudent(null);
    } finally {
      setSessionReady(true);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [pathname, refreshSession]);

  useEffect(() => {
    if (!accountOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!accountRef.current?.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [accountOpen]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  /** Logged-in students use the in-app sidebar; hide marketing links to reduce noise. */
  const hideMarketingNav =
    Boolean(student) &&
    Boolean(pathname) &&
    (pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/") ||
      pathname.startsWith("/packages") ||
      pathname.startsWith("/courses") ||
      pathname === "/profile" ||
      pathname.startsWith("/profile/"));

  const onLogout = async () => {
    setAccountOpen(false);
    setMobileOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      /* ignore */
    }
    authStore.clearAuth();
    setStudent(null);
    window.location.href = "/";
  };

  const walletLabel =
    student && typeof student.walletBalance === "number" && Number.isFinite(student.walletBalance)
      ? formatDzd(student.walletBalance)
      : null;

  const isMarketingHome = pathname === "/";
  const isPublicAuth = pathname === "/login" || pathname === "/register";

  return (
    <header
      className={`sticky top-0 z-10 shrink-0 border-b ${
        isMarketingHome
          ? "border-slate-200/80 bg-white/[0.98] shadow-[0_1px_0_0_rgba(15,23,42,0.035)] supports-[backdrop-filter]:backdrop-blur-sm"
          : "border-slate-200 bg-white"
      }`}
    >
      <nav
        className={`mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:gap-7 lg:px-8 xl:px-10 ${
          isMarketingHome
            ? "min-h-[6.05rem] py-2.5 sm:min-h-[6.55rem] sm:py-3 md:min-h-[6.75rem] md:py-3.5 lg:min-h-[7.05rem] lg:py-4"
            : "h-16"
        }`}
        aria-label="التنقل الرئيسي"
      >
        <Link
          href="/"
          aria-label={BRAND_NAME}
          className="motion-safe:animate-nav-choreo motion-reduce:animate-none flex shrink-0 items-center rounded-lg py-0.5 no-underline decoration-transparent transition-colors duration-200 ease-out hover:bg-slate-50/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          style={{ animationDelay: "0ms" }}
          onClick={() => setMobileOpen(false)}
        >
          <BrandLogoMark
            variant={isMarketingHome ? "navPrimary" : "nav"}
            showWordmark
            priority={isMarketingHome || isPublicAuth}
          />
        </Link>

        {!hideMarketingNav ? (
          <div className="hidden min-w-0 flex-1 justify-center md:flex">
            <div className="flex max-w-full flex-wrap items-center justify-center gap-0.5 lg:gap-1.5">
              {navLinks.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${linkClass} motion-safe:animate-nav-choreo motion-reduce:animate-none`}
                  style={{ animationDelay: `${72 + i * 36}ms` }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="hidden min-w-0 flex-1 md:block" aria-hidden />
        )}

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            {!sessionReady ? (
              <span className="inline-flex h-10 w-40 animate-pulse rounded-xl bg-slate-100" aria-hidden />
            ) : student ? (
              <>
                <Link
                  href="/dashboard"
                  className={`${ctaGhostClass} motion-safe:animate-nav-choreo motion-reduce:animate-none`}
                  style={{ animationDelay: "220ms" }}
                >
                  لوحة التحكم
                </Link>
                <div className="relative" ref={accountRef}>
                  <button
                    type="button"
                    onClick={() => setAccountOpen((v) => !v)}
                    className="motion-safe:animate-nav-choreo motion-reduce:animate-none flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 pe-3 ps-2 text-start shadow-sm transition-[background-color,box-shadow] duration-200 ease-out hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.995] motion-reduce:active:scale-100"
                    style={{ animationDelay: "268ms" }}
                    aria-expanded={accountOpen}
                    aria-haspopup="menu"
                    aria-label="حسابي"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 text-sm font-extrabold text-white">
                      {avatarLetter(student.fullName, student.email)}
                    </span>
                    <span className="flex min-w-0 max-w-[10rem] flex-col leading-tight">
                      <span className="truncate text-sm font-bold text-slate-900">{student.fullName}</span>
                      <span className="truncate text-xs text-slate-500" dir="ltr">
                        {student.email}
                      </span>
                      {walletLabel ? <span className="text-[11px] font-semibold text-brand-700">{walletLabel}</span> : null}
                    </span>
                    <svg className="size-4 shrink-0 text-slate-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {accountOpen ? (
                    <div
                      role="menu"
                      className="absolute end-0 top-full z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
                    >
                      <Link
                        role="menuitem"
                        href="/profile"
                        className="block px-4 py-2.5 text-sm font-semibold text-slate-800 no-underline hover:bg-slate-50"
                        onClick={() => setAccountOpen(false)}
                      >
                        الملف الشخصي
                      </Link>
                      <Link
                        role="menuitem"
                        href="/dashboard#wallet"
                        className="block px-4 py-2.5 text-sm font-semibold text-slate-800 no-underline hover:bg-slate-50"
                        onClick={() => setAccountOpen(false)}
                      >
                        المحفظة
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => void onLogout()}
                        className="w-full px-4 py-2.5 text-start text-sm font-semibold text-red-700 hover:bg-red-50"
                      >
                        تسجيل الخروج
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`${ctaGhostClass} motion-safe:animate-nav-choreo motion-reduce:animate-none`}
                  style={{ animationDelay: "232ms" }}
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  className={`${ctaPrimaryClass} motion-safe:animate-nav-choreo motion-reduce:animate-none`}
                  style={{ animationDelay: "278ms" }}
                >
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="motion-safe:animate-nav-choreo motion-reduce:animate-none inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 transition-[background-color,box-shadow] duration-200 ease-out hover:bg-slate-50 active:scale-[0.98] motion-reduce:active:scale-100 md:hidden"
            style={{ animationDelay: "300ms" }}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
            aria-label={mobileOpen ? "إغلاق القائمة" : "فتح القائمة"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
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

      {mobileOpen ? (
        <div
          id="mobile-nav-menu"
          className="border-b border-slate-200 bg-white shadow-sm md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="قائمة التنقل"
        >
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6 lg:px-8">
              {!hideMarketingNav
                ? navLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-xl px-3 py-3 text-base font-semibold text-slate-800 no-underline hover:bg-slate-50"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))
                : null}
              <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-4">
                {!sessionReady ? (
                  <div className="h-24 animate-pulse rounded-xl bg-slate-100" aria-hidden />
                ) : student ? (
                  <>
                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 text-base font-extrabold text-white">
                        {avatarLetter(student.fullName, student.email)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-slate-900">{student.fullName}</p>
                        <p className="truncate text-xs text-slate-500" dir="ltr">
                          {student.email}
                        </p>
                        {walletLabel ? <p className="mt-0.5 text-xs font-semibold text-brand-700">{walletLabel}</p> : null}
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      className="rounded-xl px-3 py-3 text-center text-base font-semibold text-slate-800 no-underline hover:bg-slate-50"
                      onClick={() => setMobileOpen(false)}
                    >
                      لوحة التحكم
                    </Link>
                    <Link
                      href="/profile"
                      className="rounded-xl px-3 py-3 text-center text-base font-semibold text-slate-800 no-underline hover:bg-slate-50"
                      onClick={() => setMobileOpen(false)}
                    >
                      الملف الشخصي
                    </Link>
                    <Link
                      href="/dashboard#wallet"
                      className="rounded-xl px-3 py-3 text-center text-base font-semibold text-slate-800 no-underline hover:bg-slate-50"
                      onClick={() => setMobileOpen(false)}
                    >
                      المحفظة
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        void onLogout();
                      }}
                      className="rounded-xl bg-slate-900 py-3 text-center text-sm font-semibold text-white"
                    >
                      تسجيل الخروج
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className={`touch-manipulation rounded-xl border border-slate-200/95 bg-white py-3 text-center text-sm font-semibold text-slate-800 no-underline shadow-sm ring-1 ring-transparent transition-[transform,background-color,box-shadow,ring-color] ${navEase} motion-safe:hover:-translate-y-px motion-reduce:hover:translate-y-0 hover:bg-slate-50/98 hover:ring-slate-200/80 hover:shadow-[0_8px_22px_-12px_rgba(15,23,42,0.09)] motion-safe:active:translate-y-0 motion-safe:active:scale-[0.99] motion-reduce:active:scale-100 active:duration-[180ms] ease-out`}
                      onClick={() => setMobileOpen(false)}
                    >
                      تسجيل الدخول
                    </Link>
                    <Link
                      href="/register"
                      className={`touch-manipulation rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 py-3 text-center text-sm font-semibold text-white no-underline shadow-md shadow-brand-500/22 ring-1 ring-white/14 transition-[transform,filter,box-shadow,ring-color] ${navEase} motion-safe:hover:-translate-y-px motion-reduce:hover:translate-y-0 hover:brightness-[1.015] hover:ring-white/22 hover:shadow-[0_10px_30px_-12px_rgba(24,117,245,0.26)] motion-safe:active:translate-y-0 motion-safe:active:scale-[0.989] motion-reduce:active:scale-100 active:duration-[180ms] ease-out active:brightness-[0.992]`}
                      onClick={() => setMobileOpen(false)}
                    >
                      إنشاء حساب
                    </Link>
                  </>
                )}
              </div>
            </div>
        </div>
      ) : null}
    </header>
  );
}
