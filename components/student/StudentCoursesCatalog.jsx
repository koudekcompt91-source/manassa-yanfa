"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { studentSeesPackage } from "@/lib/academic-levels";
import { useDemoSection } from "@/lib/demo-store";
import { formatDzd } from "@/lib/format-money";

function isRemoteCover(src) {
  const s = String(src || "").trim();
  return s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/");
}

function CourseCover({ title, coverImage }) {
  const src = String(coverImage || "").trim();
  if (isRemoteCover(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote CMS URLs not in next.config images
      <img src={src} alt="" className="h-40 w-full object-cover" loading="lazy" />
    );
  }
  const letter = (title || "د").charAt(0);
  return (
    <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-brand-600/90 via-indigo-600/85 to-slate-800 text-4xl font-black text-white/95">
      {letter}
    </div>
  );
}

export default function StudentCoursesCatalog() {
  const router = useRouter();
  const [packages, setPackages] = useState([]);
  const [categories] = useDemoSection("categories");
  const [teachers] = useDemoSection("teachers");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [meState, setMeState] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then(setMeState)
      .catch(() => setMeState({}));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingCourses(true);
      try {
        const res = await fetch("/api/courses", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && data?.ok && Array.isArray(data.courses)) {
          setPackages(data.courses);
        } else {
          setPackages([]);
        }
      } catch {
        if (!cancelled) setPackages([]);
      } finally {
        if (!cancelled) setLoadingCourses(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMe = useCallback(() => {
    return fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then(setMeState);
  }, []);

  const studentLevel =
    meState?.user?.role === "STUDENT" ? String(meState.user.academicLevel || "").trim() : "";
  const studentLevelCode =
    meState?.user?.role === "STUDENT" ? String(meState.user.level || "").trim() : "";
  const authedStudent = meState?.user?.role === "STUDENT";
  const enrollments = meState?.enrollments || [];
  const enrolledIds = useMemo(() => new Set(enrollments.map((e) => e.packageId)), [enrollments]);

  const categoryTabs = useMemo(
    () => ["الكل", ...(categories || []).filter((row) => row.active).map((row) => row.name)],
    [categories]
  );

  const decorated = useMemo(() => {
    return (packages || [])
      .filter((pkg) => pkg.isPublished)
      .filter((pkg) => studentSeesPackage(studentLevel || null, pkg, studentLevelCode || null))
      .map((pkg) => {
        const categoryName = (categories || []).find((row) => row.id === pkg.categoryId)?.name || "-";
        const teacherName = (teachers || []).find((row) => row.id === pkg.teacherId)?.name || "طاقم yanfa3 Education";
        const slug = String(pkg.slug || pkg.id || "").trim();
        const detailHref = `/packages/${slug}`;
        const firstLessonHref = detailHref;
        const priceMad = Number(pkg.priceMad ?? pkg.price ?? 0) || 0;
        const owned = enrolledIds.has(pkg.id);
        const shortDesc = (() => {
          const d = (pkg.description || "").trim();
          if (d.length > 140) return `${d.slice(0, 140)}…`;
          return d || "وصف مختصر للدورة.";
        })();
        return {
          pkg,
          categoryName,
          teacherName,
          slug,
          detailHref,
          firstLessonHref,
          priceMad,
          owned,
          shortDesc,
          isFree: priceMad <= 0,
        };
      })
      .filter((row) => {
        const byCategory = activeCategory === "الكل" || row.categoryName === activeCategory;
        const target = `${row.pkg.title} ${row.pkg.description} ${row.teacherName}`.toLowerCase();
        return byCategory && target.includes(query.trim().toLowerCase());
      })
      .sort((a, b) => (a.pkg.order || 0) - (b.pkg.order || 0));
  }, [
    packages,
    categories,
    teachers,
    query,
    activeCategory,
    studentLevel,
    studentLevelCode,
    enrolledIds,
  ]);

  const ownedRows = useMemo(() => decorated.filter((r) => r.owned), [decorated]);
  const browseRows = useMemo(() => decorated.filter((r) => !r.owned), [decorated]);
  const freeBrowse = useMemo(() => browseRows.filter((r) => r.isFree), [browseRows]);
  const paidBrowse = useMemo(() => browseRows.filter((r) => !r.isFree), [browseRows]);

  const handleFreeStart = useCallback(
    async (pkgId, firstLessonHref) => {
      if (!authedStudent || !pkgId || busyId === pkgId) return;
      setBusyId(pkgId);
      try {
        const res = await fetch("/api/wallet/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ packageId: pkgId }),
        });
        const data = await res.json().catch(() => ({}));
        if (data.ok || data.code === "already_enrolled") {
          await loadMe();
          router.push(firstLessonHref);
        }
      } finally {
        setBusyId(null);
      }
    },
    [authedStudent, busyId, loadMe, router]
  );

  const renderCard = (row) => {
    const { pkg, detailHref, firstLessonHref, priceMad, owned, shortDesc, isFree, teacherName, categoryName } = row;
    const purchasing = busyId === pkg.id;

    let cta;
    if (owned) {
      cta = (
        <Link
          href={firstLessonHref}
          className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-4 py-3 text-sm font-extrabold text-white shadow-md"
        >
          متابعة
        </Link>
      );
    } else if (!authedStudent) {
      cta = (
        <Link
          href={`/login?next=${encodeURIComponent(detailHref)}`}
          className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-4 py-3 text-sm font-extrabold text-white shadow-md"
        >
          {isFree ? "ابدأ الآن" : "اشترك الآن"}
        </Link>
      );
    } else if (isFree) {
      cta = (
        <button
          type="button"
          disabled={purchasing}
          onClick={() => handleFreeStart(pkg.id, firstLessonHref)}
          className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-4 py-3 text-sm font-extrabold text-white shadow-md disabled:opacity-50"
        >
          {purchasing ? "جاري التحميل…" : "ابدأ الآن"}
        </button>
      );
    } else {
      cta = (
        <Link
          href={`${detailHref}#purchase`}
          className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-4 py-3 text-sm font-extrabold text-white shadow-md"
        >
          اشترك الآن
        </Link>
      );
    }

    return (
      <article
        key={pkg.id}
        className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:shadow-md"
      >
        <CourseCover title={pkg.title} coverImage={pkg.coverImage} />
        <div className="flex flex-1 flex-col p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">{categoryName}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                isFree ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
              }`}
            >
              {isFree ? "مجانية" : "مدفوعة"}
            </span>
          </div>
          <h2 className="mt-2 text-lg font-extrabold text-slate-900">{pkg.title}</h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{shortDesc}</p>
          <p className="mt-2 text-xs text-slate-500">
            الأستاذ: <span className="font-semibold text-slate-700">{teacherName}</span>
          </p>
          <p className="mt-3 text-lg font-black text-brand-700">{isFree ? "مجانية" : formatDzd(priceMad)}</p>
          <div className="mt-4">{cta}</div>
          <Link href={detailHref} className="mt-3 text-center text-xs font-bold text-brand-800 underline underline-offset-2">
            تفاصيل الدورة
          </Link>
        </div>
      </article>
    );
  };

  const renderGrid = (rows, emptyText) => {
    if (!rows.length) {
      return <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-10 text-center text-sm text-slate-500">{emptyText}</p>;
    }
    return <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{rows.map(renderCard)}</div>;
  };

  return (
    <section className="container-page space-y-10 py-8 sm:py-10">
      <header className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold text-brand-700">كتالوج التعلّم</p>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">الدورات</h1>
        <p className="mt-2 text-slate-600">
          دورات منشورة من لوحة الإدارة — مجانية ومدفوعة. اشترِ بالمحفظة عند توفر الرصيد، أو ابدأ المجانية مباشرة.
        </p>
        {authedStudent && studentLevel ? (
          <p className="mt-2 text-sm text-brand-800">المحتوى المعروض لمستواك: {studentLevel}</p>
        ) : null}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن دورة…"
          className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
        />
      </header>

      <nav className="flex flex-wrap gap-2" aria-label="تصنيفات الدورات">
        {categoryTabs.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setActiveCategory(name)}
            className={`rounded-xl px-4 py-2 text-sm font-bold ${
              activeCategory === name ? "bg-brand-600 text-white" : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            {name}
          </button>
        ))}
      </nav>

      {!decorated.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
          {loadingCourses ? "جاري تحميل الدورات..." : "لا توجد دورات منشورة تطابق مستواك أو البحث الحالي."}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900">دوراتي</h2>
            <p className="text-sm text-slate-500">الدورات التي سجّلت بها أو اشتريتها.</p>
            {renderGrid(ownedRows, "لم تسجّل في أي دورة بعد — اختر دورة من الأسفل.")}
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-10">
            <h2 className="text-xl font-extrabold text-slate-900">دورات مجانية</h2>
            <p className="text-sm text-slate-500">ابدأ التعلّم دون خصم من المحفظة بعد تسجيل الدخول.</p>
            {renderGrid(freeBrowse, "لا توجد دورات مجانية متاحة حاليًا ضمن التصنيف المختار.")}
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-10">
            <h2 className="text-xl font-extrabold text-slate-900">دورات مدفوعة</h2>
            <p className="text-sm text-slate-500">الشراء عبر رصيد المحفظة من صفحة الدورة.</p>
            {renderGrid(paidBrowse, "لا توجد دورات مدفوعة متاحة حاليًا ضمن التصنيف المختار.")}
          </div>
        </>
      )}
    </section>
  );
}
