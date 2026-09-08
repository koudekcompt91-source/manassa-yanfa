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
  zoomUrl: "",
  startsAt: "",
  durationMin: 60,
  status: "SCHEDULED",
  isPublished: false,
};

function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * PAID "بثوث مباشرة" admin — LiveSession under Course.system=PAID.
 */
export default function AdminPaidLivePage() {
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
          const lr = await fetch(`/api/admin/courses/${course.id}/live-sessions`, { credentials: "include" });
          const ld = await lr.json().catch(() => ({}));
          return [course.id, lr.ok && ld?.ok && Array.isArray(ld.liveSessions) ? ld.liveSessions : []];
        })
      );
      setByCourse(Object.fromEntries(pairs));
      setError("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => {
    const out = [];
    for (const course of courses) {
      for (const session of byCourse[course.id] || []) {
        out.push({ ...session, courseTitle: course.title, courseId: course.id });
      }
    }
    return out.sort((a, b) => String(a.startsAt || "").localeCompare(String(b.startsAt || "")));
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
      zoomUrl: row.zoomUrl || "",
      startsAt: toLocalInputValue(row.startsAt),
      durationMin: row.durationMin || 60,
      status: row.status || "SCHEDULED",
      isPublished: row.isPublished === true,
    });
    setError("");
    setBanner(null);
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
        zoomUrl: String(form.zoomUrl || "").trim(),
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : "",
        durationMin: Math.max(1, Number(form.durationMin) || 60),
        status: form.status || "SCHEDULED",
        isPublished: Boolean(form.isPublished),
      };
      const isEdit = Boolean(editingId);
      const url = isEdit
        ? `/api/admin/live-sessions/${editingId}`
        : `/api/admin/courses/${courseId}/live-sessions`;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.message || "تعذّر حفظ الحصة.");
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
    if (!window.confirm("حذف هذه الحصة المباشرة؟")) return;
    const res = await fetch(`/api/admin/live-sessions/${id}`, { method: "DELETE", credentials: "include" });
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
    const res = await fetch(`/api/admin/live-sessions/${row.id}`, {
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
      title="بثوث مباشرة — المحتوى المدفوع"
      subtitle="إدارة LiveSession المرتبطة بدورات Course.system = PAID."
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
        <p className={`rounded-xl px-4 py-3 text-sm font-semibold ${banner.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
          {banner.text}
        </p>
      ) : null}

      <AdminSectionCard title="إضافة / تعديل بث مباشر" subtitle="العنوان · Zoom · الموعد · المدة · النشر.">
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
          <AdminFormField label="عنوان الحصة">
            <AdminInput value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} required />
          </AdminFormField>
          <AdminFormField label="رابط Zoom" className="md:col-span-2">
            <AdminInput value={form.zoomUrl} onChange={(e) => setForm((s) => ({ ...s, zoomUrl: e.target.value }))} required />
          </AdminFormField>
          <AdminFormField label="الوصف" className="md:col-span-2">
            <AdminInput value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
          </AdminFormField>
          <AdminFormField label="موعد البدء">
            <AdminInput type="datetime-local" value={form.startsAt} onChange={(e) => setForm((s) => ({ ...s, startsAt: e.target.value }))} required />
          </AdminFormField>
          <AdminFormField label="المدة (دقيقة)">
            <AdminInput type="number" min="1" value={form.durationMin} onChange={(e) => setForm((s) => ({ ...s, durationMin: Number(e.target.value) || 60 }))} />
          </AdminFormField>
          <AdminFormField label="الحالة">
            <AdminSelect className="w-full" value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}>
              <option value="SCHEDULED">مجدولة</option>
              <option value="LIVE">مباشرة الآن</option>
              <option value="ENDED">منتهية</option>
              <option value="CANCELLED">ملغاة</option>
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
              {saving ? "جاري الحفظ…" : editingId ? "حفظ التعديل" : "إضافة بث"}
            </AdminActionButton>
            {editingId ? <AdminActionButton type="button" onClick={resetForm}>إلغاء</AdminActionButton> : null}
          </div>
        </form>
      </AdminSectionCard>

      <AdminSectionCard title="البثوث المباشرة" subtitle={`${rows.length} حصة`}>
        {loading ? (
          <p className="text-sm text-slate-500">جاري التحميل…</p>
        ) : !rows.length ? (
          <AdminEmptyState title="لا توجد حصص بعد" description="أضف أول بث مباشر من النموذج أعلاه." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-right text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="px-3 py-2 font-bold">العنوان</th>
                  <th className="px-3 py-2 font-bold">الدورة</th>
                  <th className="px-3 py-2 font-bold">الموعد</th>
                  <th className="px-3 py-2 font-bold">الحالة</th>
                  <th className="px-3 py-2 font-bold">النشر</th>
                  <th className="px-3 py-2 font-bold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="px-3 py-3 font-extrabold text-slate-900">{row.title}</td>
                    <td className="px-3 py-3">{row.courseTitle}</td>
                    <td className="px-3 py-3">{row.startsAt ? new Date(row.startsAt).toLocaleString("ar-DZ") : "—"}</td>
                    <td className="px-3 py-3">{row.status}</td>
                    <td className="px-3 py-3">
                      <AdminBadge tone={row.isPublished ? "success" : "warning"}>{row.isPublished ? "منشور" : "مخفي"}</AdminBadge>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <AdminActionButton type="button" onClick={() => openEdit(row)}>تعديل</AdminActionButton>
                        <AdminActionButton type="button" tone="primary" onClick={() => togglePublish(row)}>
                          {row.isPublished ? "إخفاء" : "نشر"}
                        </AdminActionButton>
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
