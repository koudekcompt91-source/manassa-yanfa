"use client";

import { Gamepad2, Lock } from "lucide-react";

/** Section 4 — الألعاب. Always last. Locked placeholder only. */
export default function FreeLockedSection() {
  return (
    <section
      aria-label="الألعاب"
      className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 sm:p-6"
    >
      <div id="games" className="mb-5 flex scroll-mt-24 items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <Gamepad2 className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">الألعاب</h2>
      </div>
      <div
        className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center"
        aria-disabled="true"
      >
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
          <Lock className="h-5 w-5" />
        </span>
        <p className="text-base font-extrabold text-slate-700">الألعاب التعليمية</p>
        <p className="mt-2 text-sm font-semibold text-slate-500">مقفل — قريبًا</p>
      </div>
    </section>
  );
}
