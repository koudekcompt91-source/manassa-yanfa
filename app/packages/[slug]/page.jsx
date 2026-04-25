"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useDemoSection } from "@/lib/demo-store";
import { formatDzd } from "@/lib/format-money";
import CourseChatPanel from "@/components/student/CourseChatPanel";
import CourseAssessmentsPanel from "@/components/student/CourseAssessmentsPanel";

export default function PackageDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = decodeURIComponent(String(params?.slug || ""));
  const [categories] = useDemoSection("categories");
  const [teachers] = useDemoSection("teachers");
  const [courseState, setCourseState] = useState({ loading: true, course: null, lessons: [], enrolled: false, canAccessPaid: false });
  const [meState, setMeState] = useState(null);
  const [purchaseFlash, setPurchaseFlash] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [activeTab, setActiveTab] = useState("RECORDED");
  const [liveState, setLiveState] = useState({ loading: true, sessions: [], canJoinZoom: false });
  const [progressState, setProgressState] = useState({ loading: true, progress: null });
  const [certificateState, setCertificateState] = useState({ loading: false, certificate: null, error: "" });

  const loadMe = useCallback(async () => {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    setMeState(data || {});
  }, []);

  const loadCourse = useCallback(async () => {
    setCourseState((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch(`/api/courses/${encodeURIComponent(slug)}`, { cache: "no-store", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setCourseState({ loading: false, course: null, lessons: [], enrolled: false, canAccessPaid: false });
        return;
      }
      setCourseState({
        loading: false,
        course: data.course,
        lessons: Array.isArray(data.lessons) ? data.lessons : [],
        enrolled: Boolean(data.enrolled),
        canAccessPaid: Boolean(data.canAccessPaid),
      });
    } catch {
      setCourseState({ loading: false, course: null, lessons: [], enrolled: false, canAccessPaid: false });
    }
  }, [slug]);

  const loadLiveSessions = useCallback(async () => {
    setLiveState((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch(`/api/courses/${encodeURIComponent(slug)}/live-sessions`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setLiveState({ loading: false, sessions: [], canJoinZoom: false });
        return;
      }
      setLiveState({
        loading: false,
        sessions: Array.isArray(data.liveSessions) ? data.liveSessions : [],
        canJoinZoom: Boolean(data.canJoinZoom),
      });
    } catch {
      setLiveState({ loading: false, sessions: [], canJoinZoom: false });
    }
  }, [slug]);

  const loadProgress = useCallback(async () => {
    setProgressState((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch(`/api/courses/${encodeURIComponent(slug)}/progress`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setProgressState({ loading: false, progress: null });
        return;
      }
      setProgressState({ loading: false, progress: data.progress || null });
    } catch {
      setProgressState({ loading: false, progress: null });
    }
  }, [slug]);

  const loadCertificate = useCallback(async () => {
    if (!slug || !courseState.canAccessPaid) return;
    setCertificateState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const res = await fetch(`/api/courses/${encodeURIComponent(slug)}/certificate`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setCertificateState({ loading: false, certificate: null, error: data?.message || "تعذّر تحميل الشهادة." });
        return;
      }
      setCertificateState({ loading: false, certificate: data.certificate || null, error: "" });
    } catch {
      setCertificateState({ loading: false, certificate: null, error: "تعذّر تحميل الشهادة." });
    }
  }, [slug, courseState.canAccessPaid]);

  useEffect(() => {
    loadMe();
    loadCourse();
    loadLiveSessions();
    loadProgress();
  }, [loadMe, loadCourse, loadLiveSessions, loadProgress]);

  useEffect(() => {
    if (!courseState.canAccessPaid || !progressState.progress?.isCompleted) return;
    loadCertificate();
  }, [courseState.canAccessPaid, progressState.progress?.isCompleted, loadCertificate]);

  useEffect(() => {
    const tab = String(searchParams?.get("tab") || "").toLowerCase();
    if (tab === "live" || tab === "live-sessions") {
      setActiveTab("LIVE");
      return;
    }
    if (tab === "recorded" || tab === "lessons") {
      setActiveTab("RECORDED");
      return;
    }
    if (tab === "chat" || tab === "messages") {
      setActiveTab("CHAT");
      return;
    }
    if (tab === "assessments" || tab === "quiz") {
      setActiveTab("ASSESSMENTS");
      return;
    }
    if (tab === "certificate" || tab === "cert") {
      setActiveTab("CERTIFICATE");
    }
  }, [searchParams]);

  const course = courseState.course;
  const lessons = courseState.lessons || [];
  const walletBalance = Number(meState?.user?.walletBalance || 0) || 0;
  const authedStudent = meState?.user?.role === "STUDENT";
  const priceMad = Number(course?.priceMad || course?.price || 0) || 0;
  const isPaid = course?.accessType === "PAID" || priceMad > 0;
  const categoryName = (categories || []).find((c) => c.id === course?.categoryId)?.name || "-";
  const teacherName = (teachers || []).find((t) => t.id === course?.teacherId)?.name || "يوسف مادن";
  const firstLesson = lessons[0];
  const firstLessonHref = firstLesson ? `/packages/${course?.slug}/lesson/${firstLesson.id}` : null;
  const freePreviewCount = lessons.filter((lesson) => lesson.isFreePreview).length;
  const liveSessions = liveState.sessions || [];
  const progress = progressState.progress;
  const completedLessonIds = new Set(progress?.completedLessonIds || []);
  const continueLesson = lessons.find((lesson) => !completedLessonIds.has(lesson.id) && !lesson.locked) || lessons.find((lesson) => !lesson.locked) || null;

  const shortDescription = useMemo(() => {
    const raw = String(course?.description || "").trim();
    if (!raw) return "وصف الدورة غير متوفر بعد.";
    return raw;
  }, [course?.description]);

  const liveStatusMeta = useCallback((status) => {
    if (status === "LIVE") return { label: "مباشر الآن", badge: "bg-emerald-100 text-emerald-800" };
    if (status === "ENDED") return { label: "انتهت", badge: "bg-slate-200 text-slate-700" };
    if (status === "CANCELLED") return { label: "ملغاة", badge: "bg-rose-100 text-rose-700" };
    return { label: "قادمة", badge: "bg-brand-100 text-brand-800" };
  }, []);

  const handlePurchase = useCallback(async () => {
    if (!course?.id || purchasing) return;
    setPurchasing(true);
    setPurchaseFlash(null);
    try {
      const res = await fetch("/api/wallet/purchase", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: course.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setPurchaseFlash({ type: "error", text: data?.message || "تعذّر إتمام العملية." });
        return;
      }
      setPurchaseFlash({ type: "success", text: "تم تفعيل الدورة بنجاح." });
      await loadMe();
      await loadCourse();
    } finally {
      setPurchasing(false);
    }
  }, [course?.id, loadCourse, loadMe, purchasing]);

  if (courseState.loading) {
    return <section className="container-page py-10 text-center text-slate-600">جاري تحميل الدورة...</section>;
  }

  if (!course) {
    return <section className="container-page py-10 text-center text-slate-600">الدورة غير متاحة حاليًا.</section>;
  }

  return (
    <section className="container-page space-y-8 py-8 text-start sm:space-y-10 sm:py-10">
      <header className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{categoryName}</span>
            <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">{course.title}</h1>
            <p className="mt-3 text-base text-slate-600">{shortDescription}</p>
            <p className="mt-2 text-sm text-slate-600">
              الأستاذ: <span className="font-bold text-slate-800">{teacherName}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700">دروس مسجلة</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700">حصص مباشرة</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700">اختبارات وواجبات</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700">شهادة إتمام</span>
            </div>
          </div>
          <div className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:max-w-xs">
            <p className="text-xs font-bold text-slate-500">سعر الدورة</p>
            <p className="mt-1 text-2xl font-black text-brand-700">{isPaid ? formatDzd(priceMad) : "مجانية"}</p>
            <p className="mt-2 text-xs text-slate-500">دروس الدورة: {lessons.length}</p>
            <p className="mt-1 text-xs text-slate-500">معاينة مجانية: {freePreviewCount}</p>
            <p className="mt-1 text-xs text-slate-500">{courseState.canAccessPaid ? "مشترك في الدورة" : "الوصول مقيد"}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {continueLesson ? (
            <Link href={`/packages/${course.slug}/lesson/${continueLesson.id}`} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white no-underline">
              واصل التعلم
            </Link>
          ) : null}
          <button type="button" onClick={() => setActiveTab("CHAT")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
            راسل الأستاذ
          </button>
          {progress?.isCompleted && certificateState.certificate?.certificateCode ? (
            <Link href={`/dashboard/certificates/${encodeURIComponent(certificateState.certificate.certificateCode)}`} className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800 no-underline">
              عرض الشهادة
            </Link>
          ) : null}
        </div>
      </header>

      <section id="purchase" className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-extrabold text-slate-900">الوصول إلى الدورة</h2>
        {courseState.enrolled ? (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            أنت مسجّل في هذه الدورة. يمكنك بدء التعلّم الآن.
            {continueLesson ? (
              <div className="mt-2">
                <Link href={`/packages/${course.slug}/lesson/${continueLesson.id}`} className="font-bold text-emerald-800 underline">
                  الدخول إلى الدورة
                </Link>
              </div>
            ) : null}
          </div>
        ) : !authedStudent ? (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            يلزم تسجيل الدخول كطالب للالتحاق بالدورة.
            <div className="mt-2">
              <Link href="/login" className="font-bold text-brand-700 underline">
                تسجيل الدخول
              </Link>
            </div>
          </div>
        ) : isPaid ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-slate-700">
              رصيد محفظتك: <span className="font-bold">{formatDzd(walletBalance)}</span>
            </p>
            {walletBalance < priceMad ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                رصيدك غير كافٍ. يمكنك شحن المحفظة ثم العودة لإتمام الشراء.
                <div className="mt-2">
                  <Link href="/dashboard?recharge=1" className="font-bold text-brand-700 underline">
                    شحن الرصيد
                  </Link>
                </div>
              </div>
            ) : null}
            <AdminLikeButton disabled={walletBalance < priceMad || purchasing} onClick={handlePurchase}>
              {purchasing ? "جاري المعالجة..." : "اشترك في الدورة"}
            </AdminLikeButton>
          </div>
        ) : (
          <div className="mt-3">
            <AdminLikeButton disabled={purchasing} onClick={handlePurchase}>
              {purchasing ? "جاري المعالجة..." : "ابدأ الدورة"}
            </AdminLikeButton>
          </div>
        )}
        {purchaseFlash ? (
          <div className={`mt-3 rounded-xl border px-3 py-2 text-sm ${purchaseFlash.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
            {purchaseFlash.text}
          </div>
        ) : null}
      </section>

      {courseState.canAccessPaid ? (
        <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-extrabold text-slate-900">تقدمك في الدورة</h2>
              <p className="mt-2 text-sm text-slate-600">
                أكملت {progress?.completedLessons || 0} من الدروس ({progress?.totalLessons || 0}) · وأرسلت{" "}
                {progress?.completedAssessments || 0} من التقييمات ({progress?.totalAssessments || 0})
              </p>
              <p className="mt-1 text-xs text-slate-500">
                آخر نشاط: {progress?.lastActivityAt ? new Date(progress.lastActivityAt).toLocaleString("ar-DZ") : "لا يوجد نشاط بعد"}
              </p>
            </div>
            <div className="text-start sm:text-end">
              <p className="text-3xl font-black text-brand-700">{progress?.progressPercent || 0}%</p>
              {progress?.isCompleted ? <p className="mt-1 text-sm font-bold text-emerald-700">أكملت هذه الدورة بنجاح</p> : null}
            </div>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-gradient-to-l from-brand-600 to-indigo-600 transition-all" style={{ width: `${progress?.progressPercent || 0}%` }} />
          </div>
          {progress?.isCompleted ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
              <p className="text-base font-extrabold text-emerald-800">أكملت هذه الدورة بنجاح</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {certificateState.certificate?.certificateCode ? (
                  <>
                    <Link
                      href={`/dashboard/certificates/${encodeURIComponent(certificateState.certificate.certificateCode)}`}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white no-underline"
                    >
                      عرض الشهادة
                    </Link>
                    <Link
                      href={`/dashboard/certificates/${encodeURIComponent(certificateState.certificate.certificateCode)}`}
                      className="rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-bold text-emerald-800 no-underline"
                    >
                      تحميل الشهادة
                    </Link>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={loadCertificate}
                    disabled={certificateState.loading}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {certificateState.loading ? "جاري تجهيز الشهادة..." : "عرض الشهادة"}
                  </button>
                )}
              </div>
              {certificateState.error ? <p className="mt-2 text-xs text-rose-700">{certificateState.error}</p> : null}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-600">الشهادة غير متاحة بعد. أكمل الدورة للحصول على الشهادة.</p>
          )}
          {continueLesson ? (
            <div className="mt-4">
              <Link href={`/packages/${course.slug}/lesson/${continueLesson.id}`} className="inline-flex rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white no-underline">
                واصل التعلم
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-extrabold text-slate-900">محتوى الدورة</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("RECORDED")}
            className={`rounded-xl px-4 py-2 text-sm font-bold ${activeTab === "RECORDED" ? "bg-brand-600 text-white" : "border border-slate-200 text-slate-700"}`}
          >
            الدروس المسجلة
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("LIVE")}
            className={`rounded-xl px-4 py-2 text-sm font-bold ${activeTab === "LIVE" ? "bg-brand-600 text-white" : "border border-slate-200 text-slate-700"}`}
          >
            الحصص المباشرة
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("CHAT")}
            className={`rounded-xl px-4 py-2 text-sm font-bold ${activeTab === "CHAT" ? "bg-brand-600 text-white" : "border border-slate-200 text-slate-700"}`}
          >
            المحادثة مع الأستاذ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ASSESSMENTS")}
            className={`rounded-xl px-4 py-2 text-sm font-bold ${activeTab === "ASSESSMENTS" ? "bg-brand-600 text-white" : "border border-slate-200 text-slate-700"}`}
          >
            الواجبات والاختبارات
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("CERTIFICATE")}
            className={`rounded-xl px-4 py-2 text-sm font-bold ${activeTab === "CERTIFICATE" ? "bg-brand-600 text-white" : "border border-slate-200 text-slate-700"}`}
          >
            الشهادة
          </button>
        </div>

        {activeTab === "RECORDED" ? (
          <>
            {!lessons.length ? <p className="mt-4 text-sm text-slate-600">لا توجد دروس منشورة في هذه الدورة حاليًا.</p> : null}
            <div className="mt-5 space-y-3">
              {lessons.map((lesson) => (
                <article key={lesson.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">
                        {lesson.order}. {lesson.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{lesson.description || "لا يوجد وصف لهذا الدرس."}</p>
                      <p className="mt-1 text-xs text-slate-500">المدة: {Math.ceil((Number(lesson.durationSec || 0) || 0) / 60)} دقيقة</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {completedLessonIds.has(lesson.id) ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">تم إكمال الدرس</span>
                      ) : null}
                      {lesson.locked ? <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">يتطلب اشتراك</span> : null}
                      <Link
                        href={`/packages/${course.slug}/lesson/${lesson.id}`}
                        className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white no-underline"
                      >
                        تشغيل الدرس
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : activeTab === "LIVE" ? (
          <>
            {liveState.loading ? <p className="mt-4 text-sm text-slate-600">جاري تحميل الحصص المباشرة...</p> : null}
            {!liveState.loading && !liveSessions.length ? (
              <p className="mt-4 text-sm text-slate-600">لا توجد حصص مباشرة منشورة في هذه الدورة حاليًا.</p>
            ) : null}
            {!liveState.loading ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {liveSessions.map((session) => {
                  const meta = liveStatusMeta(session.status);
                  return (
                    <article key={session.id} className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-extrabold text-slate-900">{session.title}</h3>
                        <span className={`rounded-full px-2 py-1 text-xs font-bold ${meta.badge}`}>{meta.label}</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">{new Date(session.startsAt).toLocaleString("ar-DZ")} - {session.durationMin} دقيقة</p>
                      <p className="mt-2 text-sm text-slate-600">{String(session.description || "").trim() || "بدون وصف."}</p>
                      <div className="mt-4">
                        {session.canJoin && session.zoomUrl ? (
                          <a
                            href={session.zoomUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white no-underline"
                          >
                            انضم إلى الحصة
                          </a>
                        ) : (
                          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
                            هذه الحصة متاحة فقط للمشتركين في الدورة
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </>
        ) : activeTab === "CHAT" ? (
          <CourseChatPanel
            courseSlug={course.slug}
            courseTitle={course.title}
            teacherName={teacherName}
            authedStudent={authedStudent}
            canAccessChat={courseState.canAccessPaid}
            myUserId={meState?.user?.id || ""}
          />
        ) : activeTab === "ASSESSMENTS" ? (
          <CourseAssessmentsPanel
            courseSlug={course.slug}
            authedStudent={authedStudent}
            canAccess={courseState.canAccessPaid}
            onProgressChange={loadProgress}
          />
        ) : (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            {progress?.isCompleted ? (
              <>
                <p className="text-lg font-extrabold text-emerald-800">أكملت هذه الدورة بنجاح</p>
                <p className="mt-1 text-sm text-slate-600">شهادتك متاحة الآن.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {certificateState.certificate?.certificateCode ? (
                    <>
                      <Link href={`/dashboard/certificates/${encodeURIComponent(certificateState.certificate.certificateCode)}`} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white no-underline">
                        عرض الشهادة
                      </Link>
                      <Link href={`/dashboard/certificates/${encodeURIComponent(certificateState.certificate.certificateCode)}`} className="rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-bold text-emerald-800 no-underline">
                        تحميل الشهادة
                      </Link>
                    </>
                  ) : (
                    <button type="button" onClick={loadCertificate} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">
                      عرض الشهادة
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-base font-bold text-slate-700">أكمل الدورة للحصول على الشهادة</p>
                <p className="mt-1 text-sm text-slate-600">نسبة التقدم الحالية: {progress?.progressPercent || 0}%</p>
              </>
            )}
          </div>
        )}
      </section>

      {firstLessonHref ? (
        <div className="flex flex-wrap justify-center gap-3 border-t border-slate-200 pt-6">
          <Link href={firstLessonHref} className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white no-underline">
            ابدأ التعلّم
          </Link>
        </div>
      ) : null}
    </section>
  );
}

function AdminLikeButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm disabled:opacity-50"
    >
      {children}
    </button>
  );
}
