"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import BrandLogoMark from "@/components/brand/BrandLogoMark";
import { BRAND_NAME } from "@/lib/brand";
import { BookOpen, FileText, Gamepad2, Home, Lock, LogOut, UserRound } from "lucide-react";

const NAV = [
  { href: "/free-dashboard", label: "الرئيسية", id: "home", Icon: Home },
  { href: "/free-dashboard#courses", label: "الدورات", id: "courses", Icon: BookOpen },
  { href: "/free-dashboard#documents", label: "المستندات", id: "documents", Icon: FileText },
  { href: "/free-dashboard#games", label: "الألعاب", id: "games", Icon: Gamepad2 },
  { href: "/profile", label: "حسابي", id: "account", Icon: UserRound },
];

function avatarLetter(fullName, email) {
  const s = (fullName || email || "?").trim();
  return s ? s.charAt(0) : "?";
}

export default function FreeStudentShell({ children }) {
  const [user, setUser] = useState(null);

  const load = useCallback(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.role === "STUDENT") setUser(data.user);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      /* ignore */
    }
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" dir="rtl">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/free-dashboard" className="flex items-center gap-2.5">
            <BrandLogoMark className="h-9 w-9" />
            <div>
              <p className="text-sm font-extrabold text-slate-900">{BRAND_NAME}</p>
              <p className="text-[11px] font-semibold text-emerald-700">حساب مجاني</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <span className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 sm:inline-flex">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[11px] font-black text-white">
                  {avatarLetter(user.fullName, user.email)}
                </span>
                {user.fullName}
              </span>
            ) : null}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              خروج
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6">
          {NAV.map((item) => {
            const Icon = item.Icon;
            const locked = item.id === "games";
            return (
              <a
                key={item.id}
                href={item.href}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                  locked
                    ? "cursor-not-allowed text-slate-400"
                    : "text-slate-700 hover:bg-brand-50 hover:text-brand-800"
                }`}
                onClick={(e) => {
                  if (locked) e.preventDefault();
                }}
                aria-disabled={locked || undefined}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
                {locked ? <Lock className="h-3 w-3" /> : null}
              </a>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
