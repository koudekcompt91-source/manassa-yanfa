 "use client";

import { useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminBadge, AdminCard, AdminEmptyState, AdminInput, AdminSelect } from "@/components/admin/AdminUI";
import { useDemoSection } from "@/lib/demo-store";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useDemoSection("announcements");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("الكل");
  const [placementFilter, setPlacementFilter] = useState("الكل");
  const [newMessage, setNewMessage] = useState("");

  const rows = useMemo(
    () =>
      (messages || []).filter((message) => {
        const matchesQuery = message.title.includes(query.trim());
        const matchesType = typeFilter === "الكل" || message.type === typeFilter;
        const matchesPlacement = placementFilter === "الكل" || message.placement === placementFilter;
        return matchesQuery && matchesType && matchesPlacement;
      }),
    [messages, query, typeFilter, placementFilter]
  );

  return (
    <AdminShell title="الرسائل" subtitle="إدارة رسائل الطلاب والزوار الخاصة بالمنصة والمسارات الأدبية.">
      <AdminCard title="الإعلانات والرسائل" subtitle="إدارة الرسائل المعروضة في الصفحة الرئيسية واللوحة والدورات.">
        <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
          <AdminInput
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن رسالة..."
          />
          <AdminSelect value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option>الكل</option>
            <option value="success">success</option>
            <option value="warning">warning</option>
            <option value="info">info</option>
            <option value="urgent">urgent</option>
          </AdminSelect>
          <AdminSelect value={placementFilter} onChange={(e) => setPlacementFilter(e.target.value)}>
            <option>الكل</option>
            <option value="homepage">homepage</option>
            <option value="dashboard">dashboard</option>
            <option value="courses">courses</option>
            <option value="global">global</option>
          </AdminSelect>
          <div className="flex gap-2">
            <AdminInput value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="رسالة جديدة" className="min-w-[180px]" />
            <button
              onClick={() => {
                const title = newMessage.trim();
                if (!title) return;
                setMessages([...(messages || []), { id: `msg-${Date.now()}`, title, type: "info", placement: "global" }]);
                setNewMessage("");
              }}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white"
            >
              إنشاء رسالة
            </button>
          </div>
        </div>
        {!rows.length ? (
          <AdminEmptyState title="لا توجد رسائل مطابقة" description="عدّل المرشحات أو أضف رسالة جديدة." />
        ) : (
          <div className="space-y-2">
            {rows.map((message) => (
              <article key={message.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <p className="font-semibold text-slate-900">{message.title}</p>
                <p className="mt-1 text-slate-600">النوع: <AdminBadge tone={message.type === "urgent" ? "warning" : message.type === "success" ? "success" : "brand"}>{message.type}</AdminBadge> - الموضع: <AdminBadge>{message.placement}</AdminBadge></p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => setMessages((messages || []).map((row) => (row.id === message.id ? { ...row, type: row.type === "info" ? "success" : "info" } : row)))} className="rounded-lg border border-slate-200 px-2 py-1 text-xs">تبديل النوع</button>
                  <button onClick={() => setMessages((messages || []).filter((row) => row.id !== message.id))} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700">حذف</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </AdminCard>
    </AdminShell>
  );
}
