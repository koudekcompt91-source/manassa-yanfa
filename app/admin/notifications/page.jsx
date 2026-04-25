"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminActionButton, AdminFormField, AdminInput, AdminSectionCard, AdminSelect } from "@/components/admin/AdminUI";

const EMPTY_FORM = {
  title: "",
  message: "",
  type: "GENERAL",
  link: "",
  audience: "ALL",
  courseId: "",
};

export default function AdminNotificationsPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [flash, setFlash] = useState({ type: "", text: "" });
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/courses", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) return;
      setCourses(Array.isArray(data.courses) ? data.courses : []);
    })();
  }, []);

  const publishedCourses = useMemo(() => (courses || []).filter((row) => row.status === "PUBLISHED"), [courses]);

  const sendNotification = async (e) => {
    e.preventDefault();
    setSending(true);
    setFlash({ type: "", text: "" });
    try {
      const payload = {
        title: form.title,
        message: form.message,
        type: form.type,
        link: form.link || null,
        courseId: form.audience === "COURSE" ? form.courseId : null,
      };
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setFlash({ type: "error", text: data?.message || "تعذّر إرسال الإشعارات." });
        return;
      }
      setFlash({ type: "success", text: `تم الإرسال بنجاح إلى ${data.sentCount || 0} طالب.` });
      setForm(EMPTY_FORM);
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminShell title="إرسال الإشعارات" subtitle="إرسال إشعار جماعي لكل الطلاب أو لمشتركي دورة محددة.">
      <AdminSectionCard title="مرسل الإشعارات" subtitle="استخدم هذه الأداة للتنبيهات العامة أو تنبيهات الدورات.">
        <form onSubmit={sendNotification} className="grid gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 md:grid-cols-2">
          <AdminFormField label="عنوان الإشعار">
            <AdminInput value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} required />
          </AdminFormField>
          <AdminFormField label="نوع الإشعار">
            <AdminSelect value={form.type} onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}>
              <option value="GENERAL">عام</option>
              <option value="LIVE_SESSION">حصة مباشرة</option>
              <option value="NEW_LESSON">درس جديد</option>
              <option value="COURSE_ANNOUNCEMENT">إعلان دورة</option>
              <option value="PAYMENT">الدفع</option>
            </AdminSelect>
          </AdminFormField>
          <AdminFormField label="نص الإشعار" className="md:col-span-2">
            <AdminInput value={form.message} onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))} required />
          </AdminFormField>
          <AdminFormField label="رابط (اختياري)">
            <AdminInput value={form.link} onChange={(e) => setForm((s) => ({ ...s, link: e.target.value }))} placeholder="/packages/slug أو https://..." />
          </AdminFormField>
          <AdminFormField label="الفئة المستهدفة">
            <AdminSelect value={form.audience} onChange={(e) => setForm((s) => ({ ...s, audience: e.target.value }))}>
              <option value="ALL">كل الطلاب</option>
              <option value="COURSE">طلاب دورة محددة</option>
            </AdminSelect>
          </AdminFormField>
          {form.audience === "COURSE" ? (
            <AdminFormField label="الدورة">
              <AdminSelect value={form.courseId} onChange={(e) => setForm((s) => ({ ...s, courseId: e.target.value }))} required>
                <option value="">اختر دورة</option>
                {publishedCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </AdminSelect>
            </AdminFormField>
          ) : null}
          {flash.text ? (
            <p className={`rounded-xl border px-3 py-2 text-sm md:col-span-2 ${flash.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
              {flash.text}
            </p>
          ) : null}
          <div className="md:col-span-2">
            <AdminActionButton type="submit" tone="primary" disabled={sending}>
              {sending ? "جاري الإرسال..." : "إرسال الإشعار"}
            </AdminActionButton>
          </div>
        </form>
      </AdminSectionCard>
    </AdminShell>
  );
}
