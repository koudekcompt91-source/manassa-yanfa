"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useDemoSection } from "@/lib/demo-store";
import { isLessonPublished, normalizeLessonAccessType } from "@/lib/lesson-utils";
import { getPackagePriceMad } from "@/lib/wallet-ops";
import { studentSeesLesson, studentSeesPackage } from "@/lib/academic-levels";
import { formatDzd } from "@/lib/format-money";
import { getCompletedSet, getPackageProgressStats } from "@/lib/student-progress";

const FAQ_ITEMS = [
  {
    q: "كيف أشترك في الدورة؟",
    a: "سجّل دخولك كطالب، تأكد من رصيدك إن كانت الدورة مدفوعة، ثم اضغط «الدفع من الرصيد» أو «اشترك الآن». يتم التفعيل فور نجاح العملية.",
  },
  {
    q: "هل يمكنني معاينة المحتوى قبل الشراء؟",
    a: "إن وُجدت دروس مجانية ضمن الدورة يمكنك فتحها مباشرة. الدروس المميزة تُفتح بالكامل بعد الاشتراك دون تعطيل صفحة الدورة.",
  },
  {
    q: "ماذا لو كان رصيدي غير كافٍ؟",
    a: "يمكنك شحن المحفظة من لوحة التحكم، ثم العودة لإتمام الشراء. الرصيد يُخصم مرة واحدة عند التسجيل في الدورة.",
  },
  {
    q: "هل أستطيع المتابعة من الجوال؟",
    a: "نعم، المنصة مصممة لتعمل على مختلف الأجهزة لتتابع دروسك في أي وقت.",
  },
  {
    q: "ماذا بعد الاشتراك؟",
    a: "يصبح لديك وصول إلى جميع الدروس المنشورة ضمن الدورة، بما فيها الدروس المميزة، ويمكنك تتبع تقدمك من لوحة الطالب.",
  },
];

export default function PackageDetailsPage() {
  const params = useParams();
  const rawSlug = String(params?.slug || params?.id || "");
  const normalizedSlug = decodeURIComponent(rawSlug).trim();
  const [packages] = useDemoSection("packages");
  const [categories] = useDemoSection("categories");
  const [teachers] = useDemoSection("teachers");
  const [lessons] = useDemoSection("lessons");
  /** Flash after purchase attempt — never rely on localStorage for money / enrollment. */
  const [purchaseFlash, setPurchaseFlash] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [meState, setMeState] = useState(null);
  const [storageTick, setStorageTick] = useState(0);

  const loadMe = useCallback(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then(setMeState);
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
  const walletBalance = useMemo(() => {
    const w = Number(meState?.user?.walletBalance);
    return Number.isFinite(w) && w >= 0 ? Math.round(w) : 0;
  }, [meState]);

  const enrolled = useMemo(
    () => !!pkg && (meState?.enrollments || []).some((e) => e.packageId === pkg.id),
    [meState, pkg]
  );

  const studentLevel = authedStudent ? String(meState?.user?.academicLevel || "").trim() : "";
  const studentLevelCode = authedStudent ? String(meState?.user?.level || "").trim() : "";

  const priceMad = useMemo(() => (pkg ? getPackagePriceMad(pkg) : 0), [pkg]);
  const categoryName = useMemo(() => (categories || []).find((row) => row.id === pkg?.categoryId)?.name || "-", [categories, pkg]);
  const teacherName = useMemo(() => (teachers || []).find((row) => row.id === pkg?.teacherId)?.name || "طاقم منصة ينفع", [teachers, pkg]);
  const packageLessons = useMemo(() => {
    const list = (lessons || [])
      .filter((row) => row.packageId === pkg?.id && isLessonPublished(row))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    if (!authedStudent) return list;
    return list.filter((row) => studentSeesLesson(studentLevel || null, row, packages || [], studentLevelCode || null));
  }, [lessons, pkg, packages, authedStudent, studentLevel, studentLevelCode]);

  const freeLessonCount = useMemo(
    () => packageLessons.filter((l) => normalizeLessonAccessType(l) === "free").length,
    [packageLessons]
  );
  const premiumLessonCount = useMemo(() => packageLessons.length - freeLessonCount, [packageLessons, freeLessonCount]);

  const lessonIdsOrdered = useMemo(() => packageLessons.map((l) => l.id), [packageLessons]);
  const progressStats = useMemo(
    () => getPackageProgressStats(pkg?.id, lessonIdsOrdered),
    [pkg?.id, lessonIdsOrdered, storageTick]
  );

  const heroSubtitle = useMemo(() => {
    const d = (pkg?.description || "").trim();
    if (d.length > 140) return `${d.slice(0, 140)}…`;
    if (d.length > 20) return d;
    return `مسار تعلّمي منظم في ${categoryName} مع الأستاذ ${teacherName} — دروس واضحة وتقدم يُقاس خطوة بخطوة.`;
  }, [pkg?.description, categoryName, teacherName]);

  const learningOutcomes = useMemo(() => {
    const raw = pkg?.learningOutcomes;
    if (Array.isArray(raw) && raw.length) return raw.map(String).filter(Boolean).slice(0, 6);
    if (typeof raw === "string" && raw.trim()) {
      return raw
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 6);
    }
    const fromDesc = (pkg?.description || "")
      .split(/[.\n؟!]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15);
    if (fromDesc.length >= 3) return fromDesc.slice(0, 5);
    return [
      `تأسيس قوي في محاور ${categoryName} مع أمثلة من النصوص الأدبية.`,
      "فهم منهجي للدروس مع تلخيص وتمارين تدريجية.",
      "متابعة مع أستاذ متخصص وإيقاع تعلّم يناسب المستويات المختلفة.",
      "إمكانية إكمال الوحدات بوتيرتك مع تتبع التقدم.",
    ];
  }, [pkg, categoryName]);

  const isPaidPackage = priceMad > 0;
  const accessLabel = isPaidPackage ? "دورة مدفوعة" : "دورة مجانية";
  const previewLabel =
    freeLessonCount > 0
      ? `نعم — ${freeLessonCount} ${freeLessonCount === 1 ? "درس معاينة مجاني" : "دروس معاينة مجانية"}`
      : premiumLessonCount > 0
        ? "المعاينة عبر صفحات الدروس؛ المحتوى الكامل بعد الاشتراك"
        : "جميع الدروس المنشورة متاحة ضمن الدورة";

  const firstLessonHref = packageLessons[0] ? `/packages/${pkg.slug}/lesson/${packageLessons[0].id}` : `/packages/${pkg.slug}`;

  const handleFreeEnroll = useCallback(async () => {
    if (!pkg?.id || purchasing) return;
    setPurchaseFlash(null);
    setPurchasing(true);
    try {
      const res = await fetch("/api/wallet/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ packageId: pkg.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setPurchaseFlash({ kind: "success", message: "تم التسجيل في الدورة بنجاح." });
        await loadMe();
      } else if (data.code === "already_enrolled") {
        setPurchaseFlash({ kind: "success", message: "أنت مسجّل في هذه الدورة مسبقًا." });
        await loadMe();
      } else {
        setPurchaseFlash({ kind: "error", message: data.message || "تعذّر التسجيل." });
      }
    } finally {
      setPurchasing(false);
    }
  }, [pkg?.id, loadMe, purchasing]);

  const handleWalletPurchase = useCallback(async () => {
    if (!pkg?.id || purchasing) return;
    if (walletBalance < priceMad) {
      setPurchaseFlash({ kind: "error", message: "رصيدك غير كافٍ" });
      return;
    }
    setPurchaseFlash(null);
    setPurchasing(true);
    try {
      const res = await fetch("/api/wallet/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ packageId: pkg.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setPurchaseFlash({
          kind: "success",
          message: "تم شراء الدورة بنجاح. تم خصم المبلغ من محفظتك وتفعيل الوصول إلى الدروس.",
        });
        await loadMe();
      } else if (data.code === "insufficient") {
        setPurchaseFlash({ kind: "error", message: "رصيدك غير كافٍ" });
      } else if (data.code === "already_enrolled") {
        setPurchaseFlash({ kind: "success", message: "أنت مسجّل في هذه الدورة مسبقًا — لم يُخصم رصيد جديد." });
        await loadMe();
      } else {
        setPurchaseFlash({ kind: "error", message: data.message || "تعذّر إتمام الشراء." });
      }
    } finally {
      setPurchasing(false);
    }
  }, [pkg?.id, loadMe, purchasing, walletBalance, priceMad]);

  const scrollToPurchase = useCallback(() => {
    document.getElementById("purchase")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const isPublished = pkg?.isPublished === true || pkg?.isPublished === "published" || pkg?.status === "published";

  const levelBlocked =
    authedStudent && !!pkg && !enrolled && !studentSeesPackage(studentLevel || null, pkg, studentLevelCode || null);

  if (!pkg || !isPublished) {
    return <section className="container-page py-10 text-center text-slate-600">الدورة غير متاحة حاليًا.</section>;
  }

  if (levelBlocked) {
    return (
      <section className="container-page py-16 text-center text-slate-700">
        <h1 className="text-xl font-bold text-slate-900">هذه الدورة لا تخص مستواك الدراسي</h1>
        <p className="mt-2 text-sm">مستواك الحالي: {studentLevel}</p>
        <p className="mt-1 text-sm text-slate-500">تظهر لك فقط الدورات والدروس الموجّهة لسنتك الدراسية.</p>
        <Link href="/courses" className="mt-6 inline-block text-sm font-bold text-brand-700 underline">
          العودة إلى قائمة الدورات
        </Link>
      </section>
    );
  }

  const renderPurchaseBlock = () => (
    <div id="purchase" className="scroll-mt-24">
      <h2 className="text-lg font-extrabold text-slate-900">الشراء والتسجيل</h2>
      {!authedStudent ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold">سجّل دخولك كطالب للمتابعة</p>
          <p className="mt-1">للتسجيل في الدورة أو الشراء من الرصيد، سجّل الدخول أولًا.</p>
          <Link href="/login" className="mt-2 inline-block text-sm font-bold text-brand-700 underline">
            تسجيل الدخول
          </Link>
        </div>
      ) : enrolled ? (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950">
          <p className="font-extrabold">أنت مالك لهذه الدورة</p>
          <p className="mt-1 font-semibold text-emerald-900">يمكنك متابعة الدروس أدناه دون شراء مرة أخرى.</p>
        </div>
      ) : priceMad <= 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="text-sm text-slate-600">هذه الدورة مجانية — سجّل دون خصم من الرصيد.</p>
          <button
            type="button"
            onClick={handleFreeEnroll}
            disabled={purchasing}
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-500/20 disabled:opacity-50"
          >
            {purchasing ? "جاري المعالجة…" : "تسجيل مجاني في الدورة"}
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-slate-700">
            سعر الدورة: <span className="font-bold tabular-nums">{formatDzd(priceMad)}</span> — رصيد محفظتك (من قاعدة البيانات):{" "}
            <span className="font-bold tabular-nums">{formatDzd(walletBalance)}</span>
          </p>
          {walletBalance >= priceMad ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950">
              <p className="font-bold">رصيدك يكفي لإتمام الشراء</p>
              <p className="mt-1 text-emerald-900">اضغط الزر أدناه لخصم المبلغ من المحفظة وتفعيل الدورة فورًا.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <p className="font-bold">رصيدك غير كافٍ</p>
              <p className="mt-1">تحتاج إلى حوالي {formatDzd(Math.max(0, priceMad - walletBalance))} إضافية في المحفظة.</p>
              <Link
                href="/dashboard?recharge=1"
                className="mt-3 inline-flex items-center justify-center rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-4 py-2.5 text-sm font-extrabold text-white no-underline shadow-md"
              >
                شحن الرصيد
              </Link>
            </div>
          )}
          <button
            type="button"
            onClick={handleWalletPurchase}
            disabled={walletBalance < priceMad || purchasing}
            className="w-full rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/25 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {purchasing ? "جاري المعالجة…" : `شراء الدورة — ${formatDzd(priceMad)}`}
          </button>
        </div>
      )}
      {purchaseFlash ? (
        <div
          className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold ${
            purchaseFlash.kind === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-950"
              : "border-red-200 bg-red-50 text-red-950"
          }`}
        >
          <p>{purchaseFlash.message}</p>
          {purchaseFlash.kind === "error" && purchaseFlash.message === "رصيدك غير كافٍ" ? (
            <Link
              href="/dashboard?recharge=1"
              className="mt-3 inline-flex items-center justify-center rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-4 py-2.5 text-sm font-extrabold text-white no-underline shadow-md"
            >
              شحن الرصيد
            </Link>
          ) : null}
        </div>
      ) : null}
      {!enrolled && (isPaidPackage || priceMad <= 0) ? (
        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          عمليات الدفع تتم عبر رصيد محفظتك داخل المنصة. بعد التفعيل تُفتح لك الدروس وفق شروط الدورة، ويمكنك طلب المساعدة من فريق الدعم عند الحاجة.
        </p>
      ) : null}
    </div>
  );

  return (
    <section className="container-page space-y-8 py-8 text-start sm:space-y-10 sm:py-10">
      {/* 1 — Hero */}
      <header className="overflow-x-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white via-slate-50/80 to-white shadow-card">
        <div className="border-b border-slate-100 bg-gradient-to-l from-brand-600/[0.09] to-indigo-600/[0.07] px-5 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand-800 ring-1 ring-brand-200/80">
                {categoryName}
              </span>
              <h1 className="mt-3 text-balance text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{pkg.title}</h1>
              <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">{heroSubtitle}</p>
              <p className="mt-3 text-sm text-slate-700">
                مع الأستاذ: <span className="font-bold text-slate-900">{teacherName}</span>
              </p>
            </div>
            <div className="flex w-full min-w-[260px] shrink-0 flex-col gap-4 rounded-2xl border border-white/80 bg-white/95 p-5 shadow-lg backdrop-blur-sm lg:max-w-sm">
              <div>
                <p className="text-xs font-bold text-slate-500">السعر</p>
                <p className="mt-1 text-3xl font-black text-brand-700">{priceMad <= 0 ? "مجانية" : formatDzd(priceMad)}</p>
              </div>
              {authedStudent ? (
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/90 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">رصيد المحفظة</p>
                  <p className="text-lg font-black tabular-nums text-slate-900">{formatDzd(walletBalance)}</p>
                </div>
              ) : null}
              {enrolled ? (
                <Link
                  href={firstLessonHref}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-4 py-3.5 text-center text-sm font-extrabold text-white no-underline shadow-lg shadow-brand-500/30"
                >
                  تصفح الدروس
                </Link>
              ) : !authedStudent ? (
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-4 py-3.5 text-center text-sm font-extrabold text-white no-underline shadow-lg shadow-brand-500/30"
                >
                  اشترك الآن
                </Link>
              ) : priceMad <= 0 ? (
                <button
                  type="button"
                  onClick={handleFreeEnroll}
                  disabled={purchasing}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-4 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 disabled:opacity-50"
                >
                  {purchasing ? "جاري المعالجة…" : "ابدأ التعلّم مجانًا"}
                </button>
              ) : walletBalance >= priceMad ? (
                <button
                  type="button"
                  onClick={handleWalletPurchase}
                  disabled={purchasing}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-4 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 disabled:opacity-50"
                >
                  {purchasing ? "جاري المعالجة…" : "اشترك الآن"}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={scrollToPurchase}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-4 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30"
                  >
                    اشترك الآن
                  </button>
                  <p className="text-center text-[11px] font-semibold text-amber-800">رصيدك غير كافٍ — راجع قسم الشراء أو شحن الرصيد</p>
                  <Link
                    href="/dashboard?recharge=1"
                    className="text-center text-xs font-extrabold text-brand-800 underline underline-offset-2"
                  >
                    شحن الرصيد
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        {enrolled ? (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
            <p className="text-sm font-semibold text-slate-700">تقدّمك في الدورة</p>
            <p className="text-lg font-black text-brand-700">{progressStats.pct}%</p>
            <div className="h-2 min-w-[200px] flex-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-l from-brand-600 to-indigo-600 transition-all"
                style={{ width: `${progressStats.pct}%` }}
              />
            </div>
            <p className="text-xs text-slate-600">
              أكملت {progressStats.done} من {progressStats.total} {progressStats.total === 1 ? "درس" : "دروس"}
            </p>
          </div>
        ) : null}
      </header>

      {/* 2 — Learning outcomes */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-8" aria-labelledby="outcomes-title">
        <h2 id="outcomes-title" className="text-xl font-extrabold text-slate-900">
          ماذا ستتعلّم؟
        </h2>
        <p className="mt-1 text-sm text-slate-500">ملخص لنتائج التعلّم المتوقعة خلال هذه الدورة.</p>
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {learningOutcomes.map((line, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm font-semibold leading-relaxed text-slate-800"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-xs font-black text-brand-800">
                {i + 1}
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 3 — Course info (package model) */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-8" aria-labelledby="info-title">
        <h2 id="info-title" className="text-xl font-extrabold text-slate-900">
          معلومات الدورة
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/90 p-4">
            <p className="text-xs font-bold text-slate-500">عدد الدروس المنشورة</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{packageLessons.length}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/90 p-4">
            <p className="text-xs font-bold text-slate-500">نوع الوصول</p>
            <p className="mt-1 text-lg font-extrabold text-slate-900">{accessLabel}</p>
            <p className="mt-1 text-[11px] text-slate-500">{pkg.priceType === "premium" ? "premium" : pkg.priceType || "—"}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/90 p-4">
            <p className="text-xs font-bold text-slate-500">دروس معاينة مجانية</p>
            <p className="mt-1 text-sm font-extrabold leading-snug text-slate-900">{previewLabel}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/90 p-4">
            <p className="text-xs font-bold text-slate-500">المحتوى المميز</p>
            <p className="mt-1 text-sm font-extrabold text-slate-900">
              {premiumLessonCount > 0
                ? `${premiumLessonCount} ${premiumLessonCount === 1 ? "درسًا مميزًا" : "دروس مميزة"} بعد الاشتراك`
                : "لا توجد دروس مصنّفة كمميزة ضمن المنشور"}
            </p>
          </div>
        </div>
      </section>

      {/* 5 — Premium messaging (soft) */}
      {premiumLessonCount > 0 ? (
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-l from-indigo-50/90 to-brand-50/60 px-5 py-4 text-sm leading-relaxed text-slate-800 sm:px-6">
          <p className="font-extrabold text-indigo-950">محتوى مميز ضمن الدورة</p>
          <p className="mt-2 text-slate-700">
            تتضمن هذه الدورة دروسًا مميزة تُفتح بالكامل بعد الاشتراك أو التسجيل المجاني حسب نوع الدورة. يمكنك استكشاف قائمة
            الدروس أدناه؛ الدروس المجانية متاحة للمعاينة، والباقي يُفعّل تلقائيًا بعد اشتراكك دون أن تُحجب صفحة الدورة.
          </p>
        </div>
      ) : null}

      {authedStudent && !enrolled && isPaidPackage ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-start shadow-sm sm:px-6">
          <p className="text-lg font-extrabold text-amber-950">هذه الدورة مدفوعة</p>
          <p className="mt-1 text-sm font-semibold text-amber-900">اشترك الآن للوصول الكامل إلى جميع الدروس.</p>
          <p className="mt-2 text-xs text-amber-800/90">الشراء من رصيد محفظتك عبر قسم الشراء أدناه.</p>
        </div>
      ) : null}

      {/* 4 — Purchase */}
      <section className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/50 to-white p-5 shadow-sm sm:p-8">
        {renderPurchaseBlock()}
      </section>

      {/* Lessons */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-8">
        <h2 className="text-xl font-extrabold text-slate-900">دروس الدورة</h2>
        <p className="mt-1 text-sm text-slate-500">
          رتّبنا الدروس حسب التسلسل. الوسم «مدفوع» يعني درسًا مميزًا يُفتح بالكامل بعد الاشتراك؛ باقي الدروس يمكن معاينتها أو
          متابعتها حسب نوعها.
        </p>
        {!packageLessons.length ? <p className="mt-4 text-sm text-slate-600">لا توجد دروس منشورة في هذه الدورة حاليًا.</p> : null}
        <div className="mt-5 space-y-3">
          {packageLessons.map((lesson) => {
            const premium = normalizeLessonAccessType(lesson) === "premium";
            const done = pkg?.id ? getCompletedSet(pkg.id).has(lesson.id) : false;
            return (
              <article key={lesson.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-brand-200/80">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-bold text-slate-900">
                      <span>{lesson.order}. {lesson.title}</span>
                      {premium ? (
                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-900">مميز</span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-900">معاينة / مجاني</span>
                      )}
                      {enrolled && done ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-900">مكتمل</span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{lesson.description || "لا يوجد وصف."}</p>
                    <p className="mt-2 text-xs text-slate-500">المدة: {lesson.duration || 0} دقيقة — النوع: {lesson.type || "text"}</p>
                  </div>
                  <Link
                    href={`/packages/${pkg.slug}/lesson/${lesson.id}`}
                    className={`inline-flex shrink-0 rounded-xl px-4 py-2 text-sm font-bold no-underline ${
                      premium
                        ? "border border-indigo-200 bg-white text-indigo-900 hover:bg-indigo-50"
                        : "bg-brand-600 text-white shadow-sm hover:opacity-95"
                    }`}
                  >
                    {premium ? "عرض الدرس" : "متابعة الدرس"}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 4b — Conversion repeat */}
      {!enrolled ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <p className="text-lg font-extrabold text-slate-900">جاهز للانطلاق؟</p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
            اشترك الآن واحصل على وصول منظم لجميع الدروس المناسبة لهذه الدورة، مع متابعة تقدّمك من لوحة الطالب.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {!authedStudent ? (
              <Link
                href="/login"
                className="inline-flex min-w-[12rem] items-center justify-center rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-6 py-3 text-sm font-extrabold text-white no-underline shadow-lg"
              >
                اشترك الآن
              </Link>
            ) : priceMad <= 0 ? (
              <button
                type="button"
                onClick={handleFreeEnroll}
                disabled={purchasing}
                className="inline-flex min-w-[12rem] items-center justify-center rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg disabled:opacity-50"
              >
                {purchasing ? "جاري المعالجة…" : "ابدأ مجانًا"}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (purchasing) return;
                    if (walletBalance >= priceMad) void handleWalletPurchase();
                    else scrollToPurchase();
                  }}
                  disabled={purchasing && walletBalance >= priceMad}
                  className="inline-flex min-w-[12rem] items-center justify-center rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg disabled:opacity-50"
                >
                  {purchasing && walletBalance >= priceMad ? "جاري المعالجة…" : "اشترك الآن"}
                </button>
                <button
                  type="button"
                  onClick={scrollToPurchase}
                  className="text-sm font-bold text-brand-700 underline underline-offset-2"
                >
                  تفاصيل الدفع والمحفظة
                </button>
              </>
            )}
          </div>
        </section>
      ) : null}

      {/* FAQ */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-8" aria-labelledby="faq-title">
        <h2 id="faq-title" className="text-xl font-extrabold text-slate-900">
          أسئلة شائعة
        </h2>
        <dl className="mt-5 space-y-4">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
              <dt className="font-bold text-slate-900">{item.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-slate-600">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {packageLessons[0] ? (
        <div className="flex flex-wrap justify-center gap-3 border-t border-slate-200 pt-6">
          <Link
            href={firstLessonHref}
            className="inline-flex rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white no-underline"
          >
            ابدأ التعلم
          </Link>
          <Link
            href={`/packages/${pkg.slug}/lesson/${packageLessons[packageLessons.length - 1].id}`}
            className="inline-flex rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-bold text-slate-700 no-underline hover:bg-slate-50"
          >
            آخر درس
          </Link>
        </div>
      ) : null}
    </section>
  );
}
