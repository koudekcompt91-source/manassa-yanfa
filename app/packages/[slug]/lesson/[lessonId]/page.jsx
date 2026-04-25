"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import { addPointsForLessonComplete } from "@/lib/student-progress";

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
  const [progressState, setProgressState] = useState({
    loading: true,
    progress: null,
    marking: false,
  });
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

  const loadProgress = useCallback(async () => {
    if (!slug) return;
    setProgressState((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch(`/api/courses/${encodeURIComponent(slug)}/progress`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setProgressState({ loading: false, progress: null, marking: false });
        return;
      }
      setProgressState({ loading: false, progress: data.progress || null, marking: false });
    } catch {
      setProgressState({ loading: false, progress: null, marking: false });
    }
  }, [slug]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const pkg = pageState.course;
  const packageLessons = pageState.lessons || [];
  const current = useMemo(
    () => packageLessons.find((lesson) => String(lesson.id) === lessonId) || null,
    [packageLessons, lessonId]
  );
  const lockedPremium = Boolean(current?.locked);
  const progressStats = progressState.progress;

  const currentIndex = useMemo(() => packageLessons.findIndex((row) => row.id === current?.id), [packageLessons, current]);
  const previousLesson = currentIndex > 0 ? packageLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < packageLessons.length - 1 ? packageLessons[currentIndex + 1] : null;

  const completedLessonIds = new Set(progressStats?.completedLessonIds || []);
  const completedHere = Boolean(current?.id && completedLessonIds.has(current.id));

  const canTrackProgress = Boolean(pageState.canAccessPaid);

  const markLessonProgress = useCallback(
    async (action) => {
      if (!pkg?.slug || !current?.id || lockedPremium || !canTrackProgress) return;
      setProgressState((s) => ({ ...s, marking: true }));
      try {
        const res = await fetch(`/api/courses/${encodeURIComponent(pkg.slug)}/lessons/${encodeURIComponent(current.id)}/progress`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok) return;
        setProgressState((s) => ({ ...s, progress: data.progress || s.progress, marking: false }));
      } catch {
        setProgressState((s) => ({ ...s, marking: false }));
      }
    },
    [pkg?.slug, current?.id, lockedPremium, canTrackProgress]
  );

  const handleMarkComplete = () => {
    if (!pkg?.id || !current?.id || progressState.marking || !canTrackProgress) return;
    if (lockedPremium) {
      setLockOpen(true);
      return;
    }
    const wasDone = completedHere;
    markLessonProgress("COMPLETED").then(() => {
      if (!wasDone) addPointsForLessonComplete();
    });
  };

  useEffect(() => {
    if (!current?.id || lockedPremium || !canTrackProgress) return;
    markLessonProgress("STARTED");
  }, [current?.id, lockedPremium, canTrackProgress, markLessonProgress]);

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
    <section className="container-page premium-app-bg grid gap-6 py-8 lg:grid-cols-12">
      {lockOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-xl">
            <p className="text-lg font-extrabold text-slate-900">هذا الدرس يتطلب الاشتراك في الدورة</p>
            <p className="mt-2 text-sm text-slate-600">اشترك في الدورة للوصول إلى هذا الدرس ومتابعة المنهج كاملًا.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link href={`/packages/${pkg.slug}#purchase`} className="touch-button-primary no-underline">
                الذهاب لصفحة الشراء
              </Link>
              <button type="button" onClick={() => setLockOpen(false)} className="touch-button-secondary">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-4 lg:col-span-8">
        <h1 className="text-3xl font-extrabold text-slate-900">{pkg.title}</h1>
        <div className="interactive-card relative aspect-video overflow-hidden rounded-xl bg-black shadow-lg">
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
        <div className="interactive-card rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-semibold text-slate-900">{current.title}</h2>
          <p className="mt-1 text-sm text-slate-500">المدة التقريبية: {Math.ceil((Number(current.durationSec || 0) || 0) / 60)} دقيقة</p>
          <p className="mt-3 text-slate-700">{current.description || "وصف الدرس غير متوفر."}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => previousLesson && router.push(`/packages/${pkg.slug}/lesson/${previousLesson.id}`)}
              disabled={!previousLesson}
              className="touch-button-secondary border-slate-300"
            >
              الدرس السابق
            </button>
            <button
              onClick={() => nextLesson && router.push(`/packages/${pkg.slug}/lesson/${nextLesson.id}`)}
              disabled={!nextLesson}
              className="touch-button-primary"
            >
              الدرس التالي
            </button>
          </div>
          <div className="mt-4">
            <p className="text-sm text-slate-600">
              تقدّم الدورة: {progressStats?.progressPercent || 0}% — أكملت {progressStats?.completedLessons || 0} من {progressStats?.totalLessons || 0}{" "}
              {progressStats?.totalLessons === 1 ? "درس" : "دروس"}
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-l from-brand-600 to-indigo-600 transition-[width] duration-500"
                style={{ width: `${progressStats?.progressPercent || 0}%` }}
              />
            </div>
            <button
              type="button"
              onClick={handleMarkComplete}
              disabled={lockedPremium || completedHere || progressState.marking || !canTrackProgress}
              className="touch-button-primary mt-3 disabled:cursor-not-allowed"
            >
              {completedHere ? "تم إكمال الدرس" : progressState.marking ? "جاري الحفظ..." : "تحديد الدرس كمكتمل"}
            </button>
            {!canTrackProgress ? <p className="mt-2 text-xs text-slate-600">تتبّع التقدم متاح بعد الاشتراك في الدورة.</p> : null}
            {lockedPremium ? <p className="mt-2 text-xs text-amber-800">اشترك في الدورة لتسجيل الإكمال ومشاهدة الفيديو.</p> : null}
          </div>
        </div>
      </div>

      <aside className="interactive-card rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-4 lg:sticky lg:top-6 lg:h-fit">
        <h3 className="mb-1 text-lg font-semibold text-slate-900">محتوى الدورة</h3>
        <p className="mb-1 text-sm text-slate-600">
          أكملت {progressStats?.completedLessons || 0} من {progressStats?.totalLessons || 0}{" "}
          {(progressStats?.totalLessons || 0) === 1 ? "درس" : "دروس"} ({progressStats?.progressPercent || 0}%)
        </p>
        <p className="mb-3 text-xs text-slate-500">إجمالي الدروس المنشورة: {packageLessons.length}</p>
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-gradient-to-l from-brand-600 to-indigo-600 transition-[width] duration-500" style={{ width: `${progressStats?.progressPercent || 0}%` }} />
        </div>
        <div className="space-y-2">
          {packageLessons.map((lesson) => {
            const blocked = Boolean(lesson.locked);
            const done = completedLessonIds.has(lesson.id);
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
                className={`interactive-card w-full rounded-xl border p-2 text-right text-sm transition ${
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
                    <span className="motion-safe:animate-[softPulse_1.8s_ease-in-out_2] me-2 inline-block rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-900">✓</span>
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
