 "use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import {
  AdminActionButton,
  AdminBadge,
  AdminEmptyState,
  AdminFormField,
  AdminInput,
  AdminListCard,
  AdminSectionCard,
  AdminSelect,
  AdminToolbar,
} from "@/components/admin/AdminUI";
import { useDemoSection } from "@/lib/demo-store";

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [packages] = useDemoSection("packages");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [banner, setBanner] = useState({ type: "", text: "" });

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/admin/teachers", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        const message = data?.message || "تعذّر تحميل قائمة الأساتذة.";
        console.error("[admin-teachers][load] failed:", message);
        setLoadError(message);
        setTeachers([]);
        return;
      }
      setTeachers(Array.isArray(data.teachers) ? data.teachers : []);
    } catch (e) {
      const message = "حدث خطأ أثناء تحميل الأساتذة.";
      console.error("[admin-teachers][load] exception:", e);
      setLoadError(message);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const rows = useMemo(() => {
    return (teachers || [])
      .map((teacher) => ({
        ...teacher,
        name: teacher.fullName,
        specialization: "أستاذ",
        bio: teacher.phone ? `الهاتف: ${teacher.phone}` : `البريد: ${teacher.email}`,
        active: teacher.status === "ACTIVE",
        assignedPackages: (packages || []).filter((pkg) => pkg.teacherId === teacher.id),
      }))
      .filter((teacher) => {
        const target = `${teacher.name} ${teacher.specialization}`.toLowerCase();
        const matchesQuery = target.includes(query.trim().toLowerCase());
        const matchesStatus = statusFilter === "الكل" || (statusFilter === "نشط" ? teacher.active : !teacher.active);
        return matchesQuery && matchesStatus;
      });
  }, [teachers, packages, query, statusFilter]);

  async function handleCreateTeacher(e) {
    e.preventDefault();
    setSubmitError("");
    setSubmitLoading(true);
    setBanner({ type: "", text: "" });
    try {
      const res = await fetch("/api/admin/teachers", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        const message = data?.message || "تعذّر إنشاء حساب الأستاذ.";
        console.error("[admin-teachers][create] failed:", message);
        setSubmitError(message);
        return;
      }

      setBanner({ type: "success", text: data.message || "تم إنشاء حساب الأستاذ بنجاح." });
      setForm(EMPTY_FORM);
      setIsCreateOpen(false);
      await loadTeachers();
    } catch (e) {
      console.error("[admin-teachers][create] exception:", e);
      setSubmitError("حدث خطأ غير متوقع أثناء إنشاء الأستاذ.");
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <AdminShell title="إدارة الأساتذة" subtitle="متابعة ملفات الأساتذة وتخصصاتهم ومساراتهم في الأدب العربي.">
      <AdminSectionCard title="فريق التدريس" subtitle="إدارة بيانات الأساتذة وتفعيلهم داخل المنصة.">
        {banner.text ? (
          <div
            className={`mb-4 rounded-xl border px-3 py-2 text-sm ${
              banner.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {banner.text}
          </div>
        ) : null}
        {loadError ? <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{loadError}</div> : null}

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
          <AdminActionButton onClick={() => setIsCreateOpen(true)} tone="primary" className="rounded-xl px-4 py-2 text-sm font-bold">
            إضافة أستاذ
          </AdminActionButton>
        </AdminToolbar>

        {loading ? <p className="text-sm text-slate-600">جاري تحميل قائمة الأساتذة...</p> : null}
        {!loading && !rows.length ? (
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
                <p className="mt-2 text-xs text-slate-500">البريد: {teacher.email}</p>
              </AdminListCard>
            ))}
          </div>
        )}
      </AdminSectionCard>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h2 className="text-lg font-extrabold text-slate-900">إضافة أستاذ جديد</h2>
            <p className="mt-1 text-sm text-slate-600">أدخل بيانات حساب الأستاذ لإنشائه في قاعدة البيانات.</p>

            <form className="mt-4 grid gap-3" onSubmit={handleCreateTeacher}>
              <AdminFormField label="الاسم الكامل">
                <AdminInput
                  value={form.fullName}
                  onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
                  placeholder="الاسم الكامل للأستاذ"
                  required
                />
              </AdminFormField>
              <AdminFormField label="البريد الإلكتروني">
                <AdminInput
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                  placeholder="teacher@example.com"
                  required
                />
              </AdminFormField>
              <AdminFormField label="رقم الهاتف (اختياري)">
                <AdminInput
                  value={form.phone}
                  onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                  placeholder="05xxxxxxxx"
                />
              </AdminFormField>
              <div className="grid gap-3 md:grid-cols-2">
                <AdminFormField label="كلمة المرور">
                  <AdminInput
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                    placeholder="6 أحرف على الأقل"
                    required
                  />
                </AdminFormField>
                <AdminFormField label="تأكيد كلمة المرور">
                  <AdminInput
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm((s) => ({ ...s, confirmPassword: e.target.value }))}
                    placeholder="أعد إدخال كلمة المرور"
                    required
                  />
                </AdminFormField>
              </div>

              {submitError ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</div> : null}

              <div className="mt-2 flex items-center justify-end gap-2">
                <AdminActionButton
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setSubmitError("");
                    setForm(EMPTY_FORM);
                  }}
                >
                  إلغاء
                </AdminActionButton>
                <AdminActionButton type="submit" tone="primary" className="px-4 py-2 text-sm font-bold" disabled={submitLoading}>
                  {submitLoading ? "جارٍ الإنشاء..." : "إنشاء الأستاذ"}
                </AdminActionButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
