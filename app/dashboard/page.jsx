"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useDemoSection } from "@/lib/demo-store";
import RechargeWalletModal from "@/components/student/RechargeWalletModal";
import { logoutSession } from "@/lib/admin-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDzd, formatDzdOrDash, formatDzdSigned } from "@/lib/format-money";
import { getCompletedSet, getPackageProgressStats, readEngagement } from "@/lib/student-progress";
import { studentSeesLesson, studentSeesPackage } from "@/lib/academic-levels";
import { getPackagePriceMad } from "@/lib/wallet-ops";

function DashboardPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [buttons] = useDemoSection("ctaButtons");
  const [announcements] = useDemoSection("announcements");
  const [packages] = useDemoSection("packages");
  const [lessons] = useDemoSection("lessons");
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [clientStorageTick, setClientStorageTick] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  const loadMe = useCallback(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then(setSessionData);
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const rechargeParam = searchParams.get("recharge");
  useEffect(() => {
    if (rechargeParam === "1") setRechargeOpen(true);
  }, [rechargeParam]);

  const closeRechargeModal = useCallback(() => {
    setRechargeOpen(false);
    if (rechargeParam === "1") {
      router.replace("/dashboard", { scroll: false });
    }
  }, [rechargeParam, router]);

  useEffect(() => {
    const onStore = () => setClientStorageTick((t) => t + 1);
    window.addEventListener("yanfa-student-storage", onStore);
    return () => window.removeEventListener("yanfa-student-storage", onStore);
  }, []);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const user = sessionData?.user;
  const displayName = user?.fullName?.trim() || user?.email || "طالب منصة ينفع";
  const displayEmail = user?.email || "";
  const studentLevel = (user?.role === "STUDENT" ? String(user?.academicLevel || "").trim() : "") || "";
  const studentLevelCode = user?.role === "STUDENT" ? String(user?.level || "").trim() : "";

  const walletBalance = useMemo(() => {
    const w = Number(user?.walletBalance);
    return Number.isFinite(w) && w >= 0 ? Math.round(w) : 0;
  }, [user]);

  const publishedPackages = useMemo(() => {
    const list = (packages || []).filter((row) => row.isPublished);
    if (user?.role !== "STUDENT") return list;
    return list.filter((row) => studentSeesPackage(studentLevel || null, row, studentLevelCode || null));
  }, [packages, studentLevel, studentLevelCode, user?.role]);

  const publishedLessons = useMemo(() => {
    const list = (lessons || []).filter((row) => row.isPublished);
    if (user?.role !== "STUDENT") return list;
    return list.filter((row) => studentSeesLesson(studentLevel || null, row, packages || [], studentLevelCode || null));
  }, [lessons, packages, studentLevel, studentLevelCode, user?.role]);

  const myEnrollments = sessionData?.enrollments || [];
  const enrolledPackageIds = useMemo(() => new Set(myEnrollments.map((e) => e.packageId)), [myEnrollments]);

  const enrolledCourses = myEnrollments.length;

  const lessonsInEnrolledPackages = useMemo(() => {
    return publishedLessons.filter((l) => enrolledPackageIds.has(l.packageId));
  }, [publishedLessons, enrolledPackageIds]);

  const lessonsAvailableCount = lessonsInEnrolledPackages.length;

  const continueLearning = useMemo(() => {
    if (!publishedPackages.length || !enrolledPackageIds.size) {
      return { href: "/courses", lessonTitle: "", packageTitle: "" };
    }
    const firstEnrollment = myEnrollments[0];
    const pkg = publishedPackages.find((p) => p.id === firstEnrollment?.packageId);
    if (!pkg?.slug) return { href: "/courses", lessonTitle: "", packageTitle: "" };
    const pkgLessons = publishedLessons
      .filter((l) => l.packageId === pkg.id)
      .slice()
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    if (!pkgLessons.length) return { href: `/packages/${pkg.slug}`, lessonTitle: "", packageTitle: pkg.title || "" };

    let target = pkgLessons[0];
    if (hydrated && pkg.id) {
      const done = getCompletedSet(pkg.id);
      const next = pkgLessons.find((l) => !done.has(l.id));
      if (next) target = next;
    }
    return {
      href: `/packages/${pkg.slug}/lesson/${target.id}`,
      lessonTitle: (target.title || "درس").trim(),
      packageTitle: (pkg.title || "").trim(),
    };
  }, [myEnrollments, publishedPackages, publishedLessons, enrolledPackageIds, hydrated]);

  const recommendedPackages = useMemo(() => {
    const out = [];
    const seen = new Set();
    const published = publishedPackages.filter((p) => p.isPublished);
    const push = (p) => {
      if (!p || seen.has(p.id) || out.length >= 3) return;
      out.push(p);
      seen.add(p.id);
    };
    const featured = published.find((p) => p.isFeatured);
    if (featured && !enrolledPackageIds.has(featured.id)) push(featured);
    published.forEach((p) => {
      if (out.length >= 3) return;
      if (!enrolledPackageIds.has(p.id)) push(p);
    });
    published.forEach((p) => {
      if (out.length >= 3) return;
      push(p);
    });
    return out;
  }, [publishedPackages, enrolledPackageIds]);

  const myWalletTx = (sessionData?.transactions || []).slice(0, 20);
  const pendingRechargeCount = sessionData?.pendingRechargeCount ?? 0;

  const upcomingFromEnrollments = useMemo(() => {
    return lessonsInEnrolledPackages
      .slice()
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
      .slice(0, 4)
      .map((lesson) => ({
        id: lesson.id,
        packageId: lesson.packageId,
        title: lesson.title || "درس",
        course: publishedPackages.find((pkg) => pkg.id === lesson.packageId)?.title || "دورة مسجّل بها",
      }));
  }, [lessonsInEnrolledPackages, publishedPackages]);

  const dashboardCtaButtons = useMemo(
    () => (buttons || []).filter((row) => row.placement === "dashboard" && row.visible),
    [buttons]
  );

  const engagement = useMemo(() => {
    if (!hydrated) return { points: 0, streak: 0, lastLogin: null, badges: [] };
    return readEngagement();
  }, [hydrated, clientStorageTick]);

  const enrollmentProgress = useMemo(() => {
    return myEnrollments
      .map((e) => {
        const pkg = publishedPackages.find((p) => p.id === e.packageId);
        if (!pkg?.id) return null;
        const ids = publishedLessons
          .filter((l) => l.packageId === pkg.id)
          .slice()
          .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
          .map((l) => l.id);
        const st = hydrated
          ? getPackageProgressStats(pkg.id, ids)
          : { done: 0, total: ids.length, pct: 0 };
        return { pkg, ...st };
      })
      .filter(Boolean);
  }, [myEnrollments, publishedPackages, publishedLessons, clientStorageTick, hydrated]);

  const overallProgressPct = useMemo(() => {
    if (!enrollmentProgress.length) return 0;
    const sum = enrollmentProgress.reduce((acc, r) => acc + (Number(r?.pct) || 0), 0);
    return Math.min(100, Math.round(sum / enrollmentProgress.length));
  }, [enrollmentProgress]);

  const currentGoalLabel = useMemo(() => {
    if (continueLearning.packageTitle) return continueLearning.packageTitle;
    const first = enrollmentProgress[0];
    if (first?.pkg?.title) return first.pkg.title;
    return "ابدأ من استكشاف الدورات";
  }, [continueLearning.packageTitle, enrollmentProgress]);

  const badgeLabel = (id) => {
    if (id === "streak-3") return "سلسلة 3 أيام";
    if (id === "streak-7") return "أسبوع متواصل";
    if (id === "points-50") return "50 نقطة";
    if (id === "points-150") return "150 نقطة";
    return id;
  };

  const statCards = [
    { label: "الرصيد", value: formatDzd(walletBalance), sub: "بالدينار الجزائري" },
    { label: "الدورات المشتركة", value: enrolledCourses, sub: "دورة" },
    { label: "الدروس المتاحة", value: lessonsAvailableCount, sub: "ضمن دوراتك" },
    { label: "نقاط التفاعل", value: engagement.points, sub: "نقاط" },
  ];

  return (
    <div className="flex w-full flex-col gap-8">
      <header className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-slate-400">لوحة التعلّم</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">مرحبًا، {displayName}</h1>
        <p className="mt-2 text-base text-slate-500">متابعة تقدّمك ودوراتك.</p>
        {displayEmail ? (
          <p className="mt-2 text-sm text-slate-400" dir="ltr">
            {displayEmail}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">الدورة الحالية</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{currentGoalLabel}</p>
          </div>
          <div className="text-start sm:text-end">
            <p className="text-sm text-slate-400">التقدّم الإجمالي</p>
            <p className="mt-1 text-2xl font-bold text-brand-600">{overallProgressPct}%</p>
            <div className="mt-2 h-2.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-100 sm:ms-auto sm:me-0">
              <div className="h-2.5 rounded-full bg-brand-600" style={{ width: `${overallProgressPct}%` }} />
            </div>
          </div>
        </div>
        {pendingRechargeCount > 0 ? (
          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            لديك {pendingRechargeCount} طلب شحن قيد المراجعة.
          </p>
        ) : null}
        {user?.role === "STUDENT" && !String(user?.academicLevel || "").trim() ? (
          <p className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            لم يُسجَّل مستواك الدراسي على حسابك بعد. يُرجى التواصل مع الإدارة لتحديث الملف حتى تظهر لك الدورات والدروس المناسبة لمستواك فقط.
          </p>
        ) : null}
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6" aria-label="مؤشرات لوحة التحكم">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-400">{card.label}</p>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{card.value}</p>
            <p className="mt-2 text-sm text-slate-400">{card.sub}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">إجراءات سريعة</h2>
        <p className="mt-1 text-sm text-slate-400">اختصارات للمهام الأكثر استخدامًا.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => setRechargeOpen(true)}
            className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            شحن الرصيد
          </button>
          <Link
            href="/courses"
            className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-center text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            استكشاف الدورات
          </Link>
          <Link
            href={continueLearning.href}
            className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-center text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            متابعة آخر درس
          </Link>
          <Link
            href="/profile"
            className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-center text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            الملف الشخصي
          </Link>
        </div>
        {dashboardCtaButtons.length ? (
          <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-6">
            {dashboardCtaButtons.slice(0, 4).map((row) => (
              <Link
                key={row.id}
                href={row.route}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {row.label}
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">تابع من حيث توقفت</h2>
        {continueLearning.lessonTitle ? (
          <>
            <p className="mt-3 text-sm text-slate-400">{continueLearning.packageTitle}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{continueLearning.lessonTitle}</p>
            <Link
              href={continueLearning.href}
              className="mt-6 inline-block rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              متابعة الدرس
            </Link>
          </>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
            <p className="text-sm text-slate-600">لا يوجد درس للمتابعة بعد</p>
            <Link
              href={continueLearning.href}
              className="mt-4 inline-block rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              استكشاف الدورات
            </Link>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section id="my-courses" className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">دوراتي</h2>
          <p className="mt-1 text-sm text-slate-400">التقدّم محفوظ على هذا الجهاز لكل دورة.</p>
          {!enrollmentProgress.length ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
              <p className="text-sm text-slate-600">لم تسجّل في دورة بعد</p>
              <Link
                href="/courses"
                className="mt-4 inline-block rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                استكشاف الدورات
              </Link>
            </div>
          ) : (
            <ul className="mt-6 flex flex-col gap-4">
              {enrollmentProgress.map((row) => {
                const pkgLessons = publishedLessons
                  .filter((l) => l.packageId === row.pkg.id)
                  .slice()
                  .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
                const firstLesson = pkgLessons[0];
                const continueHref = firstLesson
                  ? `/packages/${row.pkg.slug}/lesson/${firstLesson.id}`
                  : `/packages/${row.pkg.slug}`;
                return (
                  <li key={row.pkg.id} className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-bold text-slate-900">{row.pkg.title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {row.total} درس · أكملت {row.done}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-brand-600">{row.pct}%</p>
                    </div>
                    <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                      <div className="h-2.5 rounded-full bg-brand-600" style={{ width: `${row.pct}%` }} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={continueHref}
                        className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        متابعة التعلّم
                      </Link>
                      <Link
                        href={`/packages/${row.pkg.slug}`}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        تفاصيل الدورة
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">التفاعل والنقاط</h2>
          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{engagement.points}</p>
          <p className="mt-2 text-sm text-slate-400">نقاطك الإجمالية</p>
          {engagement.streak > 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              سلسلة الأيام: <span className="font-bold text-brand-600">{engagement.streak}</span>
            </p>
          ) : (
            <p className="mt-4 text-sm text-slate-500">سجّل دخولك يوميًا لبناء سلسلة أيام.</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {(engagement.badges || []).length ? (
              engagement.badges.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  {badgeLabel(b)}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-400">أكمل دروسًا لجمع النقاط والشارات.</span>
            )}
          </div>
        </section>
      </div>

      {recommendedPackages.length ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">دورات موصى بها</h2>
          <p className="mt-1 text-sm text-slate-400">اختر دورة وابدأ رحلتك.</p>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {recommendedPackages.map((pkg) => {
              const priceMad = getPackagePriceMad(pkg);
              const desc = (pkg.description || "").trim();
              const shortDesc = desc.length > 120 ? `${desc.slice(0, 120)}…` : desc || "وصف قصير للدورة.";
              return (
                <article
                  key={pkg.id}
                  className="flex flex-col rounded-2xl border border-slate-200/80 bg-slate-50/30 p-6 shadow-sm"
                >
                  <h3 className="text-base font-bold text-slate-900">{pkg.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500">{shortDesc}</p>
                  <p className="mt-4 text-lg font-bold text-brand-600">{priceMad <= 0 ? "مجانية" : formatDzd(priceMad)}</p>
                  <Link
                    href={`/packages/${pkg.slug}`}
                    className="mt-4 rounded-xl bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
                  >
                    اشترك الآن
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section id="wallet" className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">المحفظة</h2>
        <p className="mt-3 text-3xl font-bold tracking-tight text-brand-600">{formatDzd(walletBalance)}</p>
        {pendingRechargeCount > 0 ? (
          <p className="mt-2 text-sm text-amber-800">طلبات الشحن: {pendingRechargeCount} قيد المراجعة</p>
        ) : (
          <p className="mt-2 text-sm text-slate-400">لا توجد طلبات شحن معلّقة</p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            id="recharge"
            onClick={() => setRechargeOpen(true)}
            className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            شحن الرصيد
          </button>
          <Link
            href="/courses"
            className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            استكشاف الدورات
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">دروس دوراتك</h2>
        <p className="mt-1 text-sm text-slate-400">دروس متاحة في الدورات المسجّل بها.</p>
        {!upcomingFromEnrollments.length ? (
          <p className="mt-6 text-sm text-slate-500">سجّل في دورة لعرض الدروس هنا.</p>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {upcomingFromEnrollments.map((lesson) => {
              const done =
                hydrated && lesson.packageId ? getCompletedSet(lesson.packageId).has(lesson.id) : false;
              return (
                <li key={lesson.id} className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 font-semibold text-slate-900">{lesson.title}</p>
                    <span className="shrink-0 text-xs font-medium text-slate-400">{done ? "مكتمل" : "قيد التعلم"}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{lesson.course}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">سجل المحفظة</h2>
        <p className="mt-1 text-sm text-slate-400">آخر العمليات المرتبطة برصيدك.</p>
        {!myWalletTx.length ? (
          <p className="mt-6 text-sm text-slate-500">لا توجد حركات مسجّلة بعد.</p>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {myWalletTx.map((tx) => (
              <li key={tx.id} className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 text-sm">
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span className="font-semibold text-slate-900">{tx.labelAr || tx.type}</span>
                  <span className="font-mono text-xs text-slate-500 sm:text-end">
                    {tx.amount !== 0 ? formatDzdSigned(tx.amount) : "—"} · بعد العملية: {formatDzdOrDash(tx.balanceAfter)}
                  </span>
                </div>
                {tx.createdAt && hydrated ? (
                  <p className="mt-2 text-xs text-slate-400">{new Date(tx.createdAt).toLocaleString("ar-DZ")}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {(announcements || [])
        .filter((row) => row.placement === "dashboard" || row.placement === "global")
        .map((row) => (
          <p key={row.id} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {row.title}
          </p>
        ))}

      <footer className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-8">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/courses"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            عرض كل الدورات
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            الصفحة الرئيسية
          </Link>
        </div>
        <button
          type="button"
          onClick={async () => {
            await logoutSession();
            router.replace("/login");
          }}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          تسجيل الخروج
        </button>
      </footer>

      <RechargeWalletModal open={rechargeOpen} onClose={closeRechargeModal} onSuccess={loadMe} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-slate-500">
          جاري التحميل…
        </div>
      }
    >
      <DashboardPageInner />
    </Suspense>
  );
}
