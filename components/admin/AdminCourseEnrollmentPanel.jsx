"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AdminActionButton,
  AdminBadge,
  AdminEmptyState,
  AdminFormField,
  AdminInput,
  AdminSectionCard,
  AdminSelect,
} from "@/components/admin/AdminUI";

function statusLabel(status) {
  if (status === "PUBLISHED") return "منشورة";
  if (status === "DRAFT") return "مسودة";
  return status || "—";
}

export default function AdminCourseEnrollmentPanel() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [email, setEmail] = useState("");
  const [students, setStudents] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const teacherName = useCallback(
    (id) => teachers.find((row) => row.id === id)?.fullName || "",
    [teachers]
  );

  const sortedCourses = useMemo(() => {
    return [...courses].sort((a, b) => {
      const pub = Number(b.status === "PUBLISHED") - Number(a.status === "PUBLISHED");
      if (pub) return pub;
      return String(a.title || "").localeCompare(String(b.title || ""), "ar");
    });
  }, [courses]);

  const loadStudents = useCallback(async (id) => {
    if (!id) {
      setStudents([]);
      return;
    }
    setLoadingStudents(true);
    try {
      const res = await fetch(`/api/admin/course-enrollments?courseId=${encodeURIComponent(id)}`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setStudents([]);
        setError(data?.message || "تعذّر تحميل الطلاب المفعّلين.");
        return;
      }
      setStudents(Array.isArray(data.students) ? data.students : []);
    } catch {
      setStudents([]);
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [coursesRes, teachersRes] = await Promise.all([
          fetch("/api/admin/courses", { credentials: "include", cache: "no-store" }),
          fetch("/api/admin/teachers", { credentials: "include", cache: "no-store" }),
        ]);
        const coursesData = await coursesRes.json().catch(() => ({}));
        const teachersData = await teachersRes.json().catch(() => ({}));
        if (cancelled) return;
        setCourses(Array.isArray(coursesData.courses) ? coursesData.courses : []);
        setTeachers(Array.isArray(teachersData.teachers) ? teachersData.teachers : []);
      } catch {
        if (!cancelled) setError("تعذّر تحميل الدورات.");
      } finally {
        if (!cancelled) setLoadingCourses(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setResult(null);
    setError("");
    loadStudents(courseId);
  }, [courseId, loadStudents]);

  async function onActivate(e) {
    e.preventDefault();
    if (submitting || !courseId) return;
    setSubmitting(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/admin/course-enrollments", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.message || "تعذّر تفعيل الدورة.");
        return;
      }
      setResult(data);
      if (!data.alreadyEnrolled) setEmail("");
      await loadStudents(courseId);
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeStudent(studentId) {
    if (!courseId || removingId) return;
    setRemovingId(studentId);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/course-enrollments/${encodeURIComponent(courseId)}/${encodeURIComponent(studentId)}`,
        { method: "DELETE", credentials: "include" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.message || "تعذّر إلغاء التفعيل.");
        return;
      }
      setResult({ message: data.message, removed: true });
      await loadStudents(courseId);
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setRemovingId("");
    }
  }

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="تفعيل طالب في دورة"
        subtitle="فعّل الوصول إلى دورة محددة لطالب باستخدام البريد الإلكتروني."
      >
        <form onSubmit={onActivate} className="grid gap-4 md:grid-cols-2">
          <AdminFormField label="اختر الدورة" className="md:col-span-2">
            <AdminSelect
              className="w-full"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
              disabled={loadingCourses}
            >
              <option value="">{loadingCourses ? "جاري تحميل الدورات..." : "اختر دورة"}</option>
              {sortedCourses.map((course) => {
                const teacher = teacherName(course.teacherId);
                const level = course.academicLevel || course.level || "";
                const bits = [course.title, teacher ? `الأستاذ: ${teacher}` : "", level, statusLabel(course.status)].filter(Boolean);
                return (
                  <option key={course.id} value={course.id}>
                    {bits.join(" — ")}
                  </option>
                );
              })}
            </AdminSelect>
          </AdminFormField>
          <AdminFormField label="البريد الإلكتروني للطالب">
            <AdminInput
              type="email"
              dir="ltr"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              autoComplete="off"
            />
          </AdminFormField>
          <div className="flex items-end">
            <AdminActionButton type="submit" tone="primary" disabled={submitting || !courseId}>
              {submitting ? "جاري التفعيل..." : "تفعيل الدورة للطالب"}
            </AdminActionButton>
          </div>
        </form>

        {error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

        {result?.student && result?.course ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <p className="font-bold">
              {result.alreadyEnrolled
                ? result.message
                : `تم تفعيل دورة «${result.course.title}» للطالب «${result.student.fullName}» بنجاح.`}
            </p>
            <ul className="mt-2 space-y-1">
              <li>الطالب: {result.student.fullName}</li>
              <li>
                البريد: <span dir="ltr">{result.student.email}</span>
              </li>
              <li>الدورة: {result.course.title}</li>
              <li>
                الحالة: <AdminBadge tone="success">مفعّل</AdminBadge>
              </li>
            </ul>
          </div>
        ) : result?.message ? (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{result.message}</p>
        ) : null}
      </AdminSectionCard>

      <AdminSectionCard title="الطلاب المفعّلون" subtitle="طلاب الدورة المحددة فقط.">
        {!courseId ? (
          <AdminEmptyState title="اختر دورة" description="اختر دورة من الأعلى لعرض الطلاب المفعّلين." />
        ) : loadingStudents ? (
          <p className="text-sm text-slate-500">جاري تحميل الطلاب...</p>
        ) : !students.length ? (
          <AdminEmptyState title="لا يوجد طلاب مفعّلون" description="فعّل طالبًا بالبريد الإلكتروني ليظهر هنا." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-right text-xs font-semibold text-slate-500">
                  <th className="px-3 py-2">الاسم</th>
                  <th className="px-3 py-2">البريد</th>
                  <th className="px-3 py-2">المستوى الدراسي</th>
                  <th className="px-3 py-2">السنة</th>
                  <th className="px-3 py-2">تاريخ التفعيل</th>
                  <th className="px-3 py-2">المصدر</th>
                  <th className="px-3 py-2">الحالة</th>
                  <th className="px-3 py-2">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-t border-slate-100 text-slate-700">
                    <td className="px-3 py-2 font-semibold text-slate-900">{student.fullName}</td>
                    <td className="px-3 py-2" dir="ltr">{student.email}</td>
                    <td className="px-3 py-2">{student.academicLevel || "—"}</td>
                    <td className="px-3 py-2">{student.level || "—"}</td>
                    <td className="px-3 py-2 text-xs">
                      {student.enrolledAt ? new Date(student.enrolledAt).toLocaleString("ar-DZ") : "—"}
                    </td>
                    <td className="px-3 py-2">{student.source || "—"}</td>
                    <td className="px-3 py-2">
                      <AdminBadge tone="success">مفعّل</AdminBadge>
                    </td>
                    <td className="px-3 py-2">
                      <AdminActionButton
                        type="button"
                        tone="danger"
                        disabled={removingId === student.id}
                        onClick={() => removeStudent(student.id)}
                      >
                        {removingId === student.id ? "جاري الإلغاء..." : "إلغاء التفعيل"}
                      </AdminActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminSectionCard>
    </div>
  );
}
