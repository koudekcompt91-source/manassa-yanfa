"use client";

import { useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminActionButton, AdminEmptyState, AdminInput, AdminSectionCard, AdminSelect, AdminToolbar } from "@/components/admin/AdminUI";
import { useDemoSection } from "@/lib/demo-store";
import { ACADEMIC_LEVELS, DEFAULT_ACADEMIC_LEVEL } from "@/lib/academic-levels";
import { STUDENT_LEVEL_SELECT_OPTIONS } from "@/lib/student-level-codes";
import { defaultDemoData } from "@/lib/demo-data/defaults";
import { getPackagePriceMad } from "@/lib/wallet-ops";
import { formatDzd } from "@/lib/format-money";

export default function AdminPackagesPage() {
  const [packages, setPackages] = useDemoSection("packages");
  const [teachers] = useDemoSection("teachers");
  const [categories] = useDemoSection("categories");
  const [lessons] = useDemoSection("lessons");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [categoryFilter, setCategoryFilter] = useState("الكل");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    teacherId: "",
    priceType: "free",
    isPublished: false,
    academicLevel: DEFAULT_ACADEMIC_LEVEL,
    level: "",
  });

  const rows = useMemo(() => {
    return (packages || [])
      .map((pkg) => ({
        ...pkg,
        teacherName: (teachers || []).find((row) => row.id === pkg.teacherId)?.name || "-",
        categoryName: (categories || []).find((row) => row.id === pkg.categoryId)?.name || "-",
        computedLessonsCount: (lessons || []).filter((lesson) => lesson.packageId === pkg.id).length,
      }))
      .filter((pkg) => {
        const target = `${pkg.title} ${pkg.categoryName} ${pkg.teacherName}`.toLowerCase();
        const matchesQuery = target.includes(query.trim().toLowerCase());
        const matchesStatus = statusFilter === "الكل" || (statusFilter === "published" ? pkg.isPublished : !pkg.isPublished);
        const matchesCategory = categoryFilter === "الكل" || pkg.categoryId === categoryFilter;
        return matchesQuery && matchesStatus && matchesCategory;
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [packages, teachers, categories, lessons, query, statusFilter, categoryFilter]);

  function resetForm() {
    setForm({
      title: "",
      description: "",
      categoryId: "",
      teacherId: "",
      priceType: "free",
      isPublished: false,
      academicLevel: DEFAULT_ACADEMIC_LEVEL,
      level: "",
    });
    setEditingId(null);
    setShowForm(false);
  }

  function openCreateForm() {
    setForm({
      title: "",
      description: "",
      categoryId: (categories || [])[0]?.id || defaultDemoData.categories[0].id,
      teacherId: (teachers || [])[0]?.id || defaultDemoData.teachers[0].id,
      priceType: "free",
      isPublished: false,
      academicLevel: DEFAULT_ACADEMIC_LEVEL,
      level: "",
    });
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(pkg) {
    setForm({
      title: pkg.title || "",
      description: pkg.description || "",
      categoryId: pkg.categoryId || (categories || [])[0]?.id || "",
      teacherId: pkg.teacherId || (teachers || [])[0]?.id || "",
      priceType: pkg.priceType || "free",
      isPublished: Boolean(pkg.isPublished),
      academicLevel: pkg.academicLevel || DEFAULT_ACADEMIC_LEVEL,
    });
    setEditingId(pkg.id);
    setShowForm(true);
  }

  function savePackage() {
    const title = form.title.trim();
    if (!title || !form.categoryId || !form.teacherId) return;
    const academicLevel = form.academicLevel || DEFAULT_ACADEMIC_LEVEL;
    const levelTrim = String(form.level ?? "").trim();
    if (editingId) {
      setPackages(
        (packages || []).map((row) => {
          if (row.id !== editingId) return row;
          const next = { ...row, ...form, title, slug: title.replace(/\s+/g, "-"), academicLevel };
          if (levelTrim) next.level = levelTrim;
          else delete next.level;
          return next;
        })
      );
      resetForm();
      return;
    }
    const newPkg = {
      id: `pkg-${Date.now()}`,
      slug: title.replace(/\s+/g, "-"),
      title,
      description: form.description || "وصف مبدئي لدورة أدبية جديدة.",
      categoryId: form.categoryId || (categories || [])[0]?.id || defaultDemoData.categories[0].id,
      teacherId: form.teacherId || (teachers || [])[0]?.id || defaultDemoData.teachers[0].id,
      coverImage: "placeholder-new",
      isPublished: Boolean(form.isPublished),
      isFeatured: false,
      priceType: form.priceType || "free",
      priceMad: form.priceType === "premium" ? 299 : 0,
      lessonsCount: 0,
      order: (packages || []).length + 1,
      academicLevel,
    };
    if (levelTrim) newPkg.level = levelTrim;
    setPackages([...(packages || []), newPkg]);
    resetForm();
  }

  function updatePackage(id, patch) {
    setPackages((packages || []).map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function deletePackage(id) {
    setPackages((packages || []).filter((row) => row.id !== id));
  }

  return (
    <AdminShell title="إدارة الدورات" subtitle="إدارة الدورات التعليمية وربطها بالتصنيفات والأساتذة.">
      <AdminSectionCard title="لوحة الدورات" subtitle="إضافة وتعديل ونشر الدورات التعليمية بصورة عملية.">
        <AdminToolbar>
          <AdminInput type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن دورة..." />
          <AdminSelect value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="الكل">الكل</option>
            {(categories || []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </AdminSelect>
          <AdminSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="الكل">الكل</option>
            <option value="published">published</option>
            <option value="draft">draft</option>
          </AdminSelect>
          {!showForm ? (
            <AdminActionButton onClick={openCreateForm} tone="primary" className="rounded-xl px-4 py-2 text-sm font-bold">
              إضافة دورة
            </AdminActionButton>
          ) : (
            <span className="text-xs font-semibold text-brand-700">{editingId ? "تعديل دورة" : "إضافة دورة جديدة"}</span>
          )}
        </AdminToolbar>
        {showForm ? (
          <form
            className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              savePackage();
            }}
          >
            <AdminInput
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              placeholder="عنوان الدورة"
              required
            />
            <AdminInput
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              placeholder="وصف الدورة"
            />
            <AdminSelect
              value={form.categoryId}
              onChange={(e) => setForm((s) => ({ ...s, categoryId: e.target.value }))}
              required
            >
              {(categories || []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </AdminSelect>
            <AdminSelect
              value={form.teacherId}
              onChange={(e) => setForm((s) => ({ ...s, teacherId: e.target.value }))}
              required
            >
              {(teachers || []).map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </AdminSelect>
            <AdminSelect value={form.priceType} onChange={(e) => setForm((s) => ({ ...s, priceType: e.target.value }))}>
              <option value="free">مجانية</option>
              <option value="premium">مدفوعة</option>
            </AdminSelect>
            <AdminSelect value={form.isPublished ? "published" : "draft"} onChange={(e) => setForm((s) => ({ ...s, isPublished: e.target.value === "published" }))}>
              <option value="draft">مسودة</option>
              <option value="published">منشورة</option>
            </AdminSelect>
            <AdminSelect
              value={form.academicLevel}
              onChange={(e) => setForm((s) => ({ ...s, academicLevel: e.target.value }))}
              aria-label="المستوى الدراسي المستهدف"
            >
              {ACADEMIC_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </AdminSelect>
            <AdminSelect
              value={form.level || ""}
              onChange={(e) => setForm((s) => ({ ...s, level: e.target.value }))}
              aria-label="رمز المستوى (اختياري — تصفية حسب User.level)"
            >
              <option value="">— بدون رمز (عرض لكل الطلاب حسب المستوى العربي)</option>
              {STUDENT_LEVEL_SELECT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </AdminSelect>
            <div className="flex gap-2 md:col-span-2">
              <AdminActionButton type="submit" tone="primary" className="rounded-xl px-4 py-2 text-sm font-bold">
                حفظ
              </AdminActionButton>
              <AdminActionButton type="button" onClick={resetForm} className="rounded-xl px-4 py-2 text-sm font-bold">
                إلغاء
              </AdminActionButton>
            </div>
          </form>
        ) : null}

        {!rows.length ? (
          <AdminEmptyState title="لا توجد دورات مطابقة" description="أضف دورة جديدة أو عدّل الفلاتر." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-right text-slate-500">
                  <th className="px-3 py-2">الدورة</th>
                  <th className="px-3 py-2">التصنيف</th>
                  <th className="px-3 py-2">الأستاذ</th>
                  <th className="px-3 py-2">الدروس</th>
                  <th className="px-3 py-2">المستوى</th>
                  <th className="px-3 py-2">السعر</th>
                  <th className="px-3 py-2">الحالة</th>
                  <th className="px-3 py-2">مميز</th>
                  <th className="px-3 py-2">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((pkg) => (
                  <tr key={pkg.id} className="border-b border-slate-100 text-slate-700">
                    <td className="px-3 py-2 font-semibold">{pkg.title}</td>
                    <td className="px-3 py-2">{pkg.categoryName}</td>
                    <td className="px-3 py-2">{pkg.teacherName}</td>
                    <td className="px-3 py-2">{pkg.computedLessonsCount}</td>
                    <td className="px-3 py-2 text-xs">
                      {pkg.academicLevel || DEFAULT_ACADEMIC_LEVEL}
                      {pkg.level ? <span className="mt-0.5 block font-mono text-[10px] text-slate-500">{pkg.level}</span> : null}
                    </td>
                    <td className="px-3 py-2">
                      {pkg.priceType === "premium" ? "premium" : "free"} · {formatDzd(getPackagePriceMad(pkg))}
                    </td>
                    <td className="px-3 py-2">{pkg.isPublished ? "published" : "draft"}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => updatePackage(pkg.id, { isFeatured: !pkg.isFeatured })}
                        className={`rounded-lg px-2 py-1 text-xs font-bold ${pkg.isFeatured ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-600"}`}
                      >
                        {pkg.isFeatured ? "مفعّل" : "غير مفعّل"}
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <AdminActionButton onClick={() => updatePackage(pkg.id, { isPublished: !pkg.isPublished })}>
                          {pkg.isPublished ? "إلغاء النشر" : "نشر"}
                        </AdminActionButton>
                        <AdminActionButton onClick={() => openEditForm(pkg)}>
                          تعديل
                        </AdminActionButton>
                        <AdminActionButton onClick={() => updatePackage(pkg.id, { categoryId: (categories || []).find((c) => c.id !== pkg.categoryId)?.id || pkg.categoryId })}>
                          تغيير التصنيف
                        </AdminActionButton>
                        <AdminActionButton onClick={() => updatePackage(pkg.id, { teacherId: (teachers || []).find((t) => t.id !== pkg.teacherId)?.id || pkg.teacherId })}>
                          تغيير الأستاذ
                        </AdminActionButton>
                        <AdminActionButton onClick={() => updatePackage(pkg.id, { priceType: pkg.priceType === "free" ? "premium" : "free" })}>
                          تبديل السعر
                        </AdminActionButton>
                        <AdminActionButton onClick={() => deletePackage(pkg.id)} tone="danger">
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
