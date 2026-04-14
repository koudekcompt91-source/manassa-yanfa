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
import { useDemoSection } from "@/lib/demo-store";
import { ACADEMIC_LEVELS, DEFAULT_ACADEMIC_LEVEL } from "@/lib/academic-levels";
import { STUDENT_LEVEL_SELECT_OPTIONS } from "@/lib/student-level-codes";
import { formatDzd } from "@/lib/format-money";

const EMPTY_COURSE_FORM = {
  title: "",
  description: "",
  categoryId: "",
  teacherId: "",
  thumbnailUrl: "",
  status: "DRAFT",
  accessType: "FREE",
  price: 0,
  academicLevel: DEFAULT_ACADEMIC_LEVEL,
  level: "",
};

const EMPTY_LESSON_FORM = {
  title: "",
  youtubeUrl: "",
  description: "",
  order: 1,
  isPublished: true,
  isFreePreview: false,
  durationSec: "",
};

export default function AdminPackagesPage() {
  const [categories] = useDemoSection("categories");
  const [teachers] = useDemoSection("teachers");

  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [categoryFilter, setCategoryFilter] = useState("الكل");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseForm, setCourseForm] = useState(EMPTY_COURSE_FORM);
  const [savingCourse, setSavingCourse] = useState(false);
  const [courseFormError, setCourseFormError] = useState("");
  const [banner, setBanner] = useState({ type: "", text: "" });

  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [lessonCourse, setLessonCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonForm, setLessonForm] = useState(EMPTY_LESSON_FORM);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [lessonError, setLessonError] = useState("");
  const [lessonSaving, setLessonSaving] = useState(false);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/courses", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.message || "تعذّر تحميل الدورات.");
        setCourses([]);
        return;
      }
      setCourses(Array.isArray(data.courses) ? data.courses : []);
    } catch {
      setError("حدث خطأ أثناء تحميل الدورات.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const rows = useMemo(() => {
    return (courses || [])
      .map((course) => ({
        ...course,
        teacherName: (teachers || []).find((row) => row.id === course.teacherId)?.name || "-",
        categoryName: (categories || []).find((row) => row.id === course.categoryId)?.name || "-",
      }))
      .filter((course) => {
        const target = `${course.title} ${course.categoryName} ${course.teacherName}`.toLowerCase();
        const matchesQuery = target.includes(query.trim().toLowerCase());
        const matchesStatus =
          statusFilter === "الكل" ||
          (statusFilter === "published" ? course.status === "PUBLISHED" : course.status !== "PUBLISHED");
        const matchesCategory = categoryFilter === "الكل" || course.categoryId === categoryFilter;
        return matchesQuery && matchesStatus && matchesCategory;
      });
  }, [courses, categories, teachers, query, statusFilter, categoryFilter]);

  function resetCourseForm() {
    setCourseForm(EMPTY_COURSE_FORM);
    setEditingCourseId(null);
    setShowCourseForm(false);
    setCourseFormError("");
  }

  function openCreateForm() {
    setCourseForm({
      ...EMPTY_COURSE_FORM,
      categoryId: (categories || [])[0]?.id || "",
      teacherId: (teachers || [])[0]?.id || "",
    });
    setEditingCourseId(null);
    setShowCourseForm(true);
    setCourseFormError("");
  }

  function openEditForm(course) {
    setCourseForm({
      title: course.title || "",
      description: course.description || "",
      categoryId: course.categoryId || "",
      teacherId: course.teacherId || "",
      thumbnailUrl: course.coverImage || "",
      status: course.status || "DRAFT",
      accessType: course.accessType || "FREE",
      price: Number(course.price ?? course.priceMad ?? 0) || 0,
      academicLevel: course.academicLevel || DEFAULT_ACADEMIC_LEVEL,
      level: course.level || "",
    });
    setEditingCourseId(course.id);
    setShowCourseForm(true);
    setCourseFormError("");
  }

  async function saveCourse(e) {
    e.preventDefault();
    setCourseFormError("");
    setSavingCourse(true);
    try {
      if (!courseForm.title.trim()) {
        setCourseFormError("عنوان الدورة مطلوب.");
        return;
      }
      if (courseForm.accessType === "PAID" && (!(Number(courseForm.price) > 0) || !Number.isFinite(Number(courseForm.price)))) {
        setCourseFormError("أدخل سعرًا صحيحًا للدورة المدفوعة.");
        return;
      }

      const payload = {
        ...courseForm,
        price: courseForm.accessType === "PAID" ? Math.round(Number(courseForm.price) || 0) : 0,
      };

      const isEdit = !!editingCourseId;
      const url = isEdit ? `/api/admin/courses/${editingCourseId}` : "/api/admin/courses";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setCourseFormError(data?.message || "تعذّر حفظ الدورة.");
        return;
      }
      setBanner({ type: "success", text: data?.message || "تم حفظ الدورة بنجاح." });
      resetCourseForm();
      await loadCourses();
    } finally {
      setSavingCourse(false);
    }
  }

  async function deleteCourse(courseId) {
    const res = await fetch(`/api/admin/courses/${courseId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setBanner({ type: "error", text: data?.message || "تعذّر حذف الدورة." });
      return;
    }
    setBanner({ type: "success", text: "تم حذف الدورة." });
    await loadCourses();
  }

  async function togglePublish(course) {
    const nextStatus = course.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const res = await fetch(`/api/admin/courses/${course.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setBanner({ type: "error", text: data?.message || "تعذّر تحديث حالة النشر." });
      return;
    }
    await loadCourses();
  }

  async function toggleFeature(course) {
    const res = await fetch(`/api/admin/courses/${course.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !course.isFeatured }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setBanner({ type: "error", text: data?.message || "تعذّر تحديث حالة التمييز." });
      return;
    }
    await loadCourses();
  }

  async function openLessonsManager(course) {
    setLessonCourse(course);
    setLessonModalOpen(true);
    setEditingLessonId(null);
    setLessonForm(EMPTY_LESSON_FORM);
    setLessonError("");
    setLessonsLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}/lessons`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setLessonError(data?.message || "تعذّر تحميل الدروس.");
        setLessons([]);
        return;
      }
      setLessons(Array.isArray(data.lessons) ? data.lessons : []);
    } finally {
      setLessonsLoading(false);
    }
  }

  function openLessonEdit(lesson) {
    setEditingLessonId(lesson.id);
    setLessonForm({
      title: lesson.title || "",
      youtubeUrl: lesson.youtubeUrl || "",
      description: lesson.description || "",
      order: lesson.order || 1,
      isPublished: lesson.isPublished === true,
      isFreePreview: lesson.isFreePreview === true,
      durationSec: lesson.durationSec || "",
    });
    setLessonError("");
  }

  function resetLessonForm() {
    setEditingLessonId(null);
    setLessonForm({
      ...EMPTY_LESSON_FORM,
      order: lessons.length + 1,
    });
    setLessonError("");
  }

  async function saveLesson(e) {
    e.preventDefault();
    if (!lessonCourse) return;
    setLessonError("");
    setLessonSaving(true);
    try {
      const payload = {
        ...lessonForm,
        order: Math.max(1, Number(lessonForm.order) || 1),
        durationSec: lessonForm.durationSec === "" ? null : Math.max(0, Number(lessonForm.durationSec) || 0),
      };
      const isEdit = !!editingLessonId;
      const url = isEdit ? `/api/admin/lessons/${editingLessonId}` : `/api/admin/courses/${lessonCourse.id}/lessons`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setLessonError(data?.message || "تعذّر حفظ الدرس.");
        return;
      }
      await openLessonsManager(lessonCourse);
      resetLessonForm();
    } finally {
      setLessonSaving(false);
    }
  }

  async function deleteLesson(lessonId) {
    const res = await fetch(`/api/admin/lessons/${lessonId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setLessonError(data?.message || "تعذّر حذف الدرس.");
      return;
    }
    if (lessonCourse) await openLessonsManager(lessonCourse);
  }

  async function moveLesson(lessonId, direction) {
    const idx = lessons.findIndex((lesson) => lesson.id === lessonId);
    if (idx < 0) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= lessons.length) return;
    const next = [...lessons];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    setLessons(next.map((lesson, i) => ({ ...lesson, order: i + 1 })));

    const res = await fetch(`/api/admin/courses/${lessonCourse.id}/lessons/reorder`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonIds: next.map((lesson) => lesson.id) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setLessonError(data?.message || "تعذّر حفظ ترتيب الدروس.");
      return;
    }
    await openLessonsManager(lessonCourse);
  }

  function shortText(value, max = 96) {
    const s = String(value || "").trim();
    if (!s) return "بدون وصف.";
    return s.length > max ? `${s.slice(0, max)}...` : s;
  }

  return (
    <AdminShell title="إدارة الدورات" subtitle="إنشاء الدورات وربطها بالمحتوى والدروس داخل المنصة.">
      <AdminSectionCard title="إدارة الدورات" subtitle="أنشئ دورة مجانية أو مدفوعة ثم أضف الدروس المرتبطة بها.">
        {banner.text ? (
          <div className={`mb-4 rounded-xl border px-3 py-2 text-sm ${banner.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
            {banner.text}
          </div>
        ) : null}
        {error ? <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

        <AdminToolbar>
          <AdminInput type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن دورة..." />
          <AdminSelect value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="الكل">كل التصنيفات</option>
            {(categories || []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </AdminSelect>
          <AdminSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="الكل">كل الحالات</option>
            <option value="published">منشورة</option>
            <option value="draft">مسودة</option>
          </AdminSelect>
          {!showCourseForm ? (
            <AdminActionButton onClick={openCreateForm} tone="primary" className="rounded-xl px-4 py-2 text-sm font-bold">
              إنشاء دورة جديدة
            </AdminActionButton>
          ) : (
            <span className="self-center text-xs font-semibold text-brand-700">{editingCourseId ? "تعديل الدورة" : "إضافة دورة جديدة"}</span>
          )}
        </AdminToolbar>

        {showCourseForm ? (
          <form className="mb-6 grid gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 md:grid-cols-2" onSubmit={saveCourse}>
            <AdminFormField label="عنوان الدورة">
              <AdminInput value={courseForm.title} onChange={(e) => setCourseForm((s) => ({ ...s, title: e.target.value }))} placeholder="عنوان الدورة" required />
            </AdminFormField>
            <AdminFormField label="الوصف">
              <AdminInput value={courseForm.description} onChange={(e) => setCourseForm((s) => ({ ...s, description: e.target.value }))} placeholder="وصف الدورة" />
            </AdminFormField>
            <AdminFormField label="التصنيف">
              <AdminSelect value={courseForm.categoryId} onChange={(e) => setCourseForm((s) => ({ ...s, categoryId: e.target.value }))}>
                <option value="">بدون تصنيف</option>
                {(categories || []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </AdminSelect>
            </AdminFormField>
            <AdminFormField label="الأستاذ">
              <AdminSelect value={courseForm.teacherId} onChange={(e) => setCourseForm((s) => ({ ...s, teacherId: e.target.value }))}>
                <option value="">بدون أستاذ محدد</option>
                {(teachers || []).map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </AdminSelect>
            </AdminFormField>
            <AdminFormField label="رابط صورة الدورة">
              <AdminInput value={courseForm.thumbnailUrl} onChange={(e) => setCourseForm((s) => ({ ...s, thumbnailUrl: e.target.value }))} placeholder="https://..." />
            </AdminFormField>
            <AdminFormField label="حالة الدورة">
              <AdminSelect value={courseForm.status} onChange={(e) => setCourseForm((s) => ({ ...s, status: e.target.value }))}>
                <option value="DRAFT">مسودة</option>
                <option value="PUBLISHED">منشورة</option>
              </AdminSelect>
            </AdminFormField>
            <AdminFormField label="نوع الوصول">
              <AdminSelect
                value={courseForm.accessType}
                onChange={(e) =>
                  setCourseForm((s) => ({
                    ...s,
                    accessType: e.target.value,
                    price: e.target.value === "PAID" ? s.price || 1 : 0,
                  }))
                }
              >
                <option value="FREE">مجانية</option>
                <option value="PAID">مدفوعة</option>
              </AdminSelect>
            </AdminFormField>
            {courseForm.accessType === "PAID" ? (
              <AdminFormField label="السعر (دج)">
                <AdminInput
                  type="number"
                  min="1"
                  value={courseForm.price}
                  onChange={(e) => setCourseForm((s) => ({ ...s, price: Number(e.target.value) || 0 }))}
                  required
                />
              </AdminFormField>
            ) : null}
            <AdminFormField label="المستوى الدراسي">
              <AdminSelect value={courseForm.academicLevel} onChange={(e) => setCourseForm((s) => ({ ...s, academicLevel: e.target.value }))}>
                {ACADEMIC_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </AdminSelect>
            </AdminFormField>
            <AdminFormField label="رمز المستوى (اختياري)">
              <AdminSelect value={courseForm.level} onChange={(e) => setCourseForm((s) => ({ ...s, level: e.target.value }))}>
                <option value="">بدون رمز</option>
                {STUDENT_LEVEL_SELECT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </AdminSelect>
            </AdminFormField>
            {courseFormError ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 md:col-span-2">{courseFormError}</p> : null}
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <AdminActionButton type="submit" tone="primary" className="rounded-xl px-4 py-2 text-sm font-bold" disabled={savingCourse}>
                {savingCourse ? "جاري الحفظ..." : "حفظ الدورة"}
              </AdminActionButton>
              <AdminActionButton type="button" onClick={resetCourseForm} className="rounded-xl px-4 py-2 text-sm font-bold">
                إلغاء
              </AdminActionButton>
            </div>
          </form>
        ) : null}

        {loading ? <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">جاري تحميل الدورات...</p> : null}
        {!loading && !rows.length ? (
          <AdminEmptyState title="لا توجد دورات" description="ابدأ بإنشاء دورة جديدة ثم أضف دروسها." />
        ) : null}
        {!loading && rows.length ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-right text-xs font-semibold tracking-wide text-slate-500">
                  <th className="px-4 py-3">الدورة</th>
                  <th className="px-3 py-3">التصنيف</th>
                  <th className="px-3 py-3">الأستاذ</th>
                  <th className="px-3 py-3">الدروس</th>
                  <th className="px-3 py-3">السعر</th>
                  <th className="px-3 py-3">الحالة</th>
                  <th className="px-4 py-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((course) => (
                  <tr key={course.id} className="border-b border-slate-100 align-top text-slate-700 transition hover:bg-slate-50/50">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{course.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{shortText(course.description)}</p>
                    </td>
                    <td className="px-3 py-4">{course.categoryName}</td>
                    <td className="px-3 py-4">{course.teacherName}</td>
                    <td className="px-3 py-4 font-semibold">{course.lessonsCount ?? 0}</td>
                    <td className="px-3 py-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${course.accessType === "PAID" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"}`}>
                        {course.accessType === "PAID" ? "مدفوعة" : "مجانية"}
                      </span>
                      <span className="mt-1 block font-semibold text-slate-900">{formatDzd(Number(course.price ?? course.priceMad ?? 0))}</span>
                    </td>
                    <td className="px-3 py-4">
                      <AdminBadge tone={course.status === "PUBLISHED" ? "success" : "warning"}>{course.status === "PUBLISHED" ? "منشورة" : "مسودة"}</AdminBadge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <AdminActionButton onClick={() => openEditForm(course)}>تعديل</AdminActionButton>
                        <AdminActionButton onClick={() => togglePublish(course)}>{course.status === "PUBLISHED" ? "إلغاء النشر" : "نشر"}</AdminActionButton>
                        <AdminActionButton onClick={() => toggleFeature(course)}>{course.isFeatured ? "إلغاء التمييز" : "تمييز"}</AdminActionButton>
                        <AdminActionButton onClick={() => openLessonsManager(course)} tone="primary">
                          إدارة الدروس
                        </AdminActionButton>
                        <AdminActionButton onClick={() => deleteCourse(course.id)} tone="danger">
                          حذف
                        </AdminActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </AdminSectionCard>

      {lessonModalOpen && lessonCourse ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">إدارة الدروس: {lessonCourse.title}</h2>
                <p className="mt-1 text-sm text-slate-600">أضف الدروس ورتّبها لتظهر للطالب كتسلسل منهجي داخل الدورة.</p>
              </div>
              <AdminActionButton onClick={() => setLessonModalOpen(false)}>إغلاق</AdminActionButton>
            </div>

            <form className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 md:grid-cols-2" onSubmit={saveLesson}>
              <AdminFormField label="عنوان الدرس">
                <AdminInput value={lessonForm.title} onChange={(e) => setLessonForm((s) => ({ ...s, title: e.target.value }))} required />
              </AdminFormField>
              <AdminFormField label="رابط يوتيوب">
                <AdminInput value={lessonForm.youtubeUrl} onChange={(e) => setLessonForm((s) => ({ ...s, youtubeUrl: e.target.value }))} placeholder="https://youtube.com/watch?v=..." required />
              </AdminFormField>
              <AdminFormField label="الوصف (اختياري)">
                <AdminInput value={lessonForm.description} onChange={(e) => setLessonForm((s) => ({ ...s, description: e.target.value }))} />
              </AdminFormField>
              <AdminFormField label="الترتيب">
                <AdminInput type="number" min="1" value={lessonForm.order} onChange={(e) => setLessonForm((s) => ({ ...s, order: Number(e.target.value) || 1 }))} />
              </AdminFormField>
              <AdminFormField label="المدة بالثواني (اختياري)">
                <AdminInput type="number" min="0" value={lessonForm.durationSec} onChange={(e) => setLessonForm((s) => ({ ...s, durationSec: e.target.value }))} />
              </AdminFormField>
              <AdminFormField label="الحالة">
                <AdminSelect value={lessonForm.isPublished ? "1" : "0"} onChange={(e) => setLessonForm((s) => ({ ...s, isPublished: e.target.value === "1" }))}>
                  <option value="1">منشور</option>
                  <option value="0">مخفي</option>
                </AdminSelect>
              </AdminFormField>
              <AdminFormField label="معاينة مجانية">
                <AdminSelect value={lessonForm.isFreePreview ? "1" : "0"} onChange={(e) => setLessonForm((s) => ({ ...s, isFreePreview: e.target.value === "1" }))}>
                  <option value="0">لا</option>
                  <option value="1">نعم</option>
                </AdminSelect>
              </AdminFormField>
              {lessonError ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 md:col-span-2">{lessonError}</p> : null}
              <div className="flex flex-wrap gap-2 md:col-span-2">
                <AdminActionButton type="submit" tone="primary" disabled={lessonSaving}>
                  {lessonSaving ? "جاري الحفظ..." : editingLessonId ? "تحديث الدرس" : "إضافة درس"}
                </AdminActionButton>
                {editingLessonId ? (
                  <AdminActionButton type="button" onClick={resetLessonForm}>
                    إلغاء التعديل
                  </AdminActionButton>
                ) : null}
              </div>
            </form>

            {lessonsLoading ? <p className="mt-4 text-sm text-slate-600">جاري تحميل الدروس...</p> : null}
            {!lessonsLoading && !lessons.length ? <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">لا توجد دروس بعد. أضف أول درس للدورة.</p> : null}
            {!lessonsLoading && lessons.length ? (
              <div className="mt-4 space-y-2">
                {lessons.map((lesson, idx) => (
                  <div key={lesson.id} className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {idx + 1}. {lesson.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{lesson.youtubeUrl}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <AdminBadge tone={lesson.isPublished ? "success" : "warning"}>{lesson.isPublished ? "منشور" : "مخفي"}</AdminBadge>
                        {lesson.isFreePreview ? <AdminBadge tone="brand">معاينة مجانية</AdminBadge> : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <AdminActionButton onClick={() => moveLesson(lesson.id, "up")} disabled={idx === 0}>↑</AdminActionButton>
                      <AdminActionButton onClick={() => moveLesson(lesson.id, "down")} disabled={idx === lessons.length - 1}>↓</AdminActionButton>
                      <AdminActionButton onClick={() => openLessonEdit(lesson)}>تعديل</AdminActionButton>
                      <AdminActionButton onClick={() => deleteLesson(lesson.id)} tone="danger">حذف</AdminActionButton>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
