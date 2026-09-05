"use client";

import { useCallback, useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import {
  AdminActionButton,
  AdminBadge,
  AdminEmptyState,
  AdminFormField,
  AdminInput,
  AdminSectionCard,
  AdminSelect,
  AdminToolbar,
} from "@/components/admin/AdminUI";

const EMPTY = {
  title: "",
  description: "",
  videoUrl: "",
  thumbnailUrl: "",
  level: "",
  status: "DRAFT",
};

export default function AdminFreeCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/free-courses", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) setCourses(Array.isArray(data.courses) ? data.courses : []);
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

  function openEdit(course) {
    setEditingId(course.id);
    setForm({
      title: course.title || "",
      description: course.description || "",
      videoUrl: course.videoUrl || "",
      thumbnailUrl: course.coverImage || "",
      level: course.level || "",
      status: course.status || "DRAFT",
    });
    setError("");
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) {
      setError("عنوان الدورة مطلوب.");
      return;
    }
    if (form.status === "PUBLISHED" && !form.videoUrl.trim()) {
      setError("أضف رابط الفيديو قبل النشر.");
      return;
    }
    setSaving(true);
    try {
      const isEdit = !!editingId;
      const url = isEdit ? `/api/admin/free-courses/${editingId}` : "/api/admin/free-courses";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.message || "تعذّر الحفظ.");
        return;
      }
      setBanner({ type: "success", text: data.message || "تم الحفظ." });
      resetForm();
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("حذف هذه الدورة المجانية؟")) return;
    const res = await fetch(`/api/admin/free-courses/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setBanner({ type: "error", text: data?.message || "تعذّر الحذف." });
      return;
    }
    setBanner({ type: "success", text: data.message || "تم الحذف." });
    if (editingId === id) resetForm();
    await load();
  }

  return (
    <AdminShell
      title="نظام التعلم المجاني"
      subtitle="إنشاء دورات مجانية وربط فيديو لكل دورة — منفصل تمامًا عن النظام المدفوع."
    >
      <AdminSectionCard title="إدارة الدورات المجانية">
        {banner ? (
          <p
            className={`mb-4 rounded-xl border px-3 py-2 text-sm ${
              banner.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {banner.text}
          </p>
        ) : null}

        <form onSubmit={save} className="mb-8 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-2">
          <AdminFormField label="عنوان الدورة">
            <AdminInput
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              placeholder="مثال: بلاغة"
              required
            />
          </AdminFormField>
          <AdminFormField label="المستوى (اختياري)">
            <AdminInput
              value={form.level}
              onChange={(e) => setForm((s) => ({ ...s, level: e.target.value }))}
              placeholder="3AM / 1AS …"
            />
          </AdminFormField>
          <AdminFormField label="الوصف">
            <AdminInput
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              placeholder="وصف مختصر للدورة"
            />
          </AdminFormField>
          <AdminFormField label="الحالة">
            <AdminSelect value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}>
              <option value="DRAFT">مسودة</option>
              <option value="PUBLISHED">منشورة</option>
            </AdminSelect>
          </AdminFormField>
          <AdminFormField label="رابط الفيديو (YouTube أو ملف mp4)">
            <AdminInput
              value={form.videoUrl}
              onChange={(e) => setForm((s) => ({ ...s, videoUrl: e.target.value }))}
              placeholder="https://youtube.com/... أو رابط الفيديو المباشر"
              dir="ltr"
            />
          </AdminFormField>
          <AdminFormField label="رابط صورة الغلاف (اختياري)">
            <AdminInput
              value={form.thumbnailUrl}
              onChange={(e) => setForm((s) => ({ ...s, thumbnailUrl: e.target.value }))}
              placeholder="https://..."
              dir="ltr"
            />
          </AdminFormField>
          {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{error}</p> : null}
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <AdminActionButton type="submit" tone="primary" disabled={saving}>
              {saving ? "جاري الحفظ…" : editingId ? "تحديث الدورة" : "إنشاء دورة مجانية"}
            </AdminActionButton>
            {editingId ? (
              <AdminActionButton type="button" onClick={resetForm}>
                إلغاء التعديل
              </AdminActionButton>
            ) : null}
          </div>
        </form>

        <AdminToolbar>
          <p className="text-sm text-slate-600">{loading ? "جاري التحميل…" : `${courses.length} دورة مجانية`}</p>
        </AdminToolbar>

        {!loading && !courses.length ? (
          <AdminEmptyState title="لا توجد دورات مجانية" description="أنشئ أول دورة مجانية واربطها بفيديو." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-right text-xs font-semibold text-slate-500">
                  <th className="px-4 py-3">العنوان</th>
                  <th className="px-3 py-3">الفيديو</th>
                  <th className="px-3 py-3">الحالة</th>
                  <th className="px-4 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{c.title}</p>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">{c.description}</p>
                    </td>
                    <td className="px-3 py-4 text-xs" dir="ltr">
                      {c.videoUrl ? (
                        <span className="break-all text-slate-600">{c.videoUrl.slice(0, 48)}…</span>
                      ) : (
                        <span className="text-amber-700">بدون فيديو</span>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      <AdminBadge tone={c.status === "PUBLISHED" ? "success" : "slate"}>
                        {c.status === "PUBLISHED" ? "منشورة" : "مسودة"}
                      </AdminBadge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <AdminActionButton onClick={() => openEdit(c)} tone="primary">
                          تعديل
                        </AdminActionButton>
                        <AdminActionButton onClick={() => remove(c.id)} tone="danger">
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
