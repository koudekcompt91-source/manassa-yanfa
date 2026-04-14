"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import { addPointsForLessonComplete, getCompletedSet, getPackageProgressStats, markLessonComplete } from "@/lib/student-progress";

export default function PackageLessonPage() {
  const params = useParams();
  const slug = decodeURIComponent(String(params?.slug || ""));
  const lessonId = decodeURIComponent(String(params?.lessonId || ""));
  const router = useRouter();
  const [pageState, setPageState] = useState({
    loading: true,
    course: null,
    lessons: [],
    enrolled: false,
    canAccessPaid: false,
  });
  const [storageTick, setStorageTick] = useState(0);
  const [lockOpen, setLockOpen] = useState(false);

  const loadPage = useCallback(async () => {
    setPageState((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch(`/api/courses/${encodeURIComponent(slug)}`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setPageState({ loading: false, course: null, lessons: [], enrolled: false, canAccessPaid: false });
        return;
      }
      setPageState({
        loading: false,
        course: data.course,
        lessons: Array.isArray(data.lessons) ? data.lessons : [],
        enrolled: Boolean(data.enrolled),
        canAccessPaid: Boolean(data.canAccessPaid),
      });
    } catch {
      setPageState({ loading: false, course: null, lessons: [], enrolled: false, canAccessPaid: false });
    }
  }, [slug]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  useEffect(() => {
    const onStore = () => setStorageTick((t) => t + 1);
    window.addEventListener("yanfa-student-storage", onStore);
    return () => window.removeEventListener("yanfa-student-storage", onStore);
  }, []);

  const pkg = pageState.course;
  const packageLessons = pageState.lessons || [];
  const current = useMemo(
    () => packageLessons.find((lesson) => String(lesson.id) === lessonId) || null,
    [packageLessons, lessonId]
  );
  const lockedPremium = Boolean(current?.locked);
  const lessonIdsOrdered = useMemo(() => packageLessons.map((l) => l.id), [packageLessons]);
  const progressStats = useMemo(
    () => getPackageProgressStats(pkg?.id, lessonIdsOrdered),
    [pkg?.id, lessonIdsOrdered, storageTick]
  );

  const currentIndex = useMemo(() => packageLessons.findIndex((row) => row.id === current?.id), [packageLessons, current]);
  const previousLesson = currentIndex > 0 ? packageLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < packageLessons.length - 1 ? packageLessons[currentIndex + 1] : null;

  const completedHere = pkg?.id && current?.id ? getCompletedSet(pkg.id).has(current.id) : false;

  const handleMarkComplete = () => {
    if (!pkg?.id || !current?.id) return;
    if (lockedPremium) {
      setLockOpen(true);
      return;
    }
    const isNew = markLessonComplete(pkg.id, current.id);
    if (isNew) addPointsForLessonComplete();
    setStorageTick((t) => t + 1);
  };

  if (pageState.loading) {
    return <p className="container-page py-8 text-center text-slate-600">جاري تحميل الدرس...</p>;
  }

  if (!pkg) {
    return <p className="container-page py-8 text-center text-slate-600">الدرس غير متاح.</p>;
  }
  if (!current) {
    return <p className="container-page py-8 text-center text-slate-600">هذا الدرس غير متوفر.</p>;
  }

  return (
    <section className="container-page grid gap-6 py-8 lg:grid-cols-12">
      {lockOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-xl">
            <p className="text-lg font-extrabold text-slate-900">هذا الدرس يتطلب الاشتراك في الدورة</p>
            <p className="mt-2 text-sm text-slate-600">اشترك في الدورة للوصول إلى هذا الدرس ومتابعة المنهج كاملًا.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link href={`/packages/${pkg.slug}#purchase`} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white no-underline">
                الذهاب لصفحة الشراء
              </Link>
              <button type="button" onClick={() => setLockOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-4 lg:col-span-8">
        <h1 className="text-3xl font-extrabold text-slate-900">{pkg.title}</h1>
        <div className="relative aspect-video overflow-hidden rounded-xl bg-black shadow-lg">
          {lockedPremium ? (
            <button
              type="button"
              onClick={() => setLockOpen(true)}
              className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-slate-900 to-slate-800 px-6 text-center text-white"
            >
              <p className="text-lg font-extrabold">🔒 هذا الدرس ضمن دورة مدفوعة</p>
              <p className="max-w-md text-sm font-semibold text-slate-200">اشترك الآن للوصول الكامل</p>
              <p className="max-w-md text-xs text-slate-400">اضغط لفتح نافذة الاشتراك أو الانتقال لصفحة الدورة.</p>
            </button>
          ) : (
            <VideoPlayer videoUrl={current.youtubeUrl || `https://www.youtube.com/watch?v=${current.youtubeVideoId}`} title={current.title} />
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-semibold text-slate-900">{current.title}</h2>
          <p className="mt-1 text-sm text-slate-500">المدة التقريبية: {Math.ceil((Number(current.durationSec || 0) || 0) / 60)} دقيقة</p>
          <p className="mt-3 text-slate-700">{current.description || "وصف الدرس غير متوفر."}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => previousLesson && router.push(`/packages/${pkg.slug}/lesson/${previousLesson.id}`)}
              disabled={!previousLesson}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              الدرس السابق
            </button>
            <button
              onClick={() => nextLesson && router.push(`/packages/${pkg.slug}/lesson/${nextLesson.id}`)}
              disabled={!nextLesson}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              الدرس التالي
            </button>
          </div>
          <div className="mt-4">
            <p className="text-sm text-slate-600">
              تقدّم الدورة: {progressStats.pct}% — أكملت {progressStats.done} من {progressStats.total}{" "}
              {progressStats.total === 1 ? "درس" : "دروس"}
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-l from-brand-600 to-indigo-600 transition-all"
                style={{ width: `${progressStats.pct}%` }}
              />
            </div>
            <button
              type="button"
              onClick={handleMarkComplete}
              disabled={lockedPremium || completedHere}
              className="mt-3 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {completedHere ? "تم تسجيل إكمال هذا الدرس" : "تسجيل إكمال الدرس"}
            </button>
            {lockedPremium ? <p className="mt-2 text-xs text-amber-800">اشترك في الدورة لتسجيل الإكمال ومشاهدة الفيديو.</p> : null}
          </div>
        </div>
      </div>

      <aside className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-4 lg:sticky lg:top-6 lg:h-fit">
        <h3 className="mb-1 text-lg font-semibold text-slate-900">محتوى الدورة</h3>
        <p className="mb-1 text-sm text-slate-600">
          أكملت {progressStats.done} من {progressStats.total} {progressStats.total === 1 ? "درس" : "دروس"} ({progressStats.pct}%)
        </p>
        <p className="mb-3 text-xs text-slate-500">إجمالي الدروس المنشورة: {packageLessons.length}</p>
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-gradient-to-l from-brand-600 to-indigo-600" style={{ width: `${progressStats.pct}%` }} />
        </div>
        <div className="space-y-2">
          {packageLessons.map((lesson) => {
            const blocked = Boolean(lesson.locked);
            const done = pkg.id ? getCompletedSet(pkg.id).has(lesson.id) : false;
            const isCurrent = current?.id === lesson.id;
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => {
                  if (blocked) {
                    setLockOpen(true);
                    return;
                  }
                  router.push(`/packages/${pkg.slug}/lesson/${lesson.id}`);
                }}
                className={`w-full rounded-xl border p-2 text-right text-sm transition ${
                  isCurrent ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <p className="flex flex-wrap items-center gap-1 font-medium">
                  <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-md bg-slate-100 px-1 text-[10px] font-bold text-slate-700">
                    {lesson.order}
                  </span>
                  <span>{lesson.title}</span>
                  {isCurrent ? (
                    <span className="me-1 inline-block rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-800">
                      الحالي
                    </span>
                  ) : null}
                  {blocked ? (
                    <span className="me-2 inline-block rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">مدفوع</span>
                  ) : null}
                  {pageState.enrolled && done ? (
                    <span className="me-2 inline-block rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-900">✓</span>
                  ) : null}
                </p>
                {blocked ? <p className="mt-1 text-[11px] text-amber-800">يتطلب اشتراك الدورة</p> : null}
              </button>
            );
          })}
        </div>
      </aside>
    </section>
  );
}
