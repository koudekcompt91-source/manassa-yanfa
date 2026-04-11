"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import LessonLockedModal from "@/components/student/LessonLockedModal";
import { studentSeesLesson } from "@/lib/academic-levels";
import { useDemoSection } from "@/lib/demo-store";
import { isLessonPublished, normalizeLessonAccessType } from "@/lib/lesson-utils";
import { addPointsForLessonComplete, getCompletedSet, getPackageProgressStats, markLessonComplete } from "@/lib/student-progress";

function lessonMatchesParam(row, normalizedLesson, rawLesson) {
  const rowSlug = decodeURIComponent(String(row.slug || "")).trim();
  const rowId = String(row.id || "").trim();
  return rowId === normalizedLesson || rowSlug === normalizedLesson || rowId === rawLesson || rowSlug === rawLesson;
}

export default function PackageLessonPage() {
  const params = useParams();
  const rawSlug = String(params?.slug || params?.id || "");
  const normalizedSlug = decodeURIComponent(rawSlug).trim();
  const rawLesson = String(params?.lessonId || "");
  const normalizedLesson = decodeURIComponent(rawLesson).trim();
  const router = useRouter();
  const [packages] = useDemoSection("packages");
  const [lessons] = useDemoSection("lessons");
  const [meState, setMeState] = useState(null);
  const [meLoaded, setMeLoaded] = useState(false);
  const [storageTick, setStorageTick] = useState(0);
  const [lockOpen, setLockOpen] = useState(false);

  const loadMe = useCallback(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setMeState(data);
        setMeLoaded(true);
      })
      .catch(() => {
        setMeState({});
        setMeLoaded(true);
      });
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  useEffect(() => {
    const onStore = () => setStorageTick((t) => t + 1);
    window.addEventListener("yanfa-student-storage", onStore);
    return () => window.removeEventListener("yanfa-student-storage", onStore);
  }, []);

  const pkg = useMemo(() => {
    return (packages || []).find((row) => {
      const rowSlug = decodeURIComponent(String(row.slug || "")).trim();
      const rowId = String(row.id || "").trim();
      return rowSlug === normalizedSlug || rowId === normalizedSlug || rowSlug === rawSlug || rowId === rawSlug;
    });
  }, [packages, normalizedSlug, rawSlug]);

  const authedStudent = meState?.user?.role === "STUDENT";
  const studentLevel = authedStudent ? String(meState?.user?.academicLevel || "").trim() : "";
  const studentLevelCode = authedStudent ? String(meState?.user?.level || "").trim() : "";

  const allLessonsInPackage = useMemo(
    () => (lessons || []).filter((row) => row.packageId === pkg?.id),
    [lessons, pkg]
  );

  const targetLesson = useMemo(
    () => allLessonsInPackage.find((row) => lessonMatchesParam(row, normalizedLesson, rawLesson)) || null,
    [allLessonsInPackage, normalizedLesson, rawLesson]
  );

  const packageLessons = useMemo(() => {
    const list = allLessonsInPackage.filter((row) => isLessonPublished(row)).sort((a, b) => (a.order || 0) - (b.order || 0));
    if (!authedStudent) return list;
    return list.filter((row) => studentSeesLesson(studentLevel || null, row, packages || [], studentLevelCode || null));
  }, [allLessonsInPackage, authedStudent, studentLevel, studentLevelCode, packages]);

  const current = useMemo(() => {
    if (!targetLesson || !isLessonPublished(targetLesson)) return null;
    return targetLesson;
  }, [targetLesson]);

  const enrolled = useMemo(
    () => !!pkg && (meState?.enrollments || []).some((e) => e.packageId === pkg.id),
    [meState, pkg]
  );

  const premium = useMemo(() => (current ? normalizeLessonAccessType(current) === "premium" : false), [current]);
  const lockedPremium = premium && !enrolled;

  const lessonIdsOrdered = useMemo(() => packageLessons.map((l) => l.id), [packageLessons]);
  const progressStats = useMemo(
    () => getPackageProgressStats(pkg?.id, lessonIdsOrdered),
    [pkg?.id, lessonIdsOrdered, storageTick]
  );

  const currentIndex = useMemo(() => packageLessons.findIndex((row) => row.id === current?.id), [packageLessons, current]);
  const previousLesson = currentIndex > 0 ? packageLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < packageLessons.length - 1 ? packageLessons[currentIndex + 1] : null;

  const isPublished = pkg?.isPublished === true || pkg?.isPublished === "published" || pkg?.status === "published";

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

  if (!pkg || !isPublished) {
    return <p className="container-page py-8 text-center text-slate-600">الدرس غير متاح.</p>;
  }
  if (!targetLesson) {
    return <p className="container-page py-8 text-center text-slate-600">هذا الدرس غير متوفر.</p>;
  }
  if (!isLessonPublished(targetLesson)) {
    return <p className="container-page py-8 text-center text-slate-600">هذا الدرس غير متوفر حاليًا.</p>;
  }
  const levelBlocked =
    authedStudent &&
    !!targetLesson &&
    !!pkg &&
    !enrolled &&
    !studentSeesLesson(studentLevel || null, targetLesson, packages || [], studentLevelCode || null);
  if (levelBlocked) {
    return (
      <section className="container-page py-16 text-center text-slate-700">
        <p className="text-lg font-bold text-slate-900">هذا المحتوى لا يخص مستواك الدراسي</p>
        <p className="mt-2 text-sm">مستواك: {studentLevel}</p>
        <Link href="/courses" className="mt-6 inline-block text-sm font-bold text-brand-700 underline">
          العودة إلى قائمة الدورات
        </Link>
      </section>
    );
  }
  if (!current) {
    return <p className="container-page py-8 text-center text-slate-600">لا توجد دروس منشورة في هذه الدورة.</p>;
  }

  return (
    <section className="container-page grid gap-6 py-8 lg:grid-cols-12">
      <LessonLockedModal open={lockOpen} onClose={() => setLockOpen(false)} packageSlug={pkg.slug} />

      <div className="space-y-4 lg:col-span-8">
        <h1 className="text-3xl font-extrabold text-slate-900">{pkg.title}</h1>
        <div className="relative aspect-video overflow-hidden rounded-xl bg-black shadow-lg">
          {lockedPremium ? (
            <button
              type="button"
              onClick={() => setLockOpen(true)}
              className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-slate-900 to-slate-800 px-6 text-center text-white"
            >
              <p className="text-lg font-extrabold">🔒 هذا الدرس ضمن باقة مدفوعة</p>
              <p className="max-w-md text-sm font-semibold text-slate-200">اشترك الآن للوصول الكامل</p>
              <p className="max-w-md text-xs text-slate-400">اضغط لفتح نافذة الاشتراك أو الانتقال لصفحة الباقة.</p>
            </button>
          ) : (
            <VideoPlayer videoUrl={current.youtubeUrl} title={current.title} />
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-semibold text-slate-900">{current.title}</h2>
          <p className="mt-1 text-sm text-slate-500">المدة: {current.duration || 0} دقيقة - النوع: {current.type || "text"}</p>
          <p className="mt-3 text-slate-700">{current.description || "وصف الدرس غير متوفر."}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => previousLesson && router.push(`/packages/${pkg.slug}/lesson/${previousLesson.id}`)}
              disabled={!previousLesson}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              السابق
            </button>
            <button
              onClick={() => nextLesson && router.push(`/packages/${pkg.slug}/lesson/${nextLesson.id}`)}
              disabled={!nextLesson}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              التالي
            </button>
          </div>
          <div className="mt-4">
            <p className="text-sm text-slate-600">
              تقدّم الباقة: {progressStats.pct}% — أكملت {progressStats.done} من {progressStats.total}{" "}
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
            {lockedPremium ? <p className="mt-2 text-xs text-amber-800">اشترك في الباقة لتسجيل الإكمال ومشاهدة الفيديو.</p> : null}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-900">المرفقات والموارد</h3>
          {current.attachments?.length ? (
            <ul className="mt-3 space-y-2">
              {current.attachments.map((attachment) => (
                <li key={attachment} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {attachment}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">لا توجد مرفقات لهذا الدرس.</p>
          )}
        </div>
      </div>

      <aside className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-4 lg:sticky lg:top-6 lg:h-fit">
        <h3 className="mb-1 text-lg font-semibold text-slate-900">محتوى الباقة</h3>
        <p className="mb-1 text-sm text-slate-600">
          أكملت {progressStats.done} من {progressStats.total} {progressStats.total === 1 ? "درس" : "دروس"} ({progressStats.pct}%)
        </p>
        <p className="mb-3 text-xs text-slate-500">إجمالي الدروس المنشورة: {packageLessons.length}</p>
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-gradient-to-l from-brand-600 to-indigo-600" style={{ width: `${progressStats.pct}%` }} />
        </div>
        <div className="space-y-2">
          {packageLessons.map((lesson) => {
            const isPrem = normalizeLessonAccessType(lesson) === "premium";
            const blocked = isPrem && !enrolled;
            const done = pkg.id ? getCompletedSet(pkg.id).has(lesson.id) : false;
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => {
                  if (blocked) setLockOpen(true);
                  router.push(`/packages/${pkg.slug}/lesson/${lesson.id}`);
                }}
                className={`w-full rounded-xl border p-2 text-right text-sm transition ${
                  current?.id === lesson.id ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <p className="font-medium">
                  {lesson.order}. {lesson.title}
                  {isPrem ? (
                    <span className="me-2 inline-block rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">مدفوع</span>
                  ) : null}
                  {enrolled && done ? (
                    <span className="me-2 inline-block rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-900">✓</span>
                  ) : null}
                </p>
                {blocked ? <p className="mt-1 text-[11px] text-amber-800">يتطلب اشتراك الباقة</p> : null}
              </button>
            );
          })}
        </div>
      </aside>
    </section>
  );
}
