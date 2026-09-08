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
import { getDisplayLevelLabel, STUDENT_LEVEL_SELECT_OPTIONS } from "@/lib/student-level-codes";

const EMPTY_FORM = {
  courseId: "",
  title: "",
  description: "",
  youtubeUrl: "",
  level: "",
  subject: "",
  order: 1,
  isPublished: false,
};

/**
 * PAID "دروسي" admin — reuses Course (system=PAID) + Lesson APIs.
 * Level/subject live on the parent course; video fields on Lesson.
 */
export default function AdminPaidLessonsPage() {
  const [courses, setCourses] = useState([]);
  const [lessonsByCourse, setLessonsByCourse] = useState({});
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState(null);

  const loadCourses = useCallback(async () => {
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
          const lr = await fetch(`/api/admin/courses/${course.id}/lessons`, { credentials: "include" });
          const ld = await lr.json().catch(() => ({}));
          return [course.id, lr.ok && ld?.ok && Array.isArray(ld.lessons) ? ld.lessons : []];
        })
      );
      setLessonsByCourse(Object.fromEntries(pairs));
      setError("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const flatLessons = useMemo(() => {
    const rows = [];
    for (const course of courses) {
      const lessons = lessonsByCourse[course.id] || [];
      for (const lesson of lessons) {
        rows.push({
          ...lesson,
          courseId: course.id,
          courseTitle: course.title,
          courseSlug: course.slug,
          level: course.level,
          academicLevel: course.academicLevel,
          subject: course.subject || "",
        });
      }
    }
    return rows.sort((a, b) => String(a.courseTitle).localeCompare(String(b.courseTitle), "ar") || (a.order || 0) - (b.order || 0));
  }, [courses, lessonsByCourse]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
  }

  function onSelectCourse(courseId) {
    const course = courses.find((c) => c.id === courseId);
    setForm((s) => ({
      ...s,
      courseId,
      level: course?.level || "",
      subject: course?.subject || "",
      order: (lessonsByCourse[courseId]?.length || 0) + 1,
    }));
  }

  function openEdit(row) {
    setEditingId(row.id);
    setForm({
      courseId: row.courseId,
      title: row.title || "",
      description: row.description || "",
      youtubeUrl: row.youtubeUrl || "",
      level: row.level || "",
      subject: row.subject || "",
      order: row.order || 1,
      isPublished: row.isPublished === true,
    });
    setError("");
    setBanner(null);
  }

  async function syncCourseMeta(courseId) {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return { ok: false, message: "اختر الدورة/الباقة المدفوعة." };

    const nextLevel = String(form.level || "").trim();
    const nextSubject = String(form.subject || "").trim();
    const sameLevel = String(course.level || "") === nextLevel;
    const sameSubject = String(course.subject || "") === nextSubject;
    if (sameLevel && sameSubject) return { ok: true };

    const res = await fetch(`/api/admin/courses/${courseId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level: nextLevel || null,
        subject: nextSubject || null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      return { ok: false, message: data?.message || "تعذّر تحديث المستوى/المادة للدورة." };
    }
    return { ok: true };
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    setBanner(null);

    const courseId = String(form.courseId || "").trim();
    if (!courseId) {
      setError("اختر الدورة/الباقة المدفوعة لربط الدرس.");
      return;
    }
    if (!String(form.title || "").trim()) {
      setError("عنوان الدرس مطلوب.");
      return;
    }
    if (!String(form.youtubeUrl || "").trim()) {
      setError("رابط يوتيوب مطلوب.");
      return;
    }

    setSaving(true);
    try {
      const meta = await syncCourseMeta(courseId);
      if (!meta.ok) {
        setError(meta.message);
        return;
      }

      const payload = {
        title: String(form.title || "").trim(),
        description: String(form.description || "").trim(),
        youtubeUrl: String(form.youtubeUrl || "").trim(),
        order: Math.max(1, Number(form.order) || 1),
        isPublished: Boolean(form.isPublished),
        isFreePreview: false,
      };

      const isEdit = Boolean(editingId);
      const url = isEdit ? `/api/admin/lessons/${editingId}` : `/api/admin/courses/${courseId}/lessons`;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.message || "تعذّر حفظ الدرس.");
        return;
      }

      setBanner({ type: "ok", text: data.message || (isEdit ? "تم تحديث الدرس." : "تمت إضافة الدرس.") });
      resetForm();
      await loadCourses();
    } catch {
      setError("حدث خطأ أثناء الحفظ.");
    } finally {
      setSaving(false);
    }
  }

  async function removeLesson(lessonId) {
    if (!window.confirm("هل تريد حذف هذا الدرس؟")) return;
    setBanner(null);
    const res = await fetch(`/api/admin/lessons/${lessonId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setError(data?.message || "تعذّر حذف الدرس.");
      return;
    }
    setBanner({ type: "ok", text: "تم حذف الدرس." });
    if (editingId === lessonId) resetForm();
    await loadCourses();
  }

  async function togglePublish(row) {
    setBanner(null);
    const res = await fetch(`/api/admin/lessons/${row.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !row.isPublished }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setError(data?.message || "تعذّر تحديث حالة النشر.");
      return;
    }
    setBanner({ type: "ok", text: row.isPublished ? "تم إخفاء الدرس." : "تم نشر الدرس." });
    await loadCourses();
  }

  return (
    <AdminShell
      title="دروسي — المحتوى المدفوع"
      subtitle="إدارة دروس الحساب الكامل عبر الدورات المدفوعة (Course.system = PAID) ونموذج Lesson الحالي."
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

      <AdminSectionCard
        title="إضافة / تعديل درس مدفوع"
        subtitle="المستوى والمادة يُحفظان على الدورة المرتبطة. عنوان الدرس والفيديو والوصف على Lesson."
      >
        {!courses.length && !loading ? (
          <AdminEmptyState
            title="لا توجد دورات مدفوعة"
            description="أنشئ دورة مدفوعة أولًا من إدارة الدورات، ثم ارجع لربط الدروس بها."
          />
        ) : null}

        <form className="mt-2 grid gap-3 md:grid-cols-2" onSubmit={save} dir="rtl">
          <AdminFormField label="الدورة / الباقة المدفوعة">
            <AdminSelect
              value={form.courseId}
              onChange={(e) => onSelectCourse(e.target.value)}
              required
              disabled={Boolean(editingId)}
              className="w-full"
            >
              <option value="">اختر دورة مدفوعة…</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                  {course.status === "PUBLISHED" ? "" : " (مسودة)"}
                </option>
              ))}
            </AdminSelect>
          </AdminFormField>

          <AdminFormField label="عنوان الدرس">
            <AdminInput
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              required
            />
          </AdminFormField>

          <AdminFormField label="المستوى الدراسي">
            <AdminSelect
              value={form.level}
              onChange={(e) => setForm((s) => ({ ...s, level: e.target.value }))}
              className="w-full"
            >
              <option value="">بدون تحديد</option>
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
              placeholder="مثال: رياضيات"
            />
          </AdminFormField>

          <AdminFormField label="رابط فيديو YouTube" className="md:col-span-2">
            <AdminInput
              value={form.youtubeUrl}
              onChange={(e) => setForm((s) => ({ ...s, youtubeUrl: e.target.value }))}
              placeholder="https://youtube.com/watch?v=..."
              required
            />
          </AdminFormField>

          <AdminFormField label="الوصف" className="md:col-span-2">
            <AdminInput
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
            />
          </AdminFormField>

          <AdminFormField label="الترتيب">
            <AdminInput
              type="number"
              min="1"
              value={form.order}
              onChange={(e) => setForm((s) => ({ ...s, order: Number(e.target.value) || 1 }))}
            />
          </AdminFormField>

          <AdminFormField label="حالة النشر">
            <AdminSelect
              value={form.isPublished ? "1" : "0"}
              onChange={(e) => setForm((s) => ({ ...s, isPublished: e.target.value === "1" }))}
              className="w-full"
            >
              <option value="0">مخفي</option>
              <option value="1">منشور</option>
            </AdminSelect>
          </AdminFormField>

          {error ? <p className="md:col-span-2 text-sm font-semibold text-red-700">{error}</p> : null}

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <AdminActionButton type="submit" tone="primary" disabled={saving || !courses.length}>
              {saving ? "جاري الحفظ…" : editingId ? "حفظ التعديل" : "إنشاء درس"}
            </AdminActionButton>
            {editingId ? (
              <AdminActionButton type="button" onClick={resetForm}>
                إلغاء التعديل
              </AdminActionButton>
            ) : null}
            <Link href="/admin/courses" className="text-sm font-bold text-brand-700 underline self-center">
              فتح إدارة الدورات
            </Link>
          </div>
        </form>
      </AdminSectionCard>

      <AdminSectionCard title="دروس المحتوى المدفوع" subtitle="كل الدروس المرتبطة بدورات system = PAID فقط.">
        {loading ? (
          <p className="text-sm text-slate-500">جاري التحميل…</p>
        ) : !flatLessons.length ? (
          <AdminEmptyState title="لا توجد دروس بعد" description="أنشئ أول درس مدفوع من النموذج أعلاه." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-right text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="px-3 py-2 font-bold">الدرس</th>
                  <th className="px-3 py-2 font-bold">الدورة</th>
                  <th className="px-3 py-2 font-bold">المستوى</th>
                  <th className="px-3 py-2 font-bold">المادة</th>
                  <th className="px-3 py-2 font-bold">الحالة</th>
                  <th className="px-3 py-2 font-bold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {flatLessons.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="px-3 py-3">
                      <p className="font-extrabold text-slate-900">{row.title}</p>
                      {row.description ? <p className="mt-1 text-xs text-slate-500 line-clamp-2">{row.description}</p> : null}
                    </td>
                    <td className="px-3 py-3 text-slate-700">{row.courseTitle}</td>
                    <td className="px-3 py-3 text-slate-700">
                      {getDisplayLevelLabel(row) || "—"}
                    </td>
                    <td className="px-3 py-3 text-slate-700">{row.subject || "—"}</td>
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
                        <AdminActionButton type="button" tone="danger" onClick={() => removeLesson(row.id)}>
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
