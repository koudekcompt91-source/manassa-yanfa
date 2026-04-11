"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminEmptyState, AdminInput, AdminSectionCard, AdminToolbar } from "@/components/admin/AdminUI";
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

        {loading ? <p className="text-sm text-slate-600">جاري التحميل…</p> : null}
        {!loading && !rows.length ? (
          <AdminEmptyState title="لا يوجد طلاب" description="سجّل طلاب جدد من واجهة التسجيل العامة." />
        ) : null}
        {!loading && rows.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-right text-slate-500">
                  <th className="px-3 py-2">الاسم</th>
                  <th className="px-3 py-2">البريد</th>
                  <th className="px-3 py-2">المستوى (عربي)</th>
                  <th className="px-3 py-2">رمز المستوى</th>
                  <th className="px-3 py-2">الهاتف</th>
                  <th className="px-3 py-2">رصيد المحفظة</th>
                  <th className="px-3 py-2">التسجيلات</th>
                  <th className="px-3 py-2">الحالة</th>
                  <th className="px-3 py-2">تاريخ الإنشاء</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((student) => (
                  <tr key={student.id} className="border-b border-slate-100 text-slate-700">
                    <td className="px-3 py-2 font-semibold">{student.fullName}</td>
                    <td className="px-3 py-2">{student.email}</td>
                    <td className="px-3 py-2 text-xs">{student.academicLevel || "—"}</td>
                    <td className="px-3 py-2 font-mono text-xs">{student.level || "—"}</td>
                    <td className="px-3 py-2">{student.phone || "—"}</td>
                    <td className="px-3 py-2">{formatDzd(student.walletBalance)}</td>
                    <td className="px-3 py-2">{student.enrollmentsCount}</td>
                    <td className="px-3 py-2">{student.status === "ACTIVE" ? "نشط" : "معطّل"}</td>
                    <td className="px-3 py-2 text-xs">{student.createdAt ? new Date(student.createdAt).toLocaleDateString("ar-DZ") : "—"}</td>
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
