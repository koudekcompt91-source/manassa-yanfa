"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function LessonLockedModal({ open, onClose, packageSlug }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;
  const href = packageSlug ? `/packages/${packageSlug}` : "/packages";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lock-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute end-3 top-3 rounded-lg p-1 text-slate-500 hover:bg-slate-100" aria-label="إغلاق">
          ✕
        </button>
        <h2 id="lock-title" className="text-lg font-extrabold leading-snug text-slate-900">
          🔒 هذا الدرس ضمن دورة مدفوعة
        </h2>
        <p className="mt-3 text-sm font-semibold text-slate-800">اشترك الآن للوصول الكامل</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          افتح جميع الدروس المميزة، تابع مسارك بلا انقطاع، واحصل على تحديثات المحتوى.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link
            href={href}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-4 py-3 text-center text-sm font-extrabold text-white no-underline shadow-lg shadow-brand-500/25 transition hover:opacity-95"
            onClick={onClose}
          >
            🔥 اشترك الآن
          </Link>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
            لاحقًا
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
