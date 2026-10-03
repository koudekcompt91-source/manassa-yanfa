"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

function statusLabel(status) {
  if (status === "PUBLISHED") return "منشورة";
  if (status === "DRAFT") return "مسودة";
  return status || "—";
}

function accessLabel(type) {
  if (type === "PAID") return "مدفوعة";
  if (type === "FREE") return "مجانية";
  return type || "—";
}

export default function TeacherCourseManagePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = decodeURIComponent(String(params?.courseId || ""));
  const [teacher, setTeacher] = useState(null);
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState("");
  const [error, setError] = useState("");
  const [banner, setBanner] = useState("");

  const loadStudents = useCallback(async () => {
    const res = await fetch(`/api/teacher/courses/${encodeURIComponent(courseId)}/students`, {
      credentials: "include",
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setStudents([]);
      setError(data?.message || "تعذّر تحميل الطلاب.");
      return false;
    }
    setStudents(Array.isArray(data.students) ? data.students : []);
    return true;
  }, [courseId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [meRes, coursesRes] = await Promise.all([
        fetch("/api/teacher/me", { credentials: "include", cache: "no-store" }),
        fetch("/api/teacher/courses", { credentials: "include", cache: "no-store" }),
      ]);
      const meData = await meRes.json().catch(() => ({}));
      const coursesData = await coursesRes.json().catch(() => ({}));
      if (!meRes.ok || !meData?.ok) {
        router.replace("/teacher/login");
        return;
      }
      setTeacher(meData.user);
      const found = (coursesData.courses || []).find((row) => row.id === courseId) || null;
      if (!coursesRes.ok || !coursesData?.ok || !found) {
        setCourse(null);
        setError("لا يمكنك إدارة هذه الدورة.");
        return;
      }
      setCourse(found);
      await loadStudents();
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  }, [courseId, loadStudents, router]);

  useEffect(() => {
    if (courseId) load();
  }, [courseId, load]);

  async function activateStudent(e) {
    e.preventDefault();
    if (submitting || !course) return;
    setSubmitting(true);
    setError("");
    setBanner("");
    try {
      const res = await fetch(`/api/teacher/courses/${encodeURIComponent(course.id)}/students`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.message || "تعذّر تفعيل الدورة.");
        return;
      }
      setBanner(data.message || "تم تفعيل الدورة للطالب بنجاح.");
      if (!data.alreadyEnrolled) setEmail("");
      await loadStudents();
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeStudent(studentId) {
    if (!course || removingId) return;
    setRemovingId(studentId);
    setError("");
    setBanner("");
    try {
      const res = await fetch(
        `/api/teacher/courses/${encodeURIComponent(course.id)}/students/${encodeURIComponent(studentId)}`,
        { method: "DELETE", credentials: "include" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.message || "تعذّر إلغاء التفعيل.");
        return;
      }
      setBanner(data.message || "تم إلغاء تفعيل الدورة لهذا الطالب.");
      await loadStudents();
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setRemovingId("");
    }
  }

  return (
    <section className="premium-app-bg w-full" dir="rtl">
      <div className="container-landing space-y-6 py-6 lg:py-8">
        <Link href="/teacher/dashboard" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 no-underline hover:underline">
          <ArrowRight className="h-4 w-4" />
          العودة إلى دوراتي
        </Link>

        {loading ? <p className="text-sm text-slate-500">جاري التحميل...</p> : null}
        {error && !course ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
        ) : null}

        {course ? (
          <>
            <header className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h1 className="text-2xl font-extrabold text-slate-900">{course.title}</h1>
              <p className="mt-2 text-sm text-slate-600">
                الأستاذ: <span className="font-bold text-slate-900">{teacher?.fullName || "—"}</span>
              </p>
              <p className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-slate-50 px-2 py-0.5 text-slate-700 ring-1 ring-slate-200">{statusLabel(course.status)}</span>
                <span className="rounded-full bg-slate-50 px-2 py-0.5 text-slate-700 ring-1 ring-slate-200">{accessLabel(course.accessType)}</span>
                <span className="rounded-full bg-slate-50 px-2 py-0.5 text-slate-700 ring-1 ring-slate-200">{course.academicLevel || course.level || "—"}</span>
                <span className="rounded-full bg-slate-50 px-2 py-0.5 text-slate-700 ring-1 ring-slate-200">عدد الدروس: {course.lessonsCount ?? 0}</span>
              </p>
            </header>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900">إضافة طالب إلى الدورة</h2>
              <p className="mt-1 text-sm text-slate-500">أدخل بريد الطالب المسجّل. التفعيل يمنح الوصول إلى هذه الدورة فقط دون خصم من المحفظة.</p>
              <form onSubmit={activateStudent} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@gmail.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="shrink-0 rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {submitting ? "جاري التفعيل..." : "تفعيل الدورة للطالب"}
                </button>
              </form>
              {banner ? <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{banner}</p> : null}
              {error ? <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900">الطلاب المفعّلون</h2>
              {!students.length ? (
                <p className="mt-4 text-sm text-slate-500">لا يوجد طلاب مفعّلون في هذه الدورة بعد.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-right text-xs font-semibold text-slate-500">
                        <th className="px-3 py-2">اسم الطالب</th>
                        <th className="px-3 py-2">البريد الإلكتروني</th>
                        <th className="px-3 py-2">المستوى</th>
                        <th className="px-3 py-2">تاريخ التفعيل</th>
                        <th className="px-3 py-2">الحالة</th>
                        <th className="px-3 py-2">إجراء</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-b border-slate-100 text-slate-700">
                          <td className="px-3 py-3 font-semibold text-slate-900">{student.fullName}</td>
                          <td className="px-3 py-3" dir="ltr">{student.email}</td>
                          <td className="px-3 py-3">{student.academicLevel || student.level || "—"}</td>
                          <td className="px-3 py-3 text-xs">
                            {student.enrolledAt ? new Date(student.enrolledAt).toLocaleString("ar-DZ") : "—"}
                          </td>
                          <td className="px-3 py-3">
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">مفعّل</span>
                          </td>
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              disabled={removingId === student.id}
                              onClick={() => removeStudent(student.id)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                            >
                              {removingId === student.id ? "جاري الإلغاء..." : "إلغاء التفعيل"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </section>
  );
}
