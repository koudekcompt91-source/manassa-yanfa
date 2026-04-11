"use client";

import { useCallback, useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminBadge, AdminCard, AdminEmptyState } from "@/components/admin/AdminUI";
import { paymentMethodLabels } from "@/components/student/RechargeWalletModal";
import { formatDzd } from "@/lib/format-money";

const statusLabels = {
  pending: "قيد المراجعة",
  approved: "مقبول",
  rejected: "مرفوض",
};

function statusTone(s) {
  if (s === "approved") return "success";
  if (s === "rejected") return "warning";
  return "slate";
}

export default function AdminRechargeRequestsPage() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/recharge-requests", { credentials: "include" });
      const data = await res.json();
      if (data.ok) setRows(data.requests || []);
      else setMsg(data.message || "تعذّر التحميل.");
    } catch {
      setMsg("تعذّر التحميل.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onApprove(id) {
    setMsg("");
    const res = await fetch(`/api/admin/recharge-requests/${id}/approve`, { method: "POST", credentials: "include" });
    const data = await res.json();
    if (!res.ok || !data.ok) setMsg(data.message || "تعذّر القبول.");
    await load();
  }

  async function onReject(id) {
    const note = typeof window !== "undefined" ? window.prompt("سبب الرفض (اختياري)", "") : "";
    if (note === null) return;
    setMsg("");
    const res = await fetch(`/api/admin/recharge-requests/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ note: note || "" }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) setMsg(data.message || "تعذّر الرفض.");
    await load();
  }

  return (
    <AdminShell title="طلبات الشحن" subtitle="مراجعة طلبات شحن رصيد الطلاب والموافقة أو الرفض.">
      <AdminCard title="قائمة طلبات الشحن" subtitle="كل الطلبات مرتبة من الأحدث. الموافقة تضيف الرصيد مرة واحدة فقط.">
        {msg ? <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{msg}</p> : null}
        {loading ? <p className="text-sm text-slate-600">جاري التحميل…</p> : null}
        {!loading && !rows.length ? (
          <AdminEmptyState title="لا توجد طلبات" description="سيظهر هنا طلبات الشحن عند إرسالها من لوحة الطالب." />
        ) : null}
        {!loading && rows.length ? (
          <div className="space-y-4">
            {rows.map((req) => (
              <article key={req.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900">{req.user?.fullName || req.userId}</p>
                    <p className="text-xs text-slate-500">{req.user?.email}</p>
                    <p className="mt-1 text-slate-600">
                      {paymentMethodLabels[req.paymentMethod] || req.paymentMethod} — {formatDzd(req.amount)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {req.firstName} {req.lastName} — {req.wilaya} / {req.baladiya} — {req.phone}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      التاريخ: {req.createdAt ? new Date(req.createdAt).toLocaleString("ar-DZ") : "-"}
                    </p>
                    {req.note ? <p className="mt-1 text-xs text-slate-600">ملاحظة الطالب: {req.note}</p> : null}
                    {req.status === "rejected" && req.rejectionNote ? (
                      <p className="mt-1 text-xs text-red-700">سبب الرفض: {req.rejectionNote}</p>
                    ) : null}
                  </div>
                  <AdminBadge tone={statusTone(req.status)}>{statusLabels[req.status] || req.status}</AdminBadge>
                </div>
                {req.receiptImage ? (
                  <div className="mt-3">
                    <p className="mb-1 text-xs font-semibold text-slate-600">صورة الإيصال</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={req.receiptImage} alt="إيصال" className="max-h-48 max-w-full rounded-lg border border-slate-200 object-contain" />
                  </div>
                ) : null}
                {req.status === "pending" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => onApprove(req.id)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">
                      قبول وإضافة الرصيد
                    </button>
                    <button type="button" onClick={() => onReject(req.id)} className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-bold text-red-800">
                      رفض
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </AdminCard>
    </AdminShell>
  );
}
