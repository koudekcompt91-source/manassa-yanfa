"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import {
  AdminActionButton,
  AdminBadge,
  AdminEmptyState,
  AdminFormField,
  AdminInput,
  AdminSectionCard,
} from "@/components/admin/AdminUI";

const EMPTY_FORM = {
  title: "",
  slug: "",
  description: "",
  icon: "",
  color: "",
  order: 0,
  isPublished: true,
  courseIds: [],
};

function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminLearningPathsPage() {
  const [rows, setRows] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState({ type: "", text: "" });
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [pathsRes, coursesRes] = await Promise.all([
        fetch("/api/admin/learning-paths", { credentials: "include", cache: "no-store" }),
        fetch("/api/admin/courses", { credentials: "include", cache: "no-store" }),
      ]);
      const pathsData = await pathsRes.json().catch(() => ({}));
      const coursesData = await coursesRes.json().catch(() => ({}));

      if (!pathsRes.ok || !pathsData?.ok) {
        setError(pathsData?.message || "تعذّر تحميل المسارات التعليمية.");
        setRows([]);
      } else {
        setRows(Array.isArray(pathsData.learningPaths) ? pathsData.learningPaths : []);
      }

      if (coursesRes.ok && coursesData?.ok) {
        setCourses(Array.isArray(coursesData.courses) ? coursesData.courses : []);
      } else {
        setCourses([]);
      }
    } catch {
      setError("حدث خطأ أثناء تحميل البيانات.");
      setRows([]);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => `${row.title} ${row.slug} ${row.description || ""}`.toLowerCase().includes(q));
  }, [rows, query]);

  const resetForm = useCallback(() => {
    setEditingId("");
    setForm(EMPTY_FORM);
  }, []);

  const openCreate = () => {
    resetForm();
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      title: row.title || "",
      slug: row.slug || "",
      description: row.description || "",
      icon: row.icon || "",
      color: row.color || "",
      order: Number(row.order || 0) || 0,
      isPublished: row.isPublished !== false,
      courseIds: Array.isArray(row.linkedCourseIds) ? row.linkedCourseIds : [],
    });
  };

  const toggleCourse = (courseId) => {
    setForm((prev) => {
      const set = new Set(prev.courseIds || []);
      if (set.has(courseId)) set.delete(courseId);
      else set.add(courseId);
      return { ...prev, courseIds: Array.from(set) };
    });
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setBanner({ type: "error", text: "عنوان المسار مطلوب." });
      return;
    }

    setSaving(true);
    setBanner({ type: "", text: "" });
    try {
      const payload = {
        title: form.title.trim(),
        slug: slugify(form.slug || form.title),
        description: form.description.trim(),
        icon: form.icon.trim(),
        color: form.color.trim(),
        order: Math.max(0, Number(form.order) || 0),
        isPublished: Boolean(form.isPublished),
        courseIds: Array.isArray(form.courseIds) ? form.courseIds : [],
      };

      const isEdit = Boolean(editingId);
      const res = await fetch(isEdit ? `/api/admin/learning-paths/${editingId}` : "/api/admin/learning-paths", {
        method: isEdit ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setBanner({ type: "error", text: data?.message || "تعذّر حفظ المسار." });
        return;
      }

      setBanner({ type: "success", text: data?.message || "تم الحفظ بنجاح." });
      resetForm();
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    const res = await fetch(`/api/admin/learning-paths/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setBanner({ type: "error", text: data?.message || "تعذّر حذف المسار." });
      return;
    }
    setBanner({ type: "success", text: "تم حذف المسار." });
    if (editingId === id) resetForm();
    await load();
  };

  const togglePublish = async (row) => {
    const res = await fetch(`/api/admin/learning-paths/${row.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !row.isPublished }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setBanner({ type: "error", text: data?.message || "تعذّر تحديث حالة النشر." });
      return;
    }
    await load();
  };

  return (
    <AdminShell title="المسارات التعليمية" subtitle="إدارة المسارات التي تظهر للطالب في لوحة التحكم وربطها بالدورات.">
      <AdminSectionCard title="إدارة المسارات التعليمية" subtitle="إنشاء وتعديل وحذف ونشر/إخفاء المسارات التعليمية.">
        {banner.text ? (
          <p className={`mb-4 rounded-xl border px-3 py-2 text-sm ${banner.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
            {banner.text}
          </p>
        ) : null}
        {error ? <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="w-full sm:max-w-sm">
            <AdminInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن مسار..." />
          </div>
          <AdminActionButton tone="primary" onClick={openCreate}>
            إضافة مسار
          </AdminActionButton>
        </div>

        <form onSubmit={save} className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 md:grid-cols-2">
          <AdminFormField label="العنوان">
            <AdminInput value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} required />
          </AdminFormField>
          <AdminFormField label="Slug">
            <AdminInput value={form.slug} onChange={(e) => setForm((s) => ({ ...s, slug: slugify(e.target.value) }))} placeholder="nahw-sarf" />
          </AdminFormField>
          <AdminFormField label="الوصف (اختياري)" className="md:col-span-2">
            <AdminInput value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
          </AdminFormField>
          <AdminFormField label="أيقونة (اختياري)">
            <AdminInput value={form.icon} onChange={(e) => setForm((s) => ({ ...s, icon: e.target.value }))} placeholder="book-open" />
          </AdminFormField>
          <AdminFormField label="لون (اختياري)">
            <AdminInput value={form.color} onChange={(e) => setForm((s) => ({ ...s, color: e.target.value }))} placeholder="#2563eb" />
          </AdminFormField>
          <AdminFormField label="ترتيب العرض">
            <AdminInput type="number" min="0" value={form.order} onChange={(e) => setForm((s) => ({ ...s, order: Number(e.target.value) || 0 }))} />
          </AdminFormField>
          <AdminFormField label="الحالة">
            <select
              value={form.isPublished ? "1" : "0"}
              onChange={(e) => setForm((s) => ({ ...s, isPublished: e.target.value === "1" }))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="1">منشور</option>
              <option value="0">مخفي</option>
            </select>
          </AdminFormField>

          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-semibold text-slate-700">ربط الدورات (اختياري)</p>
            {!courses.length ? (
              <p className="text-xs text-slate-500">لا توجد دورات للربط حاليًا.</p>
            ) : (
              <div className="grid max-h-44 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-2">
                {courses.map((course) => (
                  <label key={course.id} className="flex items-center gap-2 rounded-lg border border-slate-100 px-2 py-1.5 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={(form.courseIds || []).includes(course.id)}
                      onChange={() => toggleCourse(course.id)}
                    />
                    <span className="line-clamp-1">{course.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 md:col-span-2">
            <AdminActionButton type="submit" tone="primary" disabled={saving}>
              {saving ? "جاري الحفظ..." : "حفظ"}
            </AdminActionButton>
            {editingId ? (
              <AdminActionButton type="button" onClick={resetForm}>
                إلغاء التعديل
              </AdminActionButton>
            ) : null}
          </div>
        </form>

        {loading ? <p className="text-sm text-slate-600">جاري تحميل المسارات...</p> : null}
        {!loading && !filteredRows.length ? (
          <AdminEmptyState title="لا توجد مسارات تعليمية" description="ابدأ بإضافة أول مسار من النموذج أعلاه." />
        ) : null}
        {!loading && filteredRows.length ? (
          <div className="space-y-2">
            {filteredRows.map((row) => (
              <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900">{row.title}</p>
                  <p className="text-xs text-slate-500">/{row.slug}</p>
                  {row.description ? <p className="mt-1 text-xs text-slate-600">{row.description}</p> : null}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <AdminBadge tone={row.isPublished ? "success" : "warning"}>
                      {row.isPublished ? "منشور" : "مخفي"}
                    </AdminBadge>
                    <AdminBadge tone="brand">ترتيب: {row.order}</AdminBadge>
                    <AdminBadge>الدورات المرتبطة: {row.linkedCoursesCount || 0}</AdminBadge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminActionButton onClick={() => openEdit(row)}>تعديل المسار</AdminActionButton>
                  <AdminActionButton onClick={() => togglePublish(row)}>
                    {row.isPublished ? "إخفاء" : "نشر"}
                  </AdminActionButton>
                  <AdminActionButton tone="danger" onClick={() => remove(row.id)}>
                    حذف المسار
                  </AdminActionButton>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </AdminSectionCard>
    </AdminShell>
  );
}
