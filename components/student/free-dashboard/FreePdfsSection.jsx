"use client";

import { FileText } from "lucide-react";

/** SECTION 3 — documents only. Hidden when empty. */
export default function FreePdfsSection({ pdfs }) {
  const list = (Array.isArray(pdfs) ? pdfs : []).filter((p) => p?.url);
  if (!list.length) return null;

  return (
    <section
      aria-label="المستندات"
      className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 sm:p-6"
    >
      <div id="pdfs" className="mb-5 flex scroll-mt-24 items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <FileText className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">المستندات</h2>
      </div>

      <ul className="flex flex-col gap-3">
        {list.map((pdf, index) => (
          <li key={pdf?.id ?? index}>
            <a
              href={pdf?.url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-4 text-sm font-bold text-slate-800 shadow-sm transition hover:border-brand-300 hover:bg-brand-50/40"
            >
              <span className="inline-flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-red-600" />
                <span className="truncate">{pdf?.title ?? "مستند"}</span>
              </span>
              <span className="shrink-0 text-xs font-extrabold text-brand-700">فتح</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
