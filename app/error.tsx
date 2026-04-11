"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-8 shadow-card">
        <h1 className="text-2xl font-extrabold text-slate-900">حدث خطأ غير متوقع</h1>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          نعتذر، حدث خلل مؤقت أثناء تحميل الصفحة. يمكنك المحاولة مرة أخرى الآن.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition hover:opacity-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
