 "use client";

import { useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminBadge, AdminCard, AdminEmptyState, AdminInput, AdminSelect, AdminToolbar } from "@/components/admin/AdminUI";
import { ACADEMIC_LEVELS, getLessonAcademicLevel } from "@/lib/academic-levels";
import { STUDENT_LEVEL_SELECT_OPTIONS } from "@/lib/student-level-codes";
import { useDemoSection } from "@/lib/demo-store";
import { isLessonPublished, normalizeLessonAccessType } from "@/lib/lesson-utils";

export default function AdminLessonsPage() {
  const [lessonData, setLessonData] = useDemoSection("lessons");
  const [packageData] = useDemoSection("packages");
  const [packages, setPackages] = useDemoSection("packages");
  const safeLessons = Array.isArray(lessonData) ? lessonData : [];
  const safePackages = Array.isArray(packageData) ? packageData : [];
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("الكل");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    packageId: "",
    type: "text",
    duration: 20,
    youtubeUrl: "",
    isPublished: false,
    accessType: "free",
    academicLevel: "",
    level: "",
  });

  const rows = useMemo(() => {
    return safeLessons
      .map((lesson) => ({
        ...lesson,
        packageName: safePackages.find((pkg) => pkg.id === lesson.packageId)?.title || "-",
      }))
      .filter((lesson) => {
        const target = `${lesson.title} ${lesson.packageName}`.toLowerCase();
        const matchesQuery = target.includes(query.trim().toLowerCase());
        const matchesType = typeFilter === "الكل" || lesson.type === typeFilter;
        return matchesQuery && matchesType;
      });
  }, [safeLessons, safePackages, query, typeFilter]);

  function moveLesson(lessonId, direction) {
    const currentLesson = safeLessons.find((row) => row.id === lessonId);
    if (!currentLesson) return;

    const samePackage = safeLessons
      .filter((row) => row.packageId === currentLesson.packageId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const currentIndex = samePackage.findIndex((row) => row.id === lessonId);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= samePackage.length) return;

    const source = samePackage[currentIndex];
    const target = samePackage[targetIndex];

    const nextLessons = safeLessons.map((row) => {
      if (row.id === source.id) return { ...row, order: target.order };
      if (row.id === target.id) return { ...row, order: source.order };
      return row;
    });

    setLessonData(nextLessons);
  }

  function syncPackageLessonCounts(nextLessons) {
    setPackages((packages || []).map((pkg) => ({
      ...pkg,
      lessonsCount: nextLessons.filter((lesson) => lesson.packageId === pkg.id).length,
    })));
  }

  function resetForm() {
    setForm({
      title: "",
      description: "",
      packageId: (safePackages || [])[0]?.id || "",
      type: "text",
      duration: 20,
      youtubeUrl: "",
      isPublished: false,
      accessType: "free",
      academicLevel: "",
      level: "",
    });
    setEditingId(null);
    setShowForm(false);
  }

  function openCreateForm() {
    setForm({
      title: "",
      description: "",
      packageId: (safePackages || [])[0]?.id || "",
      type: "text",
      duration: 20,
      youtubeUrl: "",
      isPublished: false,
      accessType: "free",
      academicLevel: "",
      level: "",
    });
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(lesson) {
    setForm({
      title: lesson.title || "",
      description: lesson.description || "",
      packageId: lesson.packageId || (safePackages || [])[0]?.id || "",
      type: lesson.type || "text",
      duration: Number(lesson.duration || 20),
      youtubeUrl: lesson.youtubeUrl || "",
      isPublished: isLessonPublished(lesson),
      accessType: normalizeLessonAccessType(lesson),
      academicLevel: String(lesson.academicLevel ?? "").trim(),
      level: String(lesson.level ?? "").trim(),
    });
    setEditingId(lesson.id);
    setShowForm(true);
  }

  function saveLesson() {
    const title = form.title.trim();
    if (!title || !safePackages.length || !form.packageId) return;
    const nextPackageId = form.packageId || safePackages[0].id;
    const lessonLevel = String(form.academicLevel ?? "").trim();
    const levelCodeTrim = String(form.level ?? "").trim();
    if (editingId) {
      const accessType = form.accessType === "premium" ? "premium" : "free";
      const nextLessons = (lessonData || []).map((row) => {
        if (row.id !== editingId) return row;
        const next = {
          ...row,
          title,
          slug: title.replace(/\s+/g, "-"),
          description: form.description,
          packageId: nextPackageId,
          type: form.type,
          duration: Number(form.duration) || 0,
          youtubeUrl: form.youtubeUrl,
          isPublished: form.isPublished === true,
          accessType,
          academicLevel: lessonLevel,
        };
        if (levelCodeTrim) next.level = levelCodeTrim;
        else delete next.level;
        return next;
      });
      setLessonData(nextLessons);
      syncPackageLessonCounts(nextLessons);
      resetForm();
      return;
    }
    const accessType = form.accessType === "premium" ? "premium" : "free";
    const newLesson = {
      id: `lesson-${Date.now()}`,
      slug: title.replace(/\s+/g, "-"),
      title,
      description: form.description || "وصف مبدئي لدرس جديد.",
      packageId: nextPackageId,
      type: form.type || "text",
      duration: Number(form.duration) || 0,
      isPublished: form.isPublished === true,
      accessType,
      order: safeLessons.filter((row) => row.packageId === nextPackageId).length + 1,
      youtubeUrl: form.youtubeUrl || "",
      attachments: [],
      academicLevel: lessonLevel,
    };
    if (levelCodeTrim) newLesson.level = levelCodeTrim;
    const nextLessons = [...safeLessons, newLesson];
    setLessonData(nextLessons);
    syncPackageLessonCounts(nextLessons);
    resetForm();
  }

  return (
    <AdminShell title="إدارة الدروس" subtitle="تنظيم تسلسل الدروس وأنواعها ونشرها داخل الدورات الأدبية.">
      <AdminCard title="مركز إدارة الدروس" subtitle="إضافة وتعديل ونشر دروس الأدب العربي باستخدام روابط يوتيوب فقط.">
        <AdminToolbar>
          <AdminInput
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن درس..."
          />
          <AdminSelect
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option>الكل</option>
            <option value="video">video</option>
            <option value="pdf">pdf</option>
            <option value="text">text</option>
            <option value="quiz">quiz</option>
          </AdminSelect>
          {!showForm ? (
            <button onClick={openCreateForm} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white">إضافة درس</button>
          ) : (
            <span className="text-xs font-semibold text-brand-700">{editingId ? "تعديل درس" : "إضافة درس جديد"}</span>
          )}
        </AdminToolbar>
        {showForm ? (
          <form
            className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              saveLesson();
            }}
          >
            <AdminInput value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} placeholder="عنوان الدرس" />
            <AdminInput value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} placeholder="وصف مختصر" />
            <AdminSelect value={form.packageId} onChange={(e) => setForm((s) => ({ ...s, packageId: e.target.value }))}>
              {safePackages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.title}
                </option>
              ))}
            </AdminSelect>
            <AdminSelect value={form.type} onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}>
              <option value="video">video</option>
              <option value="pdf">pdf</option>
              <option value="text">text</option>
              <option value="quiz">quiz</option>
            </AdminSelect>
            <AdminInput type="number" min="0" value={form.duration} onChange={(e) => setForm((s) => ({ ...s, duration: Number(e.target.value) }))} placeholder="المدة بالدقائق" />
            <AdminInput value={form.youtubeUrl} onChange={(e) => setForm((s) => ({ ...s, youtubeUrl: e.target.value }))} placeholder="رابط يوتيوب" />
            <AdminSelect value={form.isPublished ? "published" : "draft"} onChange={(e) => setForm((s) => ({ ...s, isPublished: e.target.value === "published" }))}>
              <option value="draft">مسودة</option>
              <option value="published">منشور</option>
            </AdminSelect>
            <AdminSelect value={form.accessType === "premium" ? "premium" : "free"} onChange={(e) => setForm((s) => ({ ...s, accessType: e.target.value }))}>
              <option value="free">مجاني</option>
              <option value="premium">مدفوع</option>
            </AdminSelect>
            <AdminSelect
              value={form.academicLevel || ""}
              onChange={(e) => setForm((s) => ({ ...s, academicLevel: e.target.value }))}
              aria-label="المستوى الدراسي (اختياري)"
            >
              <option value="">يستورث من الدورة</option>
              {ACADEMIC_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </AdminSelect>
            <AdminSelect
              value={form.level || ""}
              onChange={(e) => setForm((s) => ({ ...s, level: e.target.value }))}
              aria-label="رمز المستوى (اختياري)"
            >
              <option value="">— بدون رمز (يستورث من الدورة)</option>
              {STUDENT_LEVEL_SELECT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </AdminSelect>
            <div className="flex gap-2 md:col-span-2">
              <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white">حفظ</button>
              <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">إلغاء</button>
            </div>
          </form>
        ) : null}
        {!rows.length ? (
          <AdminEmptyState title="لا توجد دروس مطابقة" description="جرّب تعديل البحث أو نوع الدرس." />
        ) : (
          <div className="space-y-2">
            {rows.map((lesson) => (
              <article key={lesson.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900">{lesson.title}</p>
                    <p className="mt-1 text-slate-600">
                      الدورة: {lesson.packageName} - النوع: {lesson.type} - المدة: {lesson.duration} دقيقة - الترتيب: {lesson.order} - المستوى الظاهر للطلاب:{" "}
                      {getLessonAcademicLevel(lesson, safePackages)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">رابط يوتيوب: {lesson.youtubeUrl || "غير مضبوط"}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <AdminBadge tone={isLessonPublished(lesson) ? "success" : "warning"}>{isLessonPublished(lesson) ? "منشور" : "مسودة"}</AdminBadge>
                    {normalizeLessonAccessType(lesson) === "premium" ? (
                      <AdminBadge tone="slate">مدفوع</AdminBadge>
                    ) : (
                      <AdminBadge tone="success">مجاني</AdminBadge>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      setLessonData((lessonData || []).map((row) =>
                        row.id === lesson.id ? { ...row, isPublished: !isLessonPublished(row) } : row
                      ))
                    }
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                  >
                    نشر/إلغاء نشر
                  </button>
                  <AdminSelect
                    value={normalizeLessonAccessType(lesson)}
                    onChange={(e) =>
                      setLessonData((lessonData || []).map((row) =>
                        row.id === lesson.id ? { ...row, accessType: e.target.value === "premium" ? "premium" : "free" } : row
                      ))
                    }
                    className="max-w-[140px] text-xs"
                  >
                    <option value="free">مجاني</option>
                    <option value="premium">مدفوع</option>
                  </AdminSelect>
                  <button
                    onClick={() =>
                      safePackages.length
                        ? setLessonData(
                            (lessonData || []).map((row) =>
                              row.id === lesson.id
                                ? {
                                    ...row,
                                    packageId: safePackages[(safePackages.findIndex((c) => c.id === row.packageId) + 1) % safePackages.length]?.id || row.packageId,
                                  }
                                : row
                            )
                          )
                        : null
                    }
                    disabled={!safePackages.length}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    تغيير الدورة
                  </button>
                  {(() => {
                    const packageRows = rows
                      .filter((row) => row.packageId === lesson.packageId)
                      .sort((a, b) => (a.order || 0) - (b.order || 0));
                    const idx = packageRows.findIndex((row) => row.id === lesson.id);
                    const isFirst = idx <= 0;
                    const isLast = idx === packageRows.length - 1;
                    return (
                      <>
                        <button
                          onClick={() => moveLesson(lesson.id, "up")}
                          disabled={isFirst}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                          title="تحريك للأعلى"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveLesson(lesson.id, "down")}
                          disabled={isLast}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                          title="تحريك للأسفل"
                        >
                          ↓
                        </button>
                      </>
                    );
                  })()}
                  <button
                    onClick={() => setLessonData((lessonData || []).map((row) => (row.id === lesson.id ? { ...row, duration: row.duration + 5 } : row)))}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                  >
                    +5 دقائق
                  </button>
                  <button
                    onClick={() => {
                      const nextUrl = window.prompt("أدخل رابط يوتيوب للدرس", lesson.youtubeUrl || "https://www.youtube.com/watch?v=Hf4_Ma5t8xE");
                      if (nextUrl === null) return;
                      setLessonData((lessonData || []).map((row) => (row.id === lesson.id ? { ...row, youtubeUrl: nextUrl.trim() } : row)));
                    }}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                  >
                    تحديث رابط يوتيوب
                  </button>
                  <button onClick={() => openEditForm(lesson)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs">
                    تعديل
                  </button>
                  <button
                    onClick={() => {
                      const nextLessons = (lessonData || []).filter((row) => row.id !== lesson.id);
                      setLessonData(nextLessons);
                      syncPackageLessonCounts(nextLessons);
                    }}
                    className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700"
                  >
                    حذف
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </AdminCard>
    </AdminShell>
  );
}
