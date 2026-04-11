 "use client";

import { useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminActionButton, AdminEmptyState, AdminInput, AdminSectionCard } from "@/components/admin/AdminUI";
import { useDemoSection } from "@/lib/demo-store";

const allowedCategoryOrder = ["النحو", "البلاغة", "الشعر", "النقد", "الأدب القديم", "الأدب الحديث", "تحليل النصوص", "العروض"];

export default function AdminCategoriesPage() {
  const [categoryData, setCategoryData] = useDemoSection("categories");
  const [query, setQuery] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const rows = useMemo(() => {
    const merged = (categoryData || allowedCategoryOrder.map((title, index) => ({
      id: `managed-${index}`,
      name: title,
      slug: title.replace(/\s+/g, "-"),
      description: "",
      active: true,
      order: index + 1,
    }))).map((row, index) => ({ ...row, order: index + 1 }));
    return merged.filter((row) => (row.name || "").includes(query.trim()));
  }, [categoryData, query]);

  function addCategory() {
    const title = newCategory.trim();
    if (!title) return;
    setCategoryData([...(categoryData || []), { id: `cat-${Date.now()}`, name: title, slug: title.replace(/\s+/g, "-"), description: "", active: true }]);
    setNewCategory("");
  }

  return (
    <AdminShell title="إدارة التصنيفات" subtitle="ضبط التصنيفات الأكاديمية المعتمدة لمسارات الأدب العربي.">
      <AdminSectionCard title="التصنيفات الأدبية" subtitle="إضافة وتعديل وحذف التصنيفات المستخدمة في الدورات.">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex w-full gap-2 sm:max-w-md">
            <AdminInput
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن تصنيف..."
            />
            <AdminInput
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="تصنيف جديد"
            />
          </div>
          <AdminActionButton onClick={addCategory} tone="primary" className="rounded-xl px-4 py-2 text-sm font-bold">إضافة</AdminActionButton>
        </div>
        {!rows.length ? (
          <AdminEmptyState title="لا توجد تصنيفات مطابقة" description="أضف تصنيفًا جديدًا أو عدّل البحث." />
        ) : (
          <div className="space-y-2">
            {rows.map((category) => (
              <div key={category.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <div className="font-semibold text-slate-700">
                  #{category.order} - {category.name}
                </div>
                <div className="flex gap-2">
                  <AdminActionButton onClick={() => setCategoryData((categoryData || []).map((row) => (row.id === category.id ? { ...row, name: `${row.name} (محدث)` } : row)))}>تعديل</AdminActionButton>
                  <AdminActionButton onClick={() => setCategoryData((categoryData || []).filter((row) => row.id !== category.id))} tone="danger">حذف</AdminActionButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminSectionCard>
    </AdminShell>
  );
}
