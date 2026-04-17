import Link from "next/link";
import type { ReactNode } from "react";
import BrandLogoMark from "@/components/brand/BrandLogoMark";
import { BRAND_NAME } from "@/lib/brand";

type AuthPageShellProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
};

const inputFocus =
  "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25";

export { inputFocus };

export default function AuthPageShell({ children, title, subtitle }: AuthPageShellProps) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 px-4 py-8">
      <div className="mb-8 flex w-full max-w-md flex-col items-center gap-4 text-center">
        <Link
          href="/"
          aria-label={BRAND_NAME}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm transition hover:border-brand-200 hover:shadow-md"
        >
          <BrandLogoMark variant="authFocal" showWordmark priority />
        </Link>
        <Link
          href="/"
          className="text-sm font-semibold text-brand-700 no-underline transition hover:text-brand-800 hover:underline"
        >
          ← العودة للرئيسية
        </Link>
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">{subtitle}</p> : null}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">{children}</div>
      </div>
    </div>
  );
}
