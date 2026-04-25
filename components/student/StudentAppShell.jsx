"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { recordDailyLogin } from "@/lib/student-progress";
import { formatDzd } from "@/lib/format-money";
import BrandLogoMark from "@/components/brand/BrandLogoMark";
import { BRAND_NAME } from "@/lib/brand";

function IconHome({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}
function IconBooks({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}
function IconExplore({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
function IconWallet({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}
function IconUser({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
function IconBell({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

const NAV = [
  { href: "/dashboard", label: "الرئيسية", id: "home", Icon: IconHome },
  { href: "/dashboard#my-courses", label: "دوراتي", id: "my-courses", Icon: IconBooks },
  { href: "/courses", label: "الدورات", id: "explore", Icon: IconExplore },
  { href: "/dashboard#wallet", label: "المحفظة", id: "wallet", Icon: IconWallet },
  { href: "/dashboard/notifications", label: "الإشعارات", id: "notifications", Icon: IconBell },
  { href: "/profile", label: "حسابي", id: "account", Icon: IconUser },
];

function useHash() {
  const [hash, setHash] = useState("");
  useEffect(() => {
    const read = () => setHash(typeof window !== "undefined" ? window.location.hash || "" : "");
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  return hash;
}

function navActive(pathname, hash, item) {
  if (item.id === "explore")
    return pathname === "/courses" || pathname.startsWith("/courses/") || pathname === "/packages" || pathname.startsWith("/packages/");
  if (item.id === "account") return pathname.startsWith("/profile");
  if (item.id === "home") return pathname === "/dashboard" && (!hash || hash === "#");
  if (item.id === "my-courses") return pathname === "/dashboard" && (hash === "#my-courses" || hash === "#my-packages");
  if (item.id === "wallet") return pathname === "/dashboard" && hash === "#wallet";
  if (item.id === "notifications") return pathname === "/dashboard/notifications";
  return false;
}

function isStudentLockedRoute(pathname) {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/")
  );
}

function isPackagesRoute(pathname) {
  return (
    pathname === "/packages" ||
    pathname.startsWith("/packages/") ||
    pathname === "/courses" ||
    pathname.startsWith("/courses/")
  );
}

function avatarLetter(fullName, email) {
  const s = (fullName || email || "?").trim();
  return s ? s.charAt(0) : "?";
}

export default function StudentAppShell({ children }) {
  const pathname = usePathname() || "";
  const hash = useHash();
  const [session, setSession] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const lockedStudentPath = isStudentLockedRoute(pathname);
  const packagesPath = isPackagesRoute(pathname);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        setSession({ user: data?.user ?? null });
        const r = data?.user?.role ?? "";
        if (r === "STUDENT") {
          try {
            recordDailyLogin();
          } catch {
            /* ignore */
          }
        }
      } catch {
        if (!cancelled) setSession({ user: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname, hash]);

  const role = session?.user?.role ?? "";
  const isStudent = role === "STUDENT";
  const sessionResolved = session !== null;
  const sessionLoading = !sessionResolved;

  const useShellLayout = lockedStudentPath || (packagesPath && isStudent);

  const user = session?.user;
  const walletNum = Number(user?.walletBalance);
  const walletRounded = Number.isFinite(walletNum) && walletNum >= 0 ? Math.round(walletNum) : 0;

  const renderNav = useCallback(
    (onPick) => (
      <nav className="flex flex-col gap-2 p-4" aria-label="تنقل لوحة الطالب">
        {NAV.map((n) => {
          const active = navActive(pathname, hash, n);
          const isHash = n.href.includes("#");
          const Icon = n.Icon;
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => onPick?.()}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start text-sm font-semibold no-underline transition ${
                active
                  ? "bg-brand-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
                aria-hidden
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                {n.label}
                {isHash ? (
                  <span className={`ms-1 text-[10px] font-medium ${active ? "text-white/70" : "text-slate-400"}`}>↓</span>
                ) : null}
              </span>
            </Link>
          );
        })}
      </nav>
    ),
    [hash, pathname]
  );

  const sidebarBrand = (
    <div className="shrink-0 border-b border-slate-100 bg-white px-4 py-5">
      <Link
        href="/"
        aria-label={BRAND_NAME}
        className="flex flex-col items-center justify-center no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-xl"
      >
        <BrandLogoMark variant="footer" showWordmark className="justify-center" />
      </Link>
    </div>
  );

  const sidebarStudentCard =
    user && isStudent ? (
      <div className="mx-4 mb-3 rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 text-sm font-extrabold text-white">
            {avatarLetter(user.fullName, user.email)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-slate-900">{(user.fullName || "").trim() || "طالب"}</p>
            <p className="mt-0.5 text-xs font-bold text-brand-700 tabular-nums">{formatDzd(walletRounded)}</p>
          </div>
        </div>
      </div>
    ) : lockedStudentPath && sessionLoading ? (
      <div className="mx-4 mb-3 h-[4.5rem] animate-pulse rounded-xl bg-slate-100" aria-hidden />
    ) : lockedStudentPath && sessionResolved && !isStudent ? (
      <div className="mx-4 mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-950">
        لم نتمكن من تأكيد صلاحية الطالب.{" "}
        <Link href="/login" className="font-bold text-brand-800 underline">
          تسجيل الدخول
        </Link>
      </div>
    ) : null;

  const sidebarInner = (
    <>
      {sidebarBrand}
      {sidebarStudentCard}
      <div className="pb-4">{renderNav(() => setMobileNavOpen(false))}</div>
    </>
  );

  if (!useShellLayout) {
    return <div className="min-h-0 w-full min-w-0 flex-1">{children}</div>;
  }

  return (
    <div className="relative isolate flex min-h-0 w-full min-w-0 flex-1 flex-col bg-gray-50">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-2 py-2 md:hidden">
        <span className="text-sm font-extrabold text-slate-900">القائمة</span>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800"
          aria-label={mobileNavOpen ? "إخفاء القائمة" : "فتح القائمة"}
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen((o) => !o)}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            {mobileNavOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <div className="flex min-h-0 w-full flex-1 flex-col md:flex-row">
        <aside
          className={`relative z-0 w-full shrink-0 border-slate-200 bg-white md:w-[260px] md:border-e ${mobileNavOpen ? "block border-b" : "hidden border-b md:block"}`}
          aria-label="القائمة الجانبية"
        >
          {sidebarInner}
        </aside>

        <main className="relative z-10 min-h-0 min-w-0 flex-1">
          <div className="relative z-10 mx-auto min-h-0 w-full min-w-0 max-w-6xl py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
