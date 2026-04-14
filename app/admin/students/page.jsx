"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminBadge, AdminEmptyState, AdminInput, AdminSectionCard, AdminToolbar } from "@/components/admin/AdminUI";
import { formatDzd } from "@/lib/format-money";

export default function AdminStudentsPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      const data = await res.json();
      if (data.ok) setUsers(data.users || []);
    } catch {
      setUsers([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (users || []).filter((u) => {
      const t = `${u.fullName} ${u.email} ${u.academicLevel || ""} ${u.level || ""}`.toLowerCase();
      return !q || t.includes(q);
    });
  }, [users, query]);

  return (
    <AdminShell title="إدارة الطلاب" subtitle="قائمة حسابات الطلاب من قاعدة البيانات (مصادقة حقيقية).">
      <AdminSectionCard title="قائمة الطلاب" subtitle="بحث بالاسم أو البريد — للقراءة من الخادم.">
        <AdminToolbar>
          <AdminInput
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث باسم الطالب أو البريد..."
          />
        </AdminToolbar>
        <p className="mb-4 text-xs text-slate-500">إجمالي النتائج: {rows.length}</p>

        {loading ? <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">جاري تحميل بيانات الطلاب...</p> : null}
        {!loading && !rows.length ? (
          <AdminEmptyState title="لا يوجد طلاب" description="سجّل طلاب جدد من واجهة التسجيل العامة." />
        ) : null}
        {!loading && rows.length ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-right text-xs font-semibold tracking-wide text-slate-500">
                  <th className="px-4 py-3">الاسم</th>
                  <th className="px-3 py-3">البريد</th>
                  <th className="px-3 py-3">المستوى (عربي)</th>
                  <th className="px-3 py-3">رمز المستوى</th>
                  <th className="px-3 py-3">الهاتف</th>
                  <th className="px-3 py-3">رصيد المحفظة</th>
                  <th className="px-3 py-3">التسجيلات</th>
                  <th className="px-3 py-3">الحالة</th>
                  <th className="px-4 py-3">تاريخ الإنشاء</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((student) => (
                  <tr key={student.id} className="border-b border-slate-100 text-slate-700 transition hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{student.fullName}</td>
                    <td className="px-3 py-3 text-xs md:text-sm">{student.email}</td>
                    <td className="px-3 py-3 text-xs">{student.academicLevel || "—"}</td>
                    <td className="px-3 py-3 font-mono text-xs">{student.level || "—"}</td>
                    <td className="px-3 py-3">{student.phone || "—"}</td>
                    <td className="px-3 py-3 font-semibold">{formatDzd(student.walletBalance)}</td>
                    <td className="px-3 py-3">{student.enrollmentsCount}</td>
                    <td className="px-3 py-3">
                      <AdminBadge tone={student.status === "ACTIVE" ? "success" : "warning"}>{student.status === "ACTIVE" ? "نشط" : "معطّل"}</AdminBadge>
                    </td>
                    <td className="px-4 py-3 text-xs">{student.createdAt ? new Date(student.createdAt).toLocaleDateString("ar-DZ") : "—"}</td>
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
