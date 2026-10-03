"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, LogOut } from "lucide-react";
import BrandLogoMark from "@/components/brand/BrandLogoMark";
import { BRAND_NAME } from "@/lib/brand";

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

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [teacher, setTeacher] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      if (!coursesRes.ok || !coursesData?.ok) {
        setCourses([]);
        setError(coursesData?.message || "تعذّر تحميل الدورات.");
        return;
      }
      setCourses(Array.isArray(coursesData.courses) ? coursesData.courses : []);
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    try {
      await fetch("/api/teacher/logout", { method: "POST", credentials: "include" });
    } catch {
      /* ignore */
    }
    router.replace("/teacher/login");
  }

  return (
    <section className="premium-app-bg w-full" dir="rtl">
      <div className="container-landing space-y-6 py-6 lg:py-8">
        <header className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <BrandLogoMark variant="footer" showWordmark className="mb-3" />
              <p className="text-xs font-semibold text-brand-700">{BRAND_NAME} — بوابة الأستاذ</p>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-900">لوحة الأستاذ</h1>
              {teacher ? (
                <p className="mt-2 text-sm text-slate-600">
                  <span className="font-bold text-slate-900">{teacher.fullName}</span>
                  <span className="mx-2 text-slate-300">·</span>
                  <span dir="ltr">{teacher.email}</span>
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-500">جاري تحميل الحساب...</p>
              )}
            </div>
            <button
              type="button"
              onClick={logout}
              className="touch-button-secondary inline-flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </button>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">دوراتي</h2>
              <p className="text-sm text-slate-500">الدورات المعيّنة لحسابك في النظام المدفوع فقط.</p>
            </div>
          </div>

          {error ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-500">جاري تحميل الدورات...</p>
          ) : null}

          {!loading && !courses.length && !error ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              لا توجد دورات معيّنة لحسابك حاليًا.
            </p>
          ) : null}

          {!loading && courses.length ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {courses.map((course) => (
                <li
                  key={course.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm"
                >
                  <h3 className="text-base font-extrabold text-slate-900">{course.title}</h3>
                  <p className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-white px-2 py-0.5 text-slate-700 ring-1 ring-slate-200">
                      {statusLabel(course.status)}
                    </span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-slate-700 ring-1 ring-slate-200">
                      {accessLabel(course.accessType)}
                    </span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-slate-700 ring-1 ring-slate-200">
                      {course.academicLevel || course.level || "—"}
                    </span>
                  </p>
                  <p className="mt-3 text-sm text-slate-600">عدد الدروس: {course.lessonsCount ?? 0}</p>
                  <Link
                    href={`/teacher/dashboard/courses/${encodeURIComponent(course.id)}`}
                    className="mt-4 inline-flex rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-4 py-2 text-sm font-bold text-white no-underline hover:brightness-105"
                  >
                    إدارة الدورة
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </section>
  );
}
