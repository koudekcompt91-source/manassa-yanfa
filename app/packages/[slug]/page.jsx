"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useDemoSection } from "@/lib/demo-store";
import { formatDzd } from "@/lib/format-money";

export default function PackageDetailsPage() {
  const params = useParams();
  const slug = decodeURIComponent(String(params?.slug || ""));
  const [categories] = useDemoSection("categories");
  const [teachers] = useDemoSection("teachers");
  const [courseState, setCourseState] = useState({ loading: true, course: null, lessons: [], enrolled: false, canAccessPaid: false });
  const [meState, setMeState] = useState(null);
  const [purchaseFlash, setPurchaseFlash] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [activeTab, setActiveTab] = useState("RECORDED");
  const [liveState, setLiveState] = useState({ loading: true, sessions: [], canJoinZoom: false });

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

  useEffect(() => {
    loadMe();
    loadCourse();
    loadLiveSessions();
  }, [loadMe, loadCourse, loadLiveSessions]);

  const course = courseState.course;
  const lessons = courseState.lessons || [];
  const walletBalance = Number(meState?.user?.walletBalance || 0) || 0;
  const authedStudent = meState?.user?.role === "STUDENT";
  const priceMad = Number(course?.priceMad || course?.price || 0) || 0;
  const isPaid = course?.accessType === "PAID" || priceMad > 0;
  const categoryName = (categories || []).find((c) => c.id === course?.categoryId)?.name || "-";
  const teacherName = (teachers || []).find((t) => t.id === course?.teacherId)?.name || "طاقم yanfa3 Education";
  const firstLesson = lessons[0];
  const firstLessonHref = firstLesson ? `/packages/${course?.slug}/lesson/${firstLesson.id}` : null;
  const freePreviewCount = lessons.filter((lesson) => lesson.isFreePreview).length;
  const liveSessions = liveState.sessions || [];

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
          </div>
          <div className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:max-w-xs">
            <p className="text-xs font-bold text-slate-500">سعر الدورة</p>
            <p className="mt-1 text-2xl font-black text-brand-700">{isPaid ? formatDzd(priceMad) : "مجانية"}</p>
            <p className="mt-2 text-xs text-slate-500">دروس الدورة: {lessons.length}</p>
            <p className="mt-1 text-xs text-slate-500">معاينة مجانية: {freePreviewCount}</p>
          </div>
        </div>
      </header>

      <section id="purchase" className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-extrabold text-slate-900">الوصول إلى الدورة</h2>
        {courseState.enrolled ? (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">أنت مسجّل في هذه الدورة. يمكنك بدء التعلّم الآن.</div>
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
              {purchasing ? "جاري المعالجة..." : "شراء الدورة"}
            </AdminLikeButton>
          </div>
        ) : (
          <div className="mt-3">
            <AdminLikeButton disabled={purchasing} onClick={handlePurchase}>
              {purchasing ? "جاري المعالجة..." : "تسجيل مجاني في الدورة"}
            </AdminLikeButton>
          </div>
        )}
        {purchaseFlash ? (
          <div className={`mt-3 rounded-xl border px-3 py-2 text-sm ${purchaseFlash.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
            {purchaseFlash.text}
          </div>
        ) : null}
      </section>

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
                    </div>
                    <div className="flex items-center gap-2">
                      {lesson.locked ? <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">يتطلب اشتراك</span> : null}
                      <Link
                        href={`/packages/${course.slug}/lesson/${lesson.id}`}
                        className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white no-underline"
                      >
                        فتح الدرس
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
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
