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
  AdminSelect,
  AdminToolbar,
} from "@/components/admin/AdminUI";
import {
  FREE_CONTENT_TYPE_LABELS,
  FREE_CONTENT_TYPE_OPTIONS,
  freeContentNeedsPdf,
  freeContentNeedsVideo,
  freeContentTitleLabel,
  normalizeFreeContentType,
} from "@/lib/free-content-type";
import { STUDENT_LEVEL_SELECT_OPTIONS } from "@/lib/student-level-codes";

const EMPTY = {
  freeContentType: "COURSE",
  title: "",
  description: "",
  subject: "",
  videoUrl: "",
  pdfUrls: "",
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

  const contentType = normalizeFreeContentType(form.freeContentType);
  const needsVideo = freeContentNeedsVideo(contentType);
  const needsPdf = freeContentNeedsPdf(contentType);
  const showCourseExtras = contentType === "COURSE";

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
    setEditingId(course?.id ?? null);
    setForm({
      freeContentType: normalizeFreeContentType(course?.freeContentType || course?.contentType),
      title: course?.title || "",
      description: course?.description || "",
      subject: course?.subject || "",
      videoUrl: course?.videoUrl || "",
      pdfUrls:
        course?.pdfUrls ||
        (Array.isArray(course?.pdfs) ? course.pdfs.map((p) => p?.url ?? "").filter(Boolean).join("\n") : ""),
      thumbnailUrl: course?.coverImage || "",
      level: course?.level || "",
      status: course?.status || "DRAFT",
    });
    setError("");
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    if (!String(form?.title ?? "").trim()) {
      setError("العنوان مطلوب.");
      return;
    }
    const type = normalizeFreeContentType(form.freeContentType);
    const videoUrl = String(form?.videoUrl ?? "").trim();
    if (videoUrl && !/youtube\.com|youtu\.be|\.mp4(\?|$)/i.test(videoUrl)) {
      setError("يُقبل رابط YouTube أو ملف MP4 فقط.");
      return;
    }
    const pdfLines = String(form?.pdfUrls ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (form?.status === "PUBLISHED") {
      if (freeContentNeedsVideo(type) && !videoUrl) {
        setError(type === "LESSON" ? "أضف رابط الفيديو قبل نشر الدرس." : "أضف رابط الفيديو قبل نشر الدورة.");
        return;
      }
      if (freeContentNeedsPdf(type) && !pdfLines.length) {
        setError("أضف رابط PDF واحدًا على الأقل قبل النشر.");
        return;
      }
    }
    setSaving(true);
    try {
      const isEdit = !!editingId;
      const url = isEdit ? `/api/admin/free-courses/${editingId}` : "/api/admin/free-courses";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          freeContentType: type,
          videoUrl: freeContentNeedsVideo(type) || type === "COURSE" ? form.videoUrl : "",
          pdfUrls: freeContentNeedsPdf(type) || type === "COURSE" ? form.pdfUrls : "",
        }),
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
    if (!window.confirm("حذف هذا المحتوى المجاني؟")) return;
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

  const submitLabel = useMemo(() => {
    if (saving) return "جاري الحفظ…";
    if (editingId) return "تحديث المحتوى";
    return "إنشاء محتوى مجاني";
  }, [editingId, saving]);

  return (
    <AdminShell
      title="إدارة المحتوى المجاني"
      subtitle="إنشاء دروس وملخصات وفروض واختبارات ودورات مجانية — منفصل تمامًا عن النظام المدفوع."
    >
      <AdminSectionCard title="إدارة المحتوى المجاني">
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
          <AdminFormField label="نوع المحتوى">
            <AdminSelect
              value={form.freeContentType}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  freeContentType: normalizeFreeContentType(e.target.value),
                }))
              }
            >
              {FREE_CONTENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </AdminSelect>
          </AdminFormField>

          <AdminFormField label={freeContentTitleLabel(contentType)}>
            <AdminInput
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              placeholder="أدخل العنوان"
              required
            />
          </AdminFormField>

          <AdminFormField label="المستوى الدراسي">
            <AdminSelect value={form.level} onChange={(e) => setForm((s) => ({ ...s, level: e.target.value }))}>
              <option value="">— اختر المستوى —</option>
              {STUDENT_LEVEL_SELECT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </AdminSelect>
          </AdminFormField>

          <AdminFormField label="المادة">
            <AdminInput
              value={form.subject}
              onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value }))}
              placeholder="مثال: بلاغة / نحو / أدب"
            />
          </AdminFormField>

          <AdminFormField label="الوصف">
            <AdminInput
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              placeholder="وصف مختصر"
            />
          </AdminFormField>

          <AdminFormField label="الحالة">
            <AdminSelect value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}>
              <option value="DRAFT">مسودة</option>
              <option value="PUBLISHED">منشور</option>
            </AdminSelect>
          </AdminFormField>

          {needsVideo || showCourseExtras ? (
            <AdminFormField label={contentType === "LESSON" ? "رابط YouTube / MP4" : "رابط الفيديو (YouTube أو MP4)"}>
              <AdminInput
                value={form.videoUrl}
                onChange={(e) => setForm((s) => ({ ...s, videoUrl: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=... أو رابط .mp4"
                dir="ltr"
              />
            </AdminFormField>
          ) : null}

          {needsPdf || showCourseExtras ? (
            <AdminFormField
              label={
                contentType === "SUMMARY"
                  ? "رابط PDF للملخص (سطر لكل رابط)"
                  : contentType === "ASSIGNMENT"
                    ? "رابط فرض PDF (سطر لكل رابط)"
                    : contentType === "EXAM"
                      ? "رابط اختبار PDF (سطر لكل رابط)"
                      : "روابط PDF (سطر لكل رابط)"
              }
            >
              <textarea
                value={form.pdfUrls}
                onChange={(e) => setForm((s) => ({ ...s, pdfUrls: e.target.value }))}
                placeholder={"https://example.com/doc1.pdf\nhttps://example.com/doc2.pdf"}
                dir="ltr"
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </AdminFormField>
          ) : null}

          {showCourseExtras ? (
            <AdminFormField label="رابط صورة الغلاف (اختياري)">
              <AdminInput
                value={form.thumbnailUrl}
                onChange={(e) => setForm((s) => ({ ...s, thumbnailUrl: e.target.value }))}
                placeholder="https://..."
                dir="ltr"
              />
            </AdminFormField>
          ) : null}

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <AdminActionButton type="submit" tone="primary" disabled={saving}>
              {submitLabel}
            </AdminActionButton>
            {editingId ? (
              <AdminActionButton type="button" onClick={resetForm}>
                إلغاء التعديل
              </AdminActionButton>
            ) : null}
          </div>
        </form>

        <AdminToolbar>
          <p className="text-sm text-slate-600">
            {loading ? "جاري التحميل…" : `${courses.length} عنصر مجاني`}
          </p>
        </AdminToolbar>

        {!loading && !courses.length ? (
          <AdminEmptyState
            title="لا يوجد محتوى مجاني"
            description="اختر نوع المحتوى وأنشئ أول عنصر مجاني."
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-right text-xs font-semibold text-slate-500">
                  <th className="px-4 py-3">العنوان</th>
                  <th className="px-3 py-3">النوع</th>
                  <th className="px-3 py-3">المستوى</th>
                  <th className="px-3 py-3">الحالة</th>
                  <th className="px-4 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(courses) ? courses : []).map((c) => {
                  const type = normalizeFreeContentType(c?.freeContentType || c?.contentType);
                  return (
                    <tr key={c?.id} className="border-b border-slate-100 align-top">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">{c?.title ?? ""}</p>
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2">{c?.description ?? ""}</p>
                        {c?.subject ? (
                          <p className="mt-1 text-xs font-semibold text-slate-600">المادة: {c.subject}</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-4">
                        <AdminBadge tone="brand">{FREE_CONTENT_TYPE_LABELS[type]}</AdminBadge>
                      </td>
                      <td className="px-3 py-4 text-xs text-slate-600">{c?.level || "—"}</td>
                      <td className="px-3 py-4">
                        <AdminBadge tone={c?.status === "PUBLISHED" ? "success" : "slate"}>
                          {c?.status === "PUBLISHED" ? "منشور" : "مسودة"}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminSectionCard>
    </AdminShell>
  );
}
