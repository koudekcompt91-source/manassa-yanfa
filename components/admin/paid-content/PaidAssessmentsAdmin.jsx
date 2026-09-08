"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

const EMPTY = {
  courseId: "",
  title: "",
  description: "",
  dueDate: "",
  allowRetake: false,
  isPublished: false,
};

/**
 * Shared PAID Assessment admin (QUIZ or ASSIGNMENT) under Course.system=PAID.
 */
export default function PaidAssessmentsAdmin({
  assessmentType = "QUIZ",
  pageTitle,
  pageSubtitle,
  createLabel = "إنشاء",
}) {
  const [courses, setCourses] = useState([]);
  const [byCourse, setByCourse] = useState({});
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/courses", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setCourses([]);
        setError(data?.message || "تعذّر تحميل الدورات المدفوعة.");
        return;
      }
      const list = Array.isArray(data.courses) ? data.courses : [];
      setCourses(list);
      const pairs = await Promise.all(
        list.map(async (course) => {
          const ar = await fetch(`/api/admin/courses/${course.id}/assessments`, { credentials: "include" });
          const ad = await ar.json().catch(() => ({}));
          const all = ar.ok && ad?.ok && Array.isArray(ad.assessments) ? ad.assessments : [];
          return [course.id, all.filter((row) => row.type === assessmentType)];
        })
      );
      setByCourse(Object.fromEntries(pairs));
      setError("");
    } finally {
      setLoading(false);
    }
  }, [assessmentType]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => {
    const out = [];
    for (const course of courses) {
      for (const row of byCourse[course.id] || []) {
        out.push({ ...row, courseTitle: course.title, courseId: course.id });
      }
    }
    return out.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  }, [courses, byCourse]);

  function resetForm() {
    setForm(EMPTY);
    setEditingId(null);
    setError("");
  }

  function openEdit(row) {
    setEditingId(row.id);
    setForm({
      courseId: row.courseId,
      title: row.title || "",
      description: row.description || "",
      dueDate: row.dueDate ? String(row.dueDate).slice(0, 16) : "",
      allowRetake: row.allowRetake === true,
      isPublished: row.isPublished === true,
    });
    setBanner(null);
    setError("");
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    setBanner(null);
    const courseId = String(form.courseId || "").trim();
    if (!courseId) {
      setError("اختر الدورة المدفوعة.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: String(form.title || "").trim(),
        description: String(form.description || "").trim(),
        type: assessmentType,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        allowRetake: Boolean(form.allowRetake),
        isPublished: Boolean(form.isPublished),
      };
      const isEdit = Boolean(editingId);
      const url = isEdit
        ? `/api/admin/assessments/${editingId}`
        : `/api/admin/courses/${courseId}/assessments`;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.message || "تعذّر الحفظ.");
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
    if (!window.confirm("حذف هذا العنصر؟")) return;
    const res = await fetch(`/api/admin/assessments/${id}`, { method: "DELETE", credentials: "include" });
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
    const res = await fetch(`/api/admin/assessments/${row.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !row.isPublished, type: assessmentType }),
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
    <AdminShell title={pageTitle} subtitle={pageSubtitle}>
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
        <p className={`rounded-xl px-4 py-3 text-sm font-semibold ${banner.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
          {banner.text}
        </p>
      ) : null}

      <AdminSectionCard title={`إضافة / تعديل · ${assessmentType}`} subtitle="مرتبط بدورة مدفوعة. إدارة الأسئلة التفصيلية متاحة أيضًا من إدارة الدورات.">
        {!courses.length && !loading ? (
          <AdminEmptyState title="لا توجد دورات مدفوعة" description="أنشئ دورة مدفوعة أولًا من إدارة الدورات." />
        ) : null}
        <form className="mt-2 grid gap-3 md:grid-cols-2" onSubmit={save} dir="rtl">
          <AdminFormField label="الدورة المدفوعة">
            <AdminSelect
              className="w-full"
              value={form.courseId}
              disabled={Boolean(editingId)}
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
          <AdminFormField label="العنوان">
            <AdminInput value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} required />
          </AdminFormField>
          <AdminFormField label="الوصف" className="md:col-span-2">
            <AdminInput value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
          </AdminFormField>
          <AdminFormField label="تاريخ الاستحقاق (اختياري)">
            <AdminInput type="datetime-local" value={form.dueDate} onChange={(e) => setForm((s) => ({ ...s, dueDate: e.target.value }))} />
          </AdminFormField>
          <AdminFormField label="إعادة المحاولة">
            <AdminSelect className="w-full" value={form.allowRetake ? "1" : "0"} onChange={(e) => setForm((s) => ({ ...s, allowRetake: e.target.value === "1" }))}>
              <option value="0">غير مسموح</option>
              <option value="1">مسموح</option>
            </AdminSelect>
          </AdminFormField>
          <AdminFormField label="النشر">
            <AdminSelect className="w-full" value={form.isPublished ? "1" : "0"} onChange={(e) => setForm((s) => ({ ...s, isPublished: e.target.value === "1" }))}>
              <option value="0">مخفي</option>
              <option value="1">منشور</option>
            </AdminSelect>
          </AdminFormField>
          {error ? <p className="md:col-span-2 text-sm font-semibold text-red-700">{error}</p> : null}
          <div className="md:col-span-2 flex flex-wrap gap-2">
            <AdminActionButton type="submit" tone="primary" disabled={saving || !courses.length}>
              {saving ? "جاري الحفظ…" : editingId ? "حفظ التعديل" : createLabel}
            </AdminActionButton>
            {editingId ? <AdminActionButton type="button" onClick={resetForm}>إلغاء</AdminActionButton> : null}
            <Link href="/admin/courses" className="self-center text-sm font-bold text-brand-700 underline">
              إدارة الأسئلة من الدورات
            </Link>
          </div>
        </form>
      </AdminSectionCard>

      <AdminSectionCard title="العناصر" subtitle={`${rows.length} عنصر · النوع ${assessmentType}`}>
        {loading ? (
          <p className="text-sm text-slate-500">جاري التحميل…</p>
        ) : !rows.length ? (
          <AdminEmptyState title="لا توجد عناصر بعد" description="أنشئ أول عنصر من النموذج أعلاه." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-right text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="px-3 py-2 font-bold">العنوان</th>
                  <th className="px-3 py-2 font-bold">الدورة</th>
                  <th className="px-3 py-2 font-bold">أسئلة</th>
                  <th className="px-3 py-2 font-bold">النشر</th>
                  <th className="px-3 py-2 font-bold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="px-3 py-3 font-extrabold text-slate-900">{row.title}</td>
                    <td className="px-3 py-3">{row.courseTitle}</td>
                    <td className="px-3 py-3">{row.questionsCount ?? "—"}</td>
                    <td className="px-3 py-3">
                      <AdminBadge tone={row.isPublished ? "success" : "warning"}>{row.isPublished ? "منشور" : "مخفي"}</AdminBadge>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <AdminActionButton type="button" onClick={() => openEdit(row)}>تعديل</AdminActionButton>
                        <AdminActionButton type="button" tone="primary" onClick={() => togglePublish(row)}>
                          {row.isPublished ? "إخفاء" : "نشر"}
                        </AdminActionButton>
                        <Link
                          href="/admin/courses"
                          className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 no-underline hover:bg-slate-50"
                        >
                          الأسئلة
                        </Link>
                        <AdminActionButton type="button" tone="danger" onClick={() => removeRow(row.id)}>حذف</AdminActionButton>
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
