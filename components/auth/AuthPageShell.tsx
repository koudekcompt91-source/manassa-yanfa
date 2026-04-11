import Link from "next/link";
import type { ReactNode } from "react";

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
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-base font-bold text-slate-900 shadow-sm transition hover:border-brand-200 hover:shadow-md"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-sm font-extrabold text-white shadow-sm">
          م
        </span>
        منصة ينفع
      </Link>

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
