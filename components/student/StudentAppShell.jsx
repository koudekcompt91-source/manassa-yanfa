"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { recordDailyLogin } from "@/lib/student-progress";
import { formatDzd } from "@/lib/format-money";
import BrandLogoMark from "@/components/brand/BrandLogoMark";
import { BRAND_NAME } from "@/lib/brand";
import {
  Bell,
  BookOpen,
  Award,
  Home,
  UserRound,
  Wallet,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "الرئيسية", id: "home", Icon: Home },
  { href: "/dashboard#my-courses", label: "دوراتي", id: "my-courses", Icon: BookOpen },
  { href: "/courses", label: "الدورات", id: "explore", Icon: BookOpen },
  { href: "/dashboard#wallet", label: "المحفظة", id: "wallet", Icon: Wallet },
  { href: "/dashboard/notifications", label: "الإشعارات", id: "notifications", Icon: Bell },
  { href: "/dashboard/certificates", label: "الشهادات", id: "certificates", Icon: Award },
  { href: "/profile", label: "حسابي", id: "account", Icon: UserRound },
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
  if (item.id === "certificates") return pathname === "/dashboard/certificates" || pathname.startsWith("/dashboard/certificates/");
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
              className={`interactive-tab touch-target flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start text-sm font-semibold no-underline transition ${
                active
                  ? "bg-gradient-to-l from-brand-600 to-indigo-600 text-white shadow-md"
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
    <div className="premium-app-bg relative isolate flex min-h-0 w-full min-w-0 flex-1 flex-col bg-gray-50">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2.5 md:hidden">
        <span className="text-sm font-extrabold text-slate-900">القائمة</span>
        <button
          type="button"
          className="touch-button-secondary px-3 py-2 text-sm font-bold text-slate-800"
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
