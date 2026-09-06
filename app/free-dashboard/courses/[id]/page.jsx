"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import FreeLessonsSection from "@/components/student/free-dashboard/FreeLessonsSection";
import FreePdfsSection from "@/components/student/free-dashboard/FreePdfsSection";
import FreeExamsSection from "@/components/student/free-dashboard/FreeExamsSection";

const EMPTY = { course: null, lessons: [], pdfs: [], exams: [] };

function progressKey(courseId) {
  return `free-lms-progress:${courseId}`;
}

export default function FreeCoursePlayerPage() {
  const params = useParams();
  const courseId = String(params?.id || "");
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/free/courses/${encodeURIComponent(courseId)}`, { credentials: "include" })
      .then((r) => r.json())
      .then((body) => {
        if (cancelled) return;
        if (!body?.ok || !body.course) {
          setError(body?.message || "الدورة غير متاحة.");
          setData(EMPTY);
          return;
        }
        setError("");
        setData({
          course: body.course,
          lessons: Array.isArray(body.lessons) ? body.lessons : [],
          pdfs: Array.isArray(body.pdfs) ? body.pdfs : [],
          exams: Array.isArray(body.exams) ? body.exams : [],
        });
        try {
          setDone(localStorage.getItem(progressKey(body.course.id)) === "1");
        } catch {
          setDone(false);
        }
      })
      .catch(() => {
        if (!cancelled) setError("تعذّر تحميل الدورة.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const course = data.course;

  const markProgress = useCallback(() => {
    if (!course?.id) return;
    try {
      localStorage.setItem(progressKey(course.id), "1");
    } catch {
      /* ignore */
    }
    setDone(true);
  }, [course?.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl py-10 text-center text-sm text-slate-600">جاري تحميل الدورة…</div>
    );
  }

  if (error || !course) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 py-10 text-center">
        <p className="text-sm text-red-700">{error || "الدورة غير موجودة."}</p>
        <Link href="/free-dashboard" className="text-sm font-bold text-brand-700 underline">
          العودة للدورات
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8" dir="rtl">
      <Link
        href="/free-dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:underline"
      >
        <ArrowRight className="h-4 w-4" />
        العودة لقائمة الدورات
      </Link>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{course.title}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
          {(course.description || "").trim() || "دورة مجانية ضمن نظام التعلم المجاني."}
        </p>
      </div>

      <FreeLessonsSection lessons={data.lessons} courseSelected />
      <FreePdfsSection pdfs={data.pdfs} />
      <FreeExamsSection exams={data.exams} />

      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
        <button
          type="button"
          onClick={markProgress}
          className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold transition sm:w-auto ${
            done
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "touch-button-primary"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {done ? "تم تسجيل التقدم" : "تسجيل التقدم"}
        </button>
      </div>
    </div>
  );
}
