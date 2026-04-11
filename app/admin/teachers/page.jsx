 "use client";

import { useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminActionButton, AdminBadge, AdminEmptyState, AdminInput, AdminListCard, AdminSectionCard, AdminSelect, AdminToolbar } from "@/components/admin/AdminUI";
import { useDemoSection } from "@/lib/demo-store";

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useDemoSection("teachers");
  const [packages] = useDemoSection("packages");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [newTeacher, setNewTeacher] = useState("");

  const rows = useMemo(() => {
    return teachers
      .map((teacher, idx) => ({
        ...teacher,
        active: teacher.active ?? idx !== 2,
        assignedPackages: (packages || []).filter((pkg) => pkg.teacherId === teacher.id),
      }))
      .filter((teacher) => {
        const target = `${teacher.name} ${teacher.specialization}`.toLowerCase();
        const matchesQuery = target.includes(query.trim().toLowerCase());
        const matchesStatus = statusFilter === "الكل" || (statusFilter === "نشط" ? teacher.active : !teacher.active);
        return matchesQuery && matchesStatus;
      });
  }, [teachers, packages, query, statusFilter]);

  return (
    <AdminShell title="إدارة الأساتذة" subtitle="متابعة ملفات الأساتذة وتخصصاتهم ومساراتهم في الأدب العربي.">
      <AdminSectionCard title="فريق التدريس" subtitle="إدارة بيانات الأساتذة وتفعيلهم داخل المنصة.">
        <AdminToolbar>
          <AdminInput
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن أستاذ..."
          />
          <AdminSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>الكل</option>
            <option>نشط</option>
            <option>غير نشط</option>
          </AdminSelect>
          <div className="flex gap-2">
            <AdminInput value={newTeacher} onChange={(e) => setNewTeacher(e.target.value)} placeholder="اسم أستاذ جديد" className="min-w-[180px]" />
            <AdminActionButton
              onClick={() => {
                const name = newTeacher.trim();
                if (!name) return;
                setTeachers([...(teachers || []), { id: `teacher-${Date.now()}`, name, specialization: "تخصص أدبي", bio: "نبذة مختصرة", active: true, assignedCourseIds: [] }]);
                setNewTeacher("");
              }}
              tone="primary"
              className="rounded-xl px-4 py-2 text-sm font-bold"
            >
              إضافة أستاذ
            </AdminActionButton>
          </div>
        </AdminToolbar>

        {!rows.length ? (
          <AdminEmptyState title="لا يوجد أساتذة مطابقون" description="أضف أستاذًا جديدًا أو عدّل البحث." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {rows.map((teacher) => (
              <AdminListCard key={teacher.id} className="rounded-2xl p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{teacher.name}</h2>
                  <AdminBadge tone={teacher.active ? "success" : "slate"}>{teacher.active ? "نشط" : "غير نشط"}</AdminBadge>
                </div>
                <p className="mt-1 text-sm text-brand-700">{teacher.specialization}</p>
                <p className="mt-3 text-sm text-slate-600">{teacher.bio}</p>
                <p className="mt-3 text-xs text-slate-500">الباقات المسندة: {teacher.assignedPackages.length}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <AdminActionButton onClick={() => setTeachers((teachers || []).map((row) => (row.id === teacher.id ? { ...row, specialization: "البلاغة العربية" } : row)))}>تعديل</AdminActionButton>
                  <AdminActionButton onClick={() => setTeachers((teachers || []).map((row) => (row.id === teacher.id ? { ...row, active: !row.active } : row)))}>{teacher.active ? "إيقاف" : "تفعيل"}</AdminActionButton>
                  <AdminActionButton onClick={() => setTeachers((teachers || []).filter((row) => row.id !== teacher.id))} tone="danger">حذف</AdminActionButton>
                </div>
              </AdminListCard>
            ))}
          </div>
        )}
      </AdminSectionCard>
    </AdminShell>
  );
}
