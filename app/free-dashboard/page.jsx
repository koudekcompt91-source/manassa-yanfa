"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import FreeCourseCard from "@/components/student/FreeCourseCard";
import FreeCoursesSection from "@/components/student/free-dashboard/FreeCoursesSection";
import FreeLessonsSection from "@/components/student/free-dashboard/FreeLessonsSection";
import FreePdfsSection from "@/components/student/free-dashboard/FreePdfsSection";
import FreeExamsSection from "@/components/student/free-dashboard/FreeExamsSection";

const EMPTY = { courses: [], lessons: [], pdfs: [], exams: [], assignments: [] };

/** Exact hub order from reference — do not reorder. */
const FREE_CATALOG = [
  {
    id: "lessons",
    title: "دروسي",
    description: "تابع دروسك المجانية المسجّلة وابدأ التعلم حسب مستواك الدراسي.",
    icon: "book",
    tone: "blue",
    showFree: true,
    showPdf: false,
  },
  {
    id: "summaries",
    title: "ملخصاتي",
    description: "ملخصات PDF مختصرة تساعدك على المراجعة السريعة للمواضيع الأساسية.",
    icon: "document",
    tone: "green",
    showFree: true,
    showPdf: true,
  },
  {
    id: "assignments",
    title: "فروضي",
    description: "الواجبات والتمارين التطبيقية لمتابعة مستواك خطوة بخطوة.",
    icon: "chart",
    tone: "orange",
    showFree: true,
    showPdf: false,
  },
  {
    id: "quizzes",
    title: "اختباراتي",
    description: "اختبارات وتمارين تقييمية لقياس فهمك وتقدمك الدراسي.",
    icon: "exam",
    tone: "purple",
    showFree: true,
    showPdf: false,
  },
  {
    id: "courses",
    title: "الدورات",
    description: "تصفّح الدورات المجانية المتاحة لمستواك وادخل إلى محتوى الدورة مباشرة.",
    icon: "star",
    tone: "sky",
    showFree: true,
    showPdf: false,
  },
];

const SECTION_IDS = new Set(FREE_CATALOG.map((s) => s.id));

function isFreeSystem(value) {
  return String(value || "").toUpperCase() === "FREE";
}

/**
 * FREE student hub — reference catalog cards, then one content section at a time.
 * Does not render paid dashboard UI.
 */
function FreeDashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionParam = searchParams?.get("section") || "";
  const activeSection = SECTION_IDS.has(sectionParam) ? sectionParam : "";

  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [levelLabel, setLevelLabel] = useState("");
  const fetchedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((body) => {
        if (cancelled) return;
        const level = body?.user?.academicLevel || body?.user?.level || "";
        setLevelLabel(level && level !== "unknown" ? String(level) : "");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetch("/api/free/courses", { credentials: "include" })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        return { okHttp: r.ok, body };
      })
      .then(({ okHttp, body }) => {
        if (!okHttp || body?.ok === false) {
          setError(body?.message || "تعذّر تحميل المحتوى.");
          setData(EMPTY);
          return;
        }

        const rawCourses = Array.isArray(body?.courses)
          ? body.courses
          : Array.isArray(body?.data)
            ? body.data
            : [];

        // FREE isolation: only system=FREE rows (never PAID LMS).
        const courses = rawCourses.filter((c) => isFreeSystem(c?.system));
        const freeIds = new Set(courses.map((c) => c?.id).filter(Boolean));

        const lessons = (Array.isArray(body?.lessons) ? body.lessons : []).filter(
          (l) => l?.courseId && freeIds.has(l.courseId)
        );
        const pdfs = (Array.isArray(body?.pdfs) ? body.pdfs : []).filter(
          (p) => p?.courseId && freeIds.has(p.courseId)
        );
        const exams = (Array.isArray(body?.exams) ? body.exams : []).filter(
          (e) => !e?.courseId || freeIds.has(e.courseId)
        );
        const assignments = (Array.isArray(body?.assignments) ? body.assignments : []).filter(
          (a) => !a?.courseId || freeIds.has(a.courseId)
        );

        setError("");
        setData({ courses, lessons, pdfs, exams, assignments });
      })
      .catch(() => {
        setError("تعذّر الاتصال بالخادم.");
        setData(EMPTY);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeMeta = useMemo(
    () => FREE_CATALOG.find((s) => s.id === activeSection) || null,
    [activeSection]
  );

  function openCourse(id) {
    if (!id) return;
    router.push(`/free-dashboard/courses/${encodeURIComponent(id)}`);
  }

  if (activeSection && activeMeta) {
    return (
      <div className="w-full bg-[#f7f9fc]" dir="rtl">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 sm:gap-8">
          <Link
            href="/free-dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:underline"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للأقسام
          </Link>

          <header className="rounded-2xl border border-slate-200/80 bg-white px-6 py-6 text-center shadow-[0_10px_28px_-20px_rgba(15,23,42,0.18)] sm:px-8">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              {activeMeta.title}
            </h1>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-slate-500">
              {activeMeta.description}
            </p>
          </header>

          {error ? (
            <p
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm font-semibold text-red-700"
            >
              {error}
            </p>
          ) : null}

          {activeSection === "lessons" ? (
            <FreeLessonsSection lessons={data.lessons ?? []} loading={loading} />
          ) : null}

          {activeSection === "summaries" ? (
            <FreePdfsSection pdfs={data.pdfs ?? []} loading={loading} />
          ) : null}

          {activeSection === "assignments" ? (
            <FreeExamsSection
              exams={data.assignments ?? []}
              loading={loading}
              title="فروضي"
              emptyTitle="لا توجد فروض حالياً"
              emptySubtitle="ستظهر الفروض المجانية هنا عند إضافتها."
            />
          ) : null}

          {activeSection === "quizzes" ? (
            <FreeExamsSection
              exams={data.exams ?? []}
              loading={loading}
              title="اختباراتي"
              emptyTitle="لا توجد اختبارات حالياً"
              emptySubtitle="ستظهر الاختبارات المجانية هنا عند إضافتها."
            />
          ) : null}

          {activeSection === "courses" ? (
            <FreeCoursesSection
              courses={data.courses ?? []}
              loading={loading}
              error={error}
              onSelect={openCourse}
            />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f7f9fc]" dir="rtl">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 rounded-2xl border border-slate-200/80 bg-white px-6 py-7 text-center shadow-[0_10px_28px_-20px_rgba(15,23,42,0.18)] sm:mb-8 sm:px-10 sm:py-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            مرحباً بك في الحساب المجاني
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500 sm:text-base">
            ابدأ من الأقسام المتاحة أدناه وتابع محتواك التعليمي المجاني بسهولة.
          </p>
        </header>

        <section aria-label="كتالوج الأقسام" className="flex w-full flex-col gap-5 sm:gap-6">
          {FREE_CATALOG.map((item) => (
            <div key={item.id} id={item.id} className="w-full">
              <FreeCourseCard
                title={item.title}
                description={item.description}
                icon={item.icon}
                tone={item.tone}
                href={`/free-dashboard?section=${item.id}`}
                showFree={item.showFree}
                showPdf={item.showPdf}
                levelLabel={levelLabel}
              />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default function FreeDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-slate-500" dir="rtl">
          جاري التحميل…
        </div>
      }
    >
      <FreeDashboardInner />
    </Suspense>
  );
}
