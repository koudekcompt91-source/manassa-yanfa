"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useDemoSection } from "@/lib/demo-store";
import RechargeWalletModal from "@/components/student/RechargeWalletModal";
import { logoutSession } from "@/lib/admin-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDzd, formatDzdOrDash, formatDzdSigned } from "@/lib/format-money";
import { readEngagement } from "@/lib/student-progress";
import { studentSeesPackage } from "@/lib/academic-levels";
import { getPackagePriceMad } from "@/lib/wallet-ops";
import {
  Activity,
  Award,
  Bell,
  BookMarked,
  BookOpen,
  BookOpenText,
  CheckCircle2,
  ClipboardCheck,
  Feather,
  Megaphone,
  PenTool,
  Search,
  Sparkles,
  Video,
  Wallet,
  Clock3,
} from "lucide-react";

function DashboardPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [buttons] = useDemoSection("ctaButtons");
  const [announcements] = useDemoSection("announcements");
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [catalogCourses, setCatalogCourses] = useState([]);
  const [dashboardProgress, setDashboardProgress] = useState([]);
  const [dashboardProgressLoading, setDashboardProgressLoading] = useState(true);
  const [issuingCourseId, setIssuingCourseId] = useState("");
  const [overview, setOverview] = useState({
    summary: null,
    upcomingLiveSessions: [],
    pendingAssessments: [],
  });
  const [learningPaths, setLearningPaths] = useState([]);
  const [interfaceContent, setInterfaceContent] = useState({
    banners: [],
    news: [],
    announcements: [],
  });
  const [clientStorageTick, setClientStorageTick] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  const loadMe = useCallback(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then(setSessionData);
  }, []);

  const loadDashboardProgress = useCallback(() => {
    setDashboardProgressLoading(true);
    fetch("/api/progress/dashboard", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.ok || !Array.isArray(data?.courses)) {
          setDashboardProgress([]);
          return;
        }
        setDashboardProgress(data.courses);
      })
      .catch(() => setDashboardProgress([]))
      .finally(() => setDashboardProgressLoading(false));
  }, []);

  const loadCatalogCourses = useCallback(() => {
    fetch("/api/courses", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.ok || !Array.isArray(data?.courses)) {
          setCatalogCourses([]);
          return;
        }
        setCatalogCourses(data.courses);
      })
      .catch(() => setCatalogCourses([]));
  }, []);

  const loadOverview = useCallback(() => {
    fetch("/api/dashboard/overview", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.ok) {
          setOverview({ summary: null, upcomingLiveSessions: [], pendingAssessments: [] });
          return;
        }
        setOverview({
          summary: data.summary || null,
          upcomingLiveSessions: Array.isArray(data.upcomingLiveSessions) ? data.upcomingLiveSessions : [],
          pendingAssessments: Array.isArray(data.pendingAssessments) ? data.pendingAssessments : [],
        });
      })
      .catch(() => setOverview({ summary: null, upcomingLiveSessions: [], pendingAssessments: [] }));
  }, []);

  const loadLearningPaths = useCallback(() => {
    fetch("/api/learning-paths", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.ok) {
          setLearningPaths([]);
          return;
        }
        setLearningPaths(Array.isArray(data.learningPaths) ? data.learningPaths : []);
      })
      .catch(() => setLearningPaths([]));
  }, []);

  const loadInterfaceContent = useCallback(() => {
    fetch("/api/homepage/content", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.ok || !data?.content) {
          setInterfaceContent({ banners: [], news: [], announcements: [] });
          return;
        }
        setInterfaceContent({
          banners: Array.isArray(data.content.banners) ? data.content.banners : [],
          news: Array.isArray(data.content.news) ? data.content.news : [],
          announcements: Array.isArray(data.content.announcements) ? data.content.announcements : [],
        });
      })
      .catch(() => setInterfaceContent({ banners: [], news: [], announcements: [] }));
  }, []);

  const openCertificate = useCallback(
    async (row) => {
      if (!row?.slug || issuingCourseId) return;
      if (row.certificateCode) {
        router.push(`/dashboard/certificates/${encodeURIComponent(row.certificateCode)}`);
        return;
      }
      setIssuingCourseId(row.id);
      try {
        const res = await fetch(`/api/courses/${encodeURIComponent(row.slug)}/certificate`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.ok && data?.certificate?.certificateCode) {
          router.push(`/dashboard/certificates/${encodeURIComponent(data.certificate.certificateCode)}`);
          return;
        }
        await loadDashboardProgress();
      } finally {
        setIssuingCourseId("");
      }
    },
    [issuingCourseId, loadDashboardProgress, router]
  );

  useEffect(() => {
    loadMe();
    loadCatalogCourses();
    loadDashboardProgress();
    loadOverview();
    loadLearningPaths();
    loadInterfaceContent();
  }, [loadMe, loadCatalogCourses, loadDashboardProgress, loadOverview, loadLearningPaths, loadInterfaceContent]);

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
  const displayName = user?.fullName?.trim() || user?.email || "طالب yanfa3 Education";
  const displayEmail = user?.email || "";
  const studentLevel = (user?.role === "STUDENT" ? String(user?.academicLevel || "").trim() : "") || "";
  const studentLevelCode = user?.role === "STUDENT" ? String(user?.level || "").trim() : "";

  const walletBalance = useMemo(() => {
    const w = Number(user?.walletBalance);
    return Number.isFinite(w) && w >= 0 ? Math.round(w) : 0;
  }, [user]);

  const publishedPackages = useMemo(() => {
    const list = (catalogCourses || []).filter((row) => row.isPublished);
    if (user?.role !== "STUDENT") return list;
    return list.filter((row) => studentSeesPackage(studentLevel || null, row, studentLevelCode || null));
  }, [catalogCourses, studentLevel, studentLevelCode, user?.role]);

  const myEnrollments = sessionData?.enrollments || [];
  const enrolledPackageIds = useMemo(() => new Set(myEnrollments.map((e) => e.packageId)), [myEnrollments]);

  const enrolledCourses = myEnrollments.length;

  const continueLearning = useMemo(() => {
    const recent = (dashboardProgress || [])
      .filter((row) => row?.slug)
      .slice()
      .sort((a, b) => {
        const at = a?.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
        const bt = b?.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
        return bt - at;
      })[0];
    if (recent?.slug && recent?.lastLessonId) {
      return {
        href: `/packages/${recent.slug}/lesson/${recent.lastLessonId}`,
        lessonTitle: (recent.lastLessonTitle || "آخر درس").trim(),
        packageTitle: (recent.title || "").trim(),
      };
    }
    if (recent?.slug) {
      return {
        href: `/packages/${recent.slug}`,
        lessonTitle: "",
        packageTitle: (recent.title || "").trim(),
      };
    }

    if (!publishedPackages.length || !enrolledPackageIds.size) {
      return { href: "/courses", lessonTitle: "", packageTitle: "" };
    }
    const firstEnrollment = myEnrollments[0];
    const pkg = publishedPackages.find((p) => p.id === firstEnrollment?.packageId);
    if (!pkg?.slug) return { href: "/courses", lessonTitle: "", packageTitle: "" };
    return {
      href: `/packages/${pkg.slug}`,
      lessonTitle: "",
      packageTitle: (pkg.title || "").trim(),
    };
  }, [dashboardProgress, myEnrollments, publishedPackages, enrolledPackageIds]);

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

  const dashboardCtaButtons = useMemo(
    () => (buttons || []).filter((row) => row.placement === "dashboard" && row.visible),
    [buttons]
  );

  const dashboardNews = useMemo(() => {
    if (interfaceContent.news.length) return interfaceContent.news.slice(0, 4);
    return (announcements || []).filter((row) => row.placement === "dashboard" || row.placement === "global").slice(0, 4);
  }, [announcements, interfaceContent.news]);

  const dashboardAnnouncements = useMemo(() => {
    if (interfaceContent.announcements.length) return interfaceContent.announcements;
    return (announcements || []).filter((row) => row.placement === "dashboard" || row.placement === "global");
  }, [announcements, interfaceContent.announcements]);

  const heroBanner = interfaceContent.banners[0] || null;

  const subjectCards = useMemo(() => {
    return (learningPaths || []).slice(0, 6).map((row, index) => ({
      id: row.id || `lp-${index}`,
      title: row.title || "مسار تعليمي",
      slug: row.slug || "",
      color: row.color || "",
    }));
  }, [learningPaths]);

  const packageMetaById = useMemo(() => {
    const map = new Map();
    (publishedPackages || []).forEach((pkg) => {
      map.set(pkg.id, {
        accessType: pkg.accessType,
        priceMad: getPackagePriceMad(pkg),
      });
    });
    return map;
  }, [publishedPackages]);

  const recentActivityRows = useMemo(() => {
    const rows = [];
    const recentCourse = (dashboardProgress || [])
      .filter((row) => row?.title)
      .slice()
      .sort((a, b) => {
        const at = a?.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
        const bt = b?.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
        return bt - at;
      })[0];
    if (recentCourse) {
      rows.push({
        label: "آخر دورة",
        value: recentCourse.title,
      });
    }
    if (continueLearning.lessonTitle) {
      rows.push({
        label: "آخر درس",
        value: continueLearning.lessonTitle,
      });
    }
    if (overview.pendingAssessments?.[0]?.title) {
      rows.push({
        label: "آخر تقييم",
        value: overview.pendingAssessments[0].title,
      });
    }
    if ((overview.summary?.certificatesAvailable ?? 0) > 0) {
      rows.push({
        label: "الشهادات",
        value: `${overview.summary?.certificatesAvailable ?? 0} شهادة`,
      });
    }
    return rows.slice(0, 4);
  }, [continueLearning.lessonTitle, dashboardProgress, overview.pendingAssessments, overview.summary?.certificatesAvailable]);

  const engagement = useMemo(() => {
    if (!hydrated) return { points: 0, streak: 0, lastLogin: null, badges: [] };
    return readEngagement();
  }, [hydrated, clientStorageTick]);

  const overallProgressPct = useMemo(() => {
    const source = dashboardProgress.map((r) => Number(r?.progressPercent) || 0);
    if (!source.length) return 0;
    const sum = source.reduce((acc, r) => acc + r, 0);
    return Math.min(100, Math.round(sum / source.length));
  }, [dashboardProgress]);

  const currentGoalLabel = useMemo(() => {
    if (continueLearning.packageTitle) return continueLearning.packageTitle;
    const first = dashboardProgress[0];
    if (first?.title) return first.title;
    return "ابدأ من استكشاف الدورات";
  }, [continueLearning.packageTitle, dashboardProgress]);

  const badgeLabel = (id) => {
    if (id === "streak-3") return "سلسلة 3 أيام";
    if (id === "streak-7") return "أسبوع متواصل";
    if (id === "points-50") return "50 نقطة";
    if (id === "points-150") return "150 نقطة";
    return id;
  };

  const pathIconFor = (path) => {
    const key = `${String(path?.slug || "")} ${String(path?.title || "")}`.toLowerCase();
    if (key.includes("نحو") || key.includes("صرف")) return PenTool;
    if (key.includes("بلاغة")) return Sparkles;
    if (key.includes("شعر")) return Feather;
    if (key.includes("قديم")) return BookMarked;
    if (key.includes("حديث")) return BookOpenText;
    if (key.includes("نقد")) return Search;
    return BookOpen;
  };

  const statCards = [
    { label: "شهاداتي", value: overview.summary?.certificatesAvailable ?? 0, sub: "شهادة", Icon: Award },
    { label: "قيد التقدم", value: overview.summary?.inProgressCourses ?? 0, sub: "دورة", Icon: Activity },
    { label: "دورات مكتملة", value: overview.summary?.completedCourses ?? 0, sub: "مكتملة", Icon: CheckCircle2 },
    { label: "دوراتي", value: overview.summary?.myCourses ?? enrolledCourses, sub: "دورة", Icon: BookOpen },
    { label: "الرصيد", value: formatDzd(walletBalance), sub: "دج", Icon: Wallet },
    { label: "واجبات قيد الانتظار", value: overview.summary?.pendingAssessments ?? 0, sub: "تقييم", Icon: ClipboardCheck },
    { label: "إشعارات غير مقروءة", value: overview.summary?.unreadNotifications ?? 0, sub: "إشعار", Icon: Bell },
    { label: "الحصص القادمة", value: overview.summary?.upcomingLiveSessions ?? 0, sub: "حصة", Icon: Video },
  ];

  const kpiIconWrapClasses = [
    "bg-violet-50 text-violet-700 ring-violet-100",
    "bg-sky-50 text-sky-700 ring-sky-100",
    "bg-emerald-50 text-emerald-700 ring-emerald-100",
    "bg-brand-50 text-brand-700 ring-brand-100",
    "bg-amber-50 text-amber-800 ring-amber-100",
    "bg-orange-50 text-orange-800 ring-orange-100",
    "bg-rose-50 text-rose-700 ring-rose-100",
    "bg-indigo-50 text-indigo-700 ring-indigo-100",
  ];

  const panelClass = "dashboard-panel p-6 sm:p-8";
  const panelCompactClass = "dashboard-panel p-5";
  const softItemClass = "dashboard-soft-list-item p-3";

  return (
    <div className="soft-grid-bg premium-app-bg flex w-full flex-col gap-6 sm:gap-8">
      <header className="dashboard-welcome interactive-card p-6 sm:p-8">
        <div className="dashboard-welcome-blob-1" aria-hidden />
        <div className="dashboard-welcome-blob-2" aria-hidden />
        <div className="relative z-[1] flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-brand-200/80 bg-brand-50/95 px-3 py-1 text-xs font-extrabold text-brand-800 ring-1 ring-brand-100/70">
                منصة ينفع
              </span>
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl md:text-[2rem] md:leading-tight">مرحبًا، {displayName}</h1>
            {displayEmail ? (
              <p className="mt-2 text-sm text-slate-500" dir="ltr">
                {displayEmail}
              </p>
            ) : null}
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">واصل تعلمك وتابع تقدمك في الدورات.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={continueLearning.href} className="touch-button-primary magnetic-button no-underline">
                <BookOpen className="h-4 w-4" />
                واصل التعلم
              </Link>
              <Link href="/courses" className="touch-button-secondary magnetic-button no-underline">
                <BookOpen className="h-4 w-4" />
                تصفح الدورات
              </Link>
            </div>
            {pendingRechargeCount > 0 ? (
              <p className="mt-6 rounded-xl border border-amber-200/80 bg-amber-50/95 px-4 py-3 text-sm text-amber-950">
                لديك {pendingRechargeCount} طلب شحن قيد المراجعة.
              </p>
            ) : null}
            {user?.role === "STUDENT" && !String(user?.academicLevel || "").trim() ? (
              <p className="mt-4 rounded-xl border border-sky-200/80 bg-sky-50/95 px-4 py-3 text-sm text-sky-950">
                لم يُسجَّل مستواك الدراسي على حسابك بعد. يُرجى التواصل مع الإدارة لتحديث الملف حتى تظهر لك الدورات والدروس المناسبة لمستواك فقط.
              </p>
            ) : null}
          </div>
          <div className="flex w-full flex-col justify-center rounded-2xl border border-slate-200/85 bg-white/75 p-5 shadow-[0_16px_44px_-26px_rgba(15,23,42,0.28)] backdrop-blur-md lg:max-w-md lg:flex-none">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">الدورة الحالية</p>
            <p className="mt-2 text-lg font-extrabold leading-snug text-slate-900">{currentGoalLabel}</p>
            <div className="mt-5">
              <p className="text-xs font-semibold text-slate-500">التقدّم الإجمالي</p>
              <p className="mt-1 text-3xl font-black tabular-nums text-brand-600">{overallProgressPct}%</p>
            </div>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-200/85 ring-1 ring-slate-200/60">
              <div
                className="h-3 rounded-full bg-gradient-to-l from-brand-500 via-indigo-500 to-violet-500 transition-[width] duration-500 ease-out motion-reduce:transition-none"
                style={{ width: `${overallProgressPct}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4 xl:gap-6" aria-label="مؤشرات لوحة التحكم">
        {statCards.map((card, idx) => (
          <div key={card.label} className="dashboard-kpi">
            <div className="dashboard-kpi-content">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-500">{card.label}</p>
                <span
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${kpiIconWrapClasses[idx % kpiIconWrapClasses.length]}`}
                >
                  <card.Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-auto pt-4 text-2xl font-black tracking-tight text-slate-900 tabular-nums">{card.value}</p>
              <p className="mt-1 text-sm text-slate-400">{card.sub}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_1fr]">
        <div className="space-y-6">
          <article className="dashboard-cta interactive-card p-6 sm:p-8">
            <div className="pointer-events-none absolute -start-16 top-0 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -end-10 bottom-0 h-44 w-44 rounded-full bg-indigo-300/20 blur-3xl" aria-hidden />
            <p className="relative z-[1] text-sm font-semibold text-slate-200">منصة ينفع لتعلّم الأدب العربي</p>
            <h2 className="relative z-[1] mt-2 text-2xl font-black sm:text-3xl">{heroBanner?.title || "رحلة تعليمية منظمة وحديثة"}</h2>
            <p className="relative z-[1] mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">
              {heroBanner?.subtitle || "دروس مسجلة، حصص مباشرة، اختبارات، متابعة للتقدم وشهادات إتمام."}
            </p>
            <div className="relative z-[1] mt-5 flex flex-wrap gap-2">
              {heroBanner?.buttonText && heroBanner?.buttonUrl ? (
                <Link href={heroBanner.buttonUrl} className="touch-button-primary magnetic-button border border-white/20 bg-white text-slate-900 no-underline hover:bg-slate-100">
                  <BookOpen className="h-4 w-4" />
                  {heroBanner.buttonText}
                </Link>
              ) : null}
              <Link href={continueLearning.href} className="touch-button-primary magnetic-button border border-white/20 bg-white text-slate-900 no-underline hover:bg-slate-100">
                <BookOpen className="h-4 w-4" />
                واصل التعلم
              </Link>
              <Link href="/courses" className="touch-button-secondary magnetic-button border-white/25 bg-white/10 text-white hover:bg-white/15 no-underline">
                <BookOpen className="h-4 w-4" />
                استكشف الدورات
              </Link>
            </div>
          </article>

          <article className={panelClass}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <BookMarked className="h-5 w-5 text-brand-600" />
                <span>المسارات التعليمية</span>
              </h3>
              <Link href="/courses" className="text-xs font-bold text-brand-700 underline">
                عرض الدورات
              </Link>
            </div>
            {!subjectCards.length ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm text-slate-500">
                لا توجد مسارات تعليمية حاليًا
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {subjectCards.map((path, idx) => (
                  <Link
                    key={path.id || `${path.title}-${idx}`}
                    href={path.slug ? `/courses?path=${encodeURIComponent(path.slug)}` : "/courses"}
                    className="dashboard-soft-list-item p-3 text-sm font-bold text-slate-800 no-underline"
                    style={path.color ? { boxShadow: `inset 0 0 0 1px ${path.color}33` } : undefined}
                  >
                    {(() => {
                      const Icon = pathIconFor(path);
                      return (
                        <span className="flex items-center gap-1.5">
                          <Icon className="h-4 w-4 text-brand-600" />
                          <span>{path.title}</span>
                        </span>
                      );
                    })()}
                  </Link>
                ))}
              </div>
            )}
          </article>
        </div>

        <div className="space-y-4">
          <article id="wallet" className="dashboard-wallet pressable p-5 sm:p-6">
            <div className="relative z-[1] flex items-start justify-between gap-2">
              <div>
                <p className="flex items-center gap-1 text-xs font-semibold text-white/85">
                  <Wallet className="h-3.5 w-3.5" />
                  <span>رصيد المحفظة</span>
                </p>
                <p className="mt-2 text-3xl font-black tabular-nums tracking-tight sm:text-[2rem]">{formatDzd(walletBalance)}</p>
                <p className="mt-1 text-xs text-white/80">
                  {pendingRechargeCount > 0 ? `طلبات قيد المراجعة: ${pendingRechargeCount}` : "لا توجد طلبات شحن معلقة"}
                </p>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/18 text-white shadow-inner ring-1 ring-white/25" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </span>
            </div>
            <button type="button" onClick={() => setRechargeOpen(true)} className="relative z-[1] touch-button magnetic-button mt-4 w-full bg-white text-brand-700 shadow-[0_10px_28px_-12px_rgba(15,23,42,0.35)] hover:bg-slate-50">
              <Wallet className="h-4 w-4" />
              شحن المحفظة
            </button>
          </article>

          <article className={panelCompactClass}>
            <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
              <Megaphone className="h-4.5 w-4.5 text-brand-600" />
              <span>أحدث الأخبار</span>
            </h3>
            {!dashboardNews.length ? (
              <p className="mt-3 text-sm text-slate-500">لا توجد أخبار حاليًا</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {dashboardNews.map((row) => (
                  <li key={row.id} className="dashboard-soft-list-item px-3 py-2 text-sm text-slate-700">
                    <p className="font-semibold text-slate-800">{row.title}</p>
                    {row.summary ? <p className="mt-1 text-xs text-slate-500">{row.summary}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className={panelCompactClass}>
            <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
              <Clock3 className="h-4.5 w-4.5 text-brand-600" />
              <span>النشاط الأخير</span>
            </h3>
            {!recentActivityRows.length ? (
              <p className="mt-3 text-sm text-slate-500">لا يوجد نشاط حديث حتى الآن</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {recentActivityRows.map((item, idx) => (
                  <li key={`${item.label}-${idx}`} className="dashboard-soft-list-item px-3 py-2">
                    <p className="text-[11px] font-semibold text-slate-500">{item.label}</p>
                    <p className="text-sm font-bold text-slate-800">{item.value}</p>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className={panelCompactClass}>
            <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
              <Activity className="h-4.5 w-4.5 text-brand-600" />
              <span>إجراءات سريعة</span>
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href="/courses" className="touch-button-secondary justify-center text-center"><BookOpen className="h-4 w-4" />استكشف الدورات</Link>
              <Link href="/dashboard#wallet" className="touch-button-secondary justify-center text-center"><Wallet className="h-4 w-4" />المحفظة</Link>
              <Link href="/dashboard/certificates" className="touch-button-secondary justify-center text-center"><Award className="h-4 w-4" />شهاداتي</Link>
              <Link href="/dashboard/notifications" className="touch-button-secondary justify-center text-center"><Bell className="h-4 w-4" />الإشعارات</Link>
            </div>
            {dashboardCtaButtons.length ? (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <div className="flex flex-wrap gap-2">
                  {dashboardCtaButtons.slice(0, 2).map((row) => (
                    <Link key={row.id} href={row.route} className="touch-button-secondary px-3 py-2 text-xs">
                      {row.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </article>
        </div>
      </section>

      <section className={panelClass}>
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">واصل من حيث توقفت</h2>
        {continueLearning.lessonTitle ? (
          <>
            <p className="mt-3 text-sm text-slate-400">{continueLearning.packageTitle}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{continueLearning.lessonTitle}</p>
            <Link
              href={continueLearning.href}
              className="touch-button-primary mt-6"
            >
              واصل التعلم
            </Link>
          </>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
            <p className="text-sm text-slate-600">ابدأ أول دورة لك الآن</p>
            <Link
              href={continueLearning.href}
              className="touch-button-secondary mt-4"
            >
              استكشف الدورات
            </Link>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section id="my-courses" className={panelClass}>
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">دوراتي</h2>
          <p className="mt-1 text-sm text-slate-400">متابعة التقدم في كل دورة بشكل مباشر.</p>
          {dashboardProgressLoading ? (
            <p className="mt-6 text-sm text-slate-500">جاري تحميل تقدم الدورات...</p>
          ) : !dashboardProgress.length ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
              <p className="text-sm text-slate-600">لم تشترك في أي دورة بعد</p>
              <Link
                href="/courses"
                className="touch-button-primary mt-4"
              >
                استكشف الدورات
              </Link>
            </div>
          ) : (
            <ul className="mt-6 flex flex-col gap-4">
              {dashboardProgress.map((row) => {
                const continueHref = row.lastLessonId
                  ? `/packages/${row.slug}/lesson/${row.lastLessonId}`
                  : `/packages/${row.slug}`;
                const packageMeta = packageMetaById.get(row.id);
                const isPaidCourse = (packageMeta?.accessType === "PAID") || Number(packageMeta?.priceMad || 0) > 0;
                return (
                  <li key={row.id} className="dashboard-soft-list-item p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="dashboard-soft-list-item h-14 w-20 overflow-hidden rounded-lg bg-gradient-to-br from-brand-100 to-indigo-100">
                        {row.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={row.coverImage} alt={row.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs font-bold text-brand-700">الدورات</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-bold text-slate-900">{row.title}</p>
                        {row.isCompleted ? <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800"><CheckCircle2 className="h-3.5 w-3.5" />مكتملة</p> : null}
                        {!row.isCompleted && row.progressPercent > 0 ? <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-800"><Activity className="h-3.5 w-3.5" />قيد التقدم</p> : null}
                        <p className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${isPaidCourse ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-800"}`}>
                          <Wallet className="h-3.5 w-3.5" />
                          {isPaidCourse ? "مدفوعة" : "مجانية"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">الأستاذ: يوسف مادن</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {row.totalLessons} درس · أكملت {row.completedLessons}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">آخر درس: {row.lastLessonTitle || "غير محدد بعد"}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          آخر نشاط: {row.lastActivityAt ? new Date(row.lastActivityAt).toLocaleString("ar-DZ") : "لا يوجد نشاط بعد"}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-brand-600">{row.progressPercent}%</p>
                    </div>
                    <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                      <div className="h-2.5 rounded-full bg-brand-600 transition-[width] duration-500" style={{ width: `${row.progressPercent}%` }} />
                    </div>
                    {row.isCompleted ? <p className="mt-2 text-xs font-bold text-emerald-700">أكملت هذه الدورة بنجاح</p> : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={continueHref}
                        className="touch-button-secondary border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
                      >
                        واصل التعلم
                      </Link>
                      <Link
                        href={`/packages/${row.slug}`}
                        className="touch-button-secondary"
                      >
                        عرض الدورة
                      </Link>
                      {row.isCompleted ? (
                        <button
                          type="button"
                          onClick={() => void openCertificate(row)}
                          disabled={issuingCourseId === row.id}
                          className="touch-button-secondary certificate-shine border-emerald-200 bg-emerald-50 text-emerald-800"
                        >
                          {issuingCourseId === row.id ? "جاري تجهيز الشهادة..." : "عرض الشهادة"}
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className={panelClass}>
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">الحصص القادمة والواجبات</h2>
          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-700">الحصص المباشرة القادمة</p>
            {!overview.upcomingLiveSessions.length ? (
              <p className="mt-2 text-sm text-slate-500">لا توجد حصص مباشرة قادمة حاليًا.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {overview.upcomingLiveSessions.slice(0, 4).map((row) => (
                  <li key={row.id} className={`${softItemClass} text-sm`}>
                    <p className="font-semibold text-slate-900">{row.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.courseTitle}</p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(row.startsAt).toLocaleString("ar-DZ")}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${row.status === "LIVE" ? "bg-emerald-100 text-emerald-700 badge-live-pulse" : "bg-brand-100 text-brand-700"}`}>
                        <Video className="h-3.5 w-3.5" />
                        {row.status === "LIVE" ? "مباشر الآن" : "قادمة"}
                      </span>
                      <Link href={`/packages/${row.courseSlug}?tab=live`} className="text-xs font-bold text-brand-700 underline">
                        {row.status === "LIVE" ? "انضم إلى الحصة" : "عرض التفاصيل"}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-sm font-semibold text-slate-700">واجبات قيد الانتظار</p>
            {!overview.pendingAssessments.length ? (
              <p className="mt-2 text-sm text-slate-500">لا توجد واجبات أو اختبارات معلّقة.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {overview.pendingAssessments.slice(0, 4).map((row) => (
                  <li key={row.id} className={`${softItemClass} text-sm`}>
                    <p className="font-semibold text-slate-900">{row.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.courseTitle}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.dueDate ? `الموعد: ${new Date(row.dueDate).toLocaleString("ar-DZ")}` : "بدون موعد محدد"}</p>
                    <Link href={`/packages/${row.courseSlug}?tab=assessments`} className="mt-2 inline-block text-xs font-bold text-brand-700 underline">
                      حل الآن
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-sm font-semibold text-slate-700">التفاعل والنقاط</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{engagement.points}</p>
            {engagement.streak > 0 ? (
              <p className="mt-2 text-sm text-slate-600">
                سلسلة الأيام: <span className="font-bold text-brand-600">{engagement.streak}</span>
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">سجّل دخولك يوميًا لبناء سلسلة أيام.</p>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
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

      <section className={panelClass}>
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">دورات موصى بها</h2>
        <p className="mt-1 text-sm text-slate-400">اختر دورة وابدأ رحلتك.</p>
        {recommendedPackages.length ? (
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {recommendedPackages.map((pkg) => {
              const priceMad = getPackagePriceMad(pkg);
              const desc = (pkg.description || "").trim();
              const shortDesc = desc.length > 120 ? `${desc.slice(0, 120)}…` : desc || "وصف قصير للدورة.";
              return (
                <article
                  key={pkg.id}
                  className="dashboard-panel flex flex-col p-6"
                >
                  <h3 className="text-base font-bold text-slate-900">{pkg.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500">{shortDesc}</p>
                  <p className="mt-4 text-lg font-bold text-brand-600">{priceMad <= 0 ? "مجانية" : formatDzd(priceMad)}</p>
                  <Link
                    href={`/packages/${pkg.slug}`}
                    className="touch-button-primary mt-4 text-center"
                  >
                    اشترك الآن
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
            <p className="text-sm text-slate-600">لا توجد دورات موصى بها حاليًا</p>
            <Link href="/courses" className="touch-button-secondary mt-4">
              استكشف الدورات
            </Link>
          </div>
        )}
      </section>

      <section id="wallet-details" className={panelClass}>
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
            className="touch-button-primary px-5"
          >
            شحن الرصيد
          </button>
          <Link
            href="/courses"
            className="touch-button-secondary px-5"
          >
            استكشاف الدورات
          </Link>
        </div>
      </section>

      <section className={panelClass}>
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">دروس دوراتك</h2>
        <p className="mt-1 text-sm text-slate-400">دروس متاحة في الدورات المسجّل بها.</p>
        {!dashboardProgress.length ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
            <p className="text-sm text-slate-600">لم تشترك في أي دورة بعد</p>
            <Link href="/courses" className="touch-button-secondary mt-4">
              استكشف الدورات
            </Link>
          </div>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {dashboardProgress.slice(0, 4).map((row) => {
              const continueHref = row.lastLessonId
                ? `/packages/${row.slug}/lesson/${row.lastLessonId}`
                : `/packages/${row.slug}`;
              return (
                <li key={row.id} className="dashboard-soft-list-item p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 font-semibold text-slate-900">{row.lastLessonTitle || row.title}</p>
                    <span className="shrink-0 text-xs font-medium text-slate-400">{row.progressPercent || 0}%</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{row.title}</p>
                  <Link href={continueHref} className="mt-2 inline-block text-xs font-bold text-brand-700 underline">
                    واصل التعلم
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className={panelClass}>
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">سجل المحفظة</h2>
        <p className="mt-1 text-sm text-slate-400">آخر العمليات المرتبطة برصيدك.</p>
        {!myWalletTx.length ? (
          <p className="mt-6 text-sm text-slate-500">لا توجد حركات مسجّلة بعد.</p>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {myWalletTx.map((tx) => (
              <li key={tx.id} className="dashboard-soft-list-item p-4 text-sm">
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

      {dashboardAnnouncements.map((row) => (
        <div key={row.id} className={`rounded-xl border px-4 py-3 text-sm ${
          row.type === "SUCCESS"
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : row.type === "WARNING" || row.type === "URGENT"
            ? "border-amber-200 bg-amber-50 text-amber-900"
            : "border-sky-200 bg-sky-50 text-sky-900"
        }`}>
          <p className="font-semibold">{row.title}</p>
          {row.message ? <p className="mt-1 text-xs opacity-90">{row.message}</p> : null}
          {row.link ? (
            <Link href={row.link} className="mt-2 inline-block text-xs font-bold underline">
              عرض التفاصيل
            </Link>
          ) : null}
        </div>
      ))}

      <footer className="dashboard-panel flex flex-col gap-4 p-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-8">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/courses"
            className="touch-button-secondary"
          >
            عرض كل الدورات
          </Link>
          <Link
            href="/"
            className="touch-button-secondary"
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
          className="touch-button-secondary"
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
