"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import {
  AdminActionButton,
  AdminBadge,
  AdminEmptyState,
  AdminFormField,
  AdminInput,
  AdminSectionCard,
  AdminSelect,
} from "@/components/admin/AdminUI";
import { getDisplayLevelLabel, STUDENT_LEVEL_SELECT_OPTIONS } from "@/lib/student-level-codes";

const EMPTY = {
  courseId: "",
  title: "",
  description: "",
  subject: "",
  level: "",
  fileUrl: "",
  order: 0,
  isPublished: false,
};

/**
 * PAID diagnostic admin — PaidDiagnosticContent only (Course.system = PAID).
 */
export default function AdminPaidDiagnosticPage() {
  const [courses, setCourses] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [coursesRes, itemsRes] = await Promise.all([
        fetch("/api/admin/courses", { credentials: "include" }),
        fetch("/api/admin/paid-diagnostics", { credentials: "include" }),
      ]);
      const coursesData = await coursesRes.json().catch(() => ({}));
      const itemsData = await itemsRes.json().catch(() => ({}));
      if (!coursesRes.ok || !coursesData?.ok) {
        setError(coursesData?.message || "تعذّر تحميل الدورات المدفوعة.");
        setCourses([]);
      } else {
        setCourses(Array.isArray(coursesData.courses) ? coursesData.courses : []);
      }
      if (!itemsRes.ok || !itemsData?.ok) {
        setError(itemsData?.message || "تعذّر تحميل التقويات التشخيصية.");
        setItems([]);
      } else {
        setItems(Array.isArray(itemsData.items) ? itemsData.items : []);
        setError("");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function resetForm() {
    setForm(EMPTY);
    setEditingId(null);
    setError("");
  }

  function openEdit(row) {
    setEditingId(row.id);
    setForm({
      courseId: row.courseId || "",
      title: row.title || "",
      description: row.description || "",
      subject: row.subject || "",
      level: row.level || "",
      fileUrl: row.fileUrl || "",
      order: row.order || 0,
      isPublished: row.isPublished === true,
    });
    setBanner(null);
    setError("");
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    setBanner(null);
    setSaving(true);
    try {
      const payload = {
        courseId: form.courseId,
        title: form.title,
        description: form.description,
        subject: form.subject,
        level: form.level || null,
        fileUrl: form.fileUrl,
        order: Number(form.order) || 0,
        isPublished: Boolean(form.isPublished),
      };
      const isEdit = Boolean(editingId);
      const res = await fetch(isEdit ? `/api/admin/paid-diagnostics/${editingId}` : "/api/admin/paid-diagnostics", {
        method: isEdit ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.message || "تعذّر حفظ التقوية.");
        return;
      }
      setBanner({ type: "ok", text: data.message || "تم الحفظ." });
      resetForm();
      await load();
    } catch {
      setError("حدث خطأ أثناء الحفظ.");
    } finally {
      setSaving(false);
    }
  }

  async function removeRow(id) {
    if (!window.confirm("حذف هذه التقوية التشخيصية؟")) return;
    const res = await fetch(`/api/admin/paid-diagnostics/${id}`, { method: "DELETE", credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setError(data?.message || "تعذّر الحذف.");
      return;
    }
    setBanner({ type: "ok", text: "تم الحذف." });
    if (editingId === id) resetForm();
    await load();
  }

  async function togglePublish(row) {
    const res = await fetch(`/api/admin/paid-diagnostics/${row.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !row.isPublished }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setError(data?.message || "تعذّر تحديث النشر.");
      return;
    }
    setBanner({ type: "ok", text: row.isPublished ? "تم الإخفاء." : "تم النشر." });
    await load();
  }

  return (
    <AdminShell
      title="تقويات تشخيصية — المحتوى المدفوع"
      subtitle="إدارة PaidDiagnosticContent ضمن دورات Course.system = PAID فقط."
    >
      <div className="mb-4">
        <Link
          href="/admin/paid-content"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 no-underline hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى إدارة المحتوى المدفوع
        </Link>
      </div>

      {banner?.text ? (
        <p
          className={`rounded-xl px-4 py-3 text-sm font-semibold ${
            banner.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
          }`}
        >
          {banner.text}
        </p>
      ) : null}

      <AdminSectionCard title="إضافة / تعديل تقوية" subtitle="ملف أو مورد عبر رابط آمن · مرتبط بدورة مدفوعة.">
        {!courses.length && !loading ? (
          <AdminEmptyState title="لا توجد دورات مدفوعة" description="أنشئ دورة مدفوعة أولًا من إدارة الدورات." />
        ) : null}
        <form className="mt-2 grid gap-3 md:grid-cols-2" onSubmit={save} dir="rtl">
          <AdminFormField label="الدورة المدفوعة">
            <AdminSelect
              className="w-full"
              value={form.courseId}
              onChange={(e) => setForm((s) => ({ ...s, courseId: e.target.value }))}
              required
            >
              <option value="">اختر دورة…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </AdminSelect>
          </AdminFormField>
          <AdminFormField label="عنوان التقوية">
            <AdminInput value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} required />
          </AdminFormField>
          <AdminFormField label="المستوى الدراسي">
            <AdminSelect className="w-full" value={form.level} onChange={(e) => setForm((s) => ({ ...s, level: e.target.value }))}>
              <option value="">بدون تحديد</option>
              {STUDENT_LEVEL_SELECT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </AdminSelect>
          </AdminFormField>
          <AdminFormField label="المادة">
            <AdminInput value={form.subject} onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value }))} placeholder="مثال: رياضيات" />
          </AdminFormField>
          <AdminFormField label="رابط الملف / المورد" className="md:col-span-2">
            <AdminInput
              value={form.fileUrl}
              onChange={(e) => setForm((s) => ({ ...s, fileUrl: e.target.value }))}
              placeholder="https://..."
              required
            />
          </AdminFormField>
          <AdminFormField label="الترتيب">
            <AdminInput type="number" min="0" value={form.order} onChange={(e) => setForm((s) => ({ ...s, order: Number(e.target.value) || 0 }))} />
          </AdminFormField>
          <AdminFormField label="النشر">
            <AdminSelect
              className="w-full"
              value={form.isPublished ? "1" : "0"}
              onChange={(e) => setForm((s) => ({ ...s, isPublished: e.target.value === "1" }))}
            >
              <option value="0">مخفي</option>
              <option value="1">منشور</option>
            </AdminSelect>
          </AdminFormField>
          <AdminFormField label="الوصف" className="md:col-span-2">
            <AdminInput value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
          </AdminFormField>
          {error ? <p className="md:col-span-2 text-sm font-semibold text-red-700">{error}</p> : null}
          <div className="md:col-span-2 flex flex-wrap gap-2">
            <AdminActionButton type="submit" tone="primary" disabled={saving || !courses.length}>
              {saving ? "جاري الحفظ…" : editingId ? "حفظ التعديل" : "إضافة تقوية"}
            </AdminActionButton>
            {editingId ? (
              <AdminActionButton type="button" onClick={resetForm}>
                إلغاء
              </AdminActionButton>
            ) : null}
          </div>
        </form>
      </AdminSectionCard>

      <AdminSectionCard title="تقويات تشخيصية PAID" subtitle={`${items.length} عنصر · PaidDiagnosticContent`}>
        {loading ? (
          <p className="text-sm text-slate-500">جاري التحميل…</p>
        ) : !items.length ? (
          <AdminEmptyState title="لا توجد تقويات بعد" description="أضف أول تقوية من النموذج أعلاه." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-right text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="px-3 py-2 font-bold">العنوان</th>
                  <th className="px-3 py-2 font-bold">الدورة</th>
                  <th className="px-3 py-2 font-bold">المستوى</th>
                  <th className="px-3 py-2 font-bold">المادة</th>
                  <th className="px-3 py-2 font-bold">النشر</th>
                  <th className="px-3 py-2 font-bold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="px-3 py-3">
                      <p className="font-extrabold text-slate-900">{row.title}</p>
                      {row.description ? <p className="mt-1 line-clamp-1 text-xs text-slate-500">{row.description}</p> : null}
                    </td>
                    <td className="px-3 py-3">{row.course?.title || "—"}</td>
                    <td className="px-3 py-3">{getDisplayLevelLabel(row) || "—"}</td>
                    <td className="px-3 py-3">{row.subject || "—"}</td>
                    <td className="px-3 py-3">
                      <AdminBadge tone={row.isPublished ? "success" : "warning"}>
                        {row.isPublished ? "منشور" : "مخفي"}
                      </AdminBadge>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <AdminActionButton type="button" onClick={() => openEdit(row)}>
                          تعديل
                        </AdminActionButton>
                        <AdminActionButton type="button" tone="primary" onClick={() => togglePublish(row)}>
                          {row.isPublished ? "إخفاء" : "نشر"}
                        </AdminActionButton>
                        <AdminActionButton type="button" tone="danger" onClick={() => removeRow(row.id)}>
                          حذف
                        </AdminActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminSectionCard>
    </AdminShell>
  );
}
