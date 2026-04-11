 "use client";

import { useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminBadge, AdminCard, AdminEmptyState, AdminInput } from "@/components/admin/AdminUI";
import { useDemoSection } from "@/lib/demo-store";

export default function AdminButtonsPage() {
  const [buttonPresets, setButtonPresets] = useDemoSection("ctaButtons");
  const [query, setQuery] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const rows = useMemo(() => (buttonPresets || []).filter((row) => row.label.includes(query.trim())), [buttonPresets, query]);

  return (
    <AdminShell title="إدارة الأزرار" subtitle="ضبط أنماط الأزرار الأساسية في المنصة والحفاظ على الهوية البصرية.">
      <AdminCard title="CTA Buttons" subtitle="التحكم في تسمية الأزرار ووجهتها وإظهارها">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <AdminInput
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن زر..."
            className="sm:max-w-xs"
          />
          <div className="flex gap-2">
            <AdminInput value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="تسمية زر" className="min-w-[180px]" />
            <button
              onClick={() => {
                const label = newLabel.trim();
                if (!label) return;
                setButtonPresets([...(buttonPresets || []), { id: `btn-${Date.now()}`, label, route: "/packages", visible: true, variant: "secondary", placement: "homepage" }]);
                setNewLabel("");
              }}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white"
            >
              إضافة زر
            </button>
          </div>
        </div>
        {!rows.length ? (
          <AdminEmptyState title="لا توجد أزرار مطابقة" description="أضف زرًا جديدًا أو عدّل البحث." />
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <p className="font-bold text-slate-900">{row.label}</p>
                <p className="mt-1 text-slate-600">الوجهة: {row.route}</p>
                <p className="text-slate-600">النوع: <AdminBadge tone={row.variant === "primary" ? "brand" : "slate"}>{row.variant}</AdminBadge></p>
                <p className="mt-1 text-xs text-slate-500">الظهور: {row.visible ? "ظاهر" : "مخفي"}</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => setButtonPresets((buttonPresets || []).map((b) => (b.id === row.id ? { ...b, visible: !b.visible } : b)))} className="rounded-lg border border-slate-200 px-2 py-1 text-xs">{row.visible ? "إخفاء" : "إظهار"}</button>
                  <button onClick={() => setButtonPresets((buttonPresets || []).map((b) => (b.id === row.id ? { ...b, variant: b.variant === "primary" ? "secondary" : "primary" } : b)))} className="rounded-lg border border-slate-200 px-2 py-1 text-xs">تبديل النوع</button>
                  <button onClick={() => setButtonPresets((buttonPresets || []).filter((b) => b.id !== row.id))} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700">حذف</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </AdminShell>
  );
}
