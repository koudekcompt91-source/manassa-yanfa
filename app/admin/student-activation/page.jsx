"use client";

import { useCallback, useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import {
  AdminActionButton,
  AdminBadge,
  AdminEmptyState,
  AdminInput,
  AdminSectionCard,
  AdminToolbar,
} from "@/components/admin/AdminUI";

/**
 * Admin: activate PAID students with status PENDING.
 */
export default function AdminStudentActivationPage() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState("");
  const [error, setError] = useState("");
  const [banner, setBanner] = useState("");

  const load = useCallback(async (emailQuery = "") => {
    setLoading(true);
    setError("");
    try {
      const qs = emailQuery.trim() ? `?email=${encodeURIComponent(emailQuery.trim())}` : "";
      const res = await fetch(`/api/admin/student-activation${qs}`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setUsers([]);
        setError(data?.message || "تعذّر تحميل الحسابات المعلّقة.");
        return;
      }
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch {
      setUsers([]);
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onSearch(e) {
    e.preventDefault();
    setBanner("");
    await load(email);
  }

  async function activateStudent(id) {
    if (!id || activatingId) return;
    setActivatingId(id);
    setError("");
    setBanner("");
    try {
      const res = await fetch(`/api/admin/student-activation/${encodeURIComponent(id)}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.message || "تعذّر تفعيل الحساب.");
        return;
      }
      setBanner(data.message || "تم تفعيل الحساب.");
      await load(email);
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setActivatingId("");
    }
  }

  return (
    <AdminShell
      title="تفعيل حسابات الطلاب"
      subtitle="الطلاب المدفوعون بحالة PENDING فقط — التفعيل يمنحهم وصول لوحة الحساب الكامل."
    >
      <AdminSectionCard title="الحسابات بانتظار التفعيل" subtitle="بحث server-side بالبريد الإلكتروني.">
        <form onSubmit={onSearch}>
          <AdminToolbar>
            <AdminInput
              type="search"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ابحث بالبريد الإلكتروني"
              dir="ltr"
            />
            <AdminActionButton type="submit" tone="primary">
              بحث
            </AdminActionButton>
            <AdminActionButton
              type="button"
              onClick={() => {
                setEmail("");
                setBanner("");
                load("");
              }}
            >
              عرض الكل
            </AdminActionButton>
          </AdminToolbar>
        </form>

        {banner ? (
          <p className="mb-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{banner}</p>
        ) : null}
        {error ? <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

        <p className="mb-4 text-xs text-slate-500">عدد النتائج: {users.length}</p>

        {loading ? <p className="text-sm text-slate-500">جاري التحميل…</p> : null}
        {!loading && !users.length ? (
          <AdminEmptyState
            title="لا توجد حسابات معلّقة"
            description="عندما يسجّل طالب PAID سيظهر هنا حتى يتم التفعيل."
          />
        ) : null}

        {!loading && users.length ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-right text-xs font-semibold text-slate-500">
                  <th className="px-4 py-3">الاسم الكامل</th>
                  <th className="px-3 py-3">البريد</th>
                  <th className="px-3 py-3">المستوى</th>
                  <th className="px-3 py-3">تاريخ التسجيل</th>
                  <th className="px-3 py-3">الحالة</th>
                  <th className="px-4 py-3">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {users.map((student) => (
                  <tr key={student.id} className="border-b border-slate-100 text-slate-700">
                    <td className="px-4 py-3 font-semibold text-slate-900">{student.fullName}</td>
                    <td className="px-3 py-3 text-xs md:text-sm" dir="ltr">
                      {student.email}
                    </td>
                    <td className="px-3 py-3 text-xs">{student.levelLabel || "—"}</td>
                    <td className="px-3 py-3 text-xs">
                      {student.createdAt ? new Date(student.createdAt).toLocaleString("ar-DZ") : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <AdminBadge tone="warning">بانتظار التفعيل</AdminBadge>
                    </td>
                    <td className="px-4 py-3">
                      <AdminActionButton
                        type="button"
                        tone="primary"
                        disabled={activatingId === student.id}
                        onClick={() => activateStudent(student.id)}
                      >
                        {activatingId === student.id ? "جاري التفعيل…" : "تفعيل الحساب"}
                      </AdminActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </AdminSectionCard>
    </AdminShell>
  );
}
