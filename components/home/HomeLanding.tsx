"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDemoSection } from "@/lib/demo-store";
import BrandLogoFull from "@/components/brand/BrandLogoFull";
import { BRAND_NAME } from "@/lib/brand";

const container = "container-landing";

const pillCtaClass =
  "inline-flex items-center justify-center rounded-2xl bg-gradient-to-l from-brand-600 to-indigo-600 px-6 py-3 text-sm font-extrabold text-white shadow-tactile-brand ring-1 ring-white/25 transition duration-300 hover:brightness-[1.06] active:scale-[0.98]";

/** Hero / dark surfaces — tactile, inset-lit */
const btnHeroPrimary =
  "inline-flex min-h-[3rem] items-center justify-center rounded-2xl bg-white px-7 py-3.5 text-base font-extrabold text-slate-900 shadow-tactile ring-1 ring-white/45 transition duration-300 hover:bg-slate-50 hover:brightness-[1.03] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60";

const btnHeroGhost =
  "inline-flex min-h-[3rem] items-center justify-center rounded-2xl border border-white/22 bg-white/[0.07] px-7 py-3.5 text-base font-bold text-white shadow-tactile-ghost backdrop-blur-md transition duration-300 hover:border-white/32 hover:bg-white/[0.12] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/45";

const btnHeroBrand =
  "inline-flex min-h-[3rem] items-center justify-center rounded-2xl border border-white/12 bg-gradient-to-l from-brand-600 to-indigo-700 px-7 py-3.5 text-base font-bold text-white shadow-tactile-brand ring-1 ring-white/25 transition duration-300 hover:brightness-[1.06] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-200/50";

const btnHeroPrimaryWide = btnHeroPrimary.replace("px-7", "px-8");
const btnHeroGhostWide = btnHeroGhost.replace("px-7", "px-8");

const btnPricingFeatured =
  "mt-8 inline-flex w-full min-h-[3rem] items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-l from-brand-600 to-indigo-600 py-3.5 text-sm font-extrabold text-white no-underline shadow-tactile-brand ring-1 ring-white/25 transition duration-300 hover:brightness-[1.06] active:scale-[0.98]";

const btnPricingOutline =
  "mt-8 inline-flex w-full min-h-[3rem] items-center justify-center rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/95 py-3.5 text-sm font-extrabold text-slate-900 no-underline shadow-tactile ring-1 ring-slate-900/[0.06] transition duration-300 hover:border-brand-200/80 hover:shadow-card-luxury-hover active:scale-[0.98]";

/** Light sections */
const btnLightSolid =
  "inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-extrabold text-white shadow-tactile ring-1 ring-white/10 transition duration-300 hover:bg-slate-800 active:scale-[0.98]";

const btnLightGhost =
  "inline-flex items-center justify-center rounded-2xl border border-white/22 bg-white/5 px-6 py-3 text-sm font-bold text-white shadow-tactile-ghost backdrop-blur-sm transition duration-300 hover:bg-white/12 active:scale-[0.98]";

const btnMutedOutline =
  "inline-flex items-center justify-center rounded-2xl border border-slate-200/95 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-slate-900/[0.04] transition duration-300 hover:border-brand-200/90 hover:bg-gradient-to-b hover:from-brand-50/80 hover:to-white hover:shadow-card-luxury active:scale-[0.99]";

const cardLuxury =
  "rounded-3xl border border-slate-200/75 bg-gradient-to-b from-white via-white to-slate-50/75 shadow-card-luxury transition duration-500 ease-out hover:-translate-y-0.5 hover:border-brand-200/65 hover:shadow-card-luxury-hover";

const cardLuxuryFlat =
  "rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_1px_0_0_rgba(255,255,255,0.9)_inset,0_8px_28px_-10px_rgba(15,23,42,0.08),0_0_0_1px_rgba(148,163,184,0.1)] transition duration-300 hover:border-brand-200/60 hover:shadow-card-luxury";

const TEACHER_NAME = "يوسف مادن";
/** Studio portrait (682×1024); served from /public */
const TEACHER_IMAGE = "/images/youssef-maden-portrait.jpg";
const TEACHER_IMAGE_WIDTH = 682;
const TEACHER_IMAGE_HEIGHT = 1024;

function IconSpark(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}

function IconCheck(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function TeacherPortrait({
  variant = "hero",
  priority = false,
}: {
  variant?: "hero" | "section";
  priority?: boolean;
}) {
  const isHero = variant === "hero";
  /** Soft capsule silhouette — avoids a stark rectangular crop while keeping the subject intact */
  const portraitClip = isHero
    ? "[clip-path:ellipse(100%_96%_at_50%_48%)] sm:[clip-path:ellipse(99%_94%_at_50%_47%)]"
    : "[clip-path:ellipse(100%_97%_at_50%_49%)]";

  return (
    <div className={`relative mx-auto ${isHero ? "max-w-md lg:max-w-none" : "max-w-sm"}`}>
      <div
        className={`pointer-events-none absolute rounded-full bg-gradient-to-br from-brand-500/40 via-indigo-500/28 to-teal-400/18 blur-3xl animate-soft-glow ${
          isHero ? "-inset-10 sm:-inset-16" : "-inset-6"
        }`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute rounded-full bg-gradient-to-tl from-sky-400/15 via-transparent to-transparent blur-3xl animate-ambient-drift ${
          isHero ? "-end-8 -top-4 size-48 sm:size-64" : "-end-4 -top-2 size-36"
        }`}
        style={{ animationDelay: "-4s" }}
        aria-hidden
      />
      {/* Head-area bloom — stays behind the figure, no facial “beauty” filtering */}
      <div
        className={`pointer-events-none absolute left-1/2 z-0 rounded-full bg-gradient-to-b from-brand-400/35 via-indigo-500/20 to-transparent blur-3xl ${
          isHero ? "top-[20%] h-[min(52%,22rem)] w-[min(92%,26rem)] -translate-x-1/2 -translate-y-1/2" : "top-[22%] h-[55%] w-[95%] -translate-x-1/2 -translate-y-1/2"
        }`}
        aria-hidden
      />

      <div
        className={`relative overflow-hidden rounded-[2.15rem] border border-white/18 bg-gradient-to-b from-white/[0.16] via-white/[0.05] to-white/[0.02] shadow-portrait-halo backdrop-blur-md sm:rounded-[2.45rem] ${
          isHero ? "p-[5px] sm:p-2" : "p-1"
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 120% 80% at 50% 0%, rgba(56, 189, 248, 0.12), transparent 52%), radial-gradient(ellipse 90% 60% at 80% 70%, rgba(99, 102, 241, 0.1), transparent 55%)",
          }}
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-x-8 top-2 z-20 h-px rounded-full bg-gradient-to-l from-transparent via-white/45 to-transparent blur-sm" aria-hidden />

        <div
          className={`relative overflow-hidden bg-slate-950 ring-1 ring-white/12 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07),inset_0_0_80px_rgba(2,6,23,0.42)] sm:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),inset_0_0_100px_rgba(2,6,23,0.48)] ${
            isHero ? "rounded-[2rem] sm:rounded-[2.2rem]" : "rounded-[1.65rem]"
          }`}
        >
          {/* Stage wash: matches hero blacks so the studio backdrop dissolves instead of reading as a “box” */}
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-slate-900 via-slate-950 to-[#020617]"
            aria-hidden
          />
          <div
            className={`relative z-[1] ${portraitClip} ${isHero ? "-mx-[1px] sm:mx-0" : ""}`}
          >
            <Image
              src={TEACHER_IMAGE}
              alt={`صورة الأستاذ ${TEACHER_NAME}`}
              width={TEACHER_IMAGE_WIDTH}
              height={TEACHER_IMAGE_HEIGHT}
              priority={priority}
              sizes={isHero ? "(max-width: 1024px) 100vw, 42vw" : "(max-width: 768px) 100vw, 320px"}
              className={`relative z-[1] h-auto w-full object-cover transition duration-700 ease-out ${
                isHero ? "object-[center_18%] scale-[1.01] sm:object-[center_16%] lg:scale-[1.02]" : "object-[center_20%] scale-[1.005]"
              }`}
            />
          </div>

          {/* Bottom merge into hero — weighted low so the face stays clean */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[min(46%,16rem)] bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_95%_55%_at_50%_0%,rgba(255,255,255,0.07),transparent_58%)]"
            aria-hidden
          />
        </div>
      </div>
      {isHero ? (
        <div className="pointer-events-none absolute -bottom-6 inset-x-4 z-[3] mx-auto max-w-md rounded-2xl border border-white/18 bg-slate-950/82 px-4 py-3.5 text-center shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-xl sm:-bottom-8 sm:px-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">وجه المنصة التعليمية</p>
          <p className="mt-1 text-base font-extrabold text-white sm:text-lg">{TEACHER_NAME}</p>
          <p className="mt-0.5 text-xs font-medium text-slate-300 sm:text-sm">أستاذ الأدب العربي وعلومه — قراءة منهجية، أسلوب رصين، ولغة أدبية أنيقة</p>
        </div>
      ) : null}
    </div>
  );
}

export default function HomeLanding() {
  const router = useRouter();
  const [authGate, setAuthGate] = useState<"checking" | "guest">("checking");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/auth/me", { credentials: "include" });
        const data = await r.json().catch(() => ({}));
        if (cancelled) return;
        if (data?.user?.role === "STUDENT") {
          router.replace("/dashboard");
          return;
        }
      } catch {
        /* ignore */
      }
      if (!cancelled) setAuthGate("guest");
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const [homepageContent] = useDemoSection("homepageContent");
  const [ctaButtons] = useDemoSection("ctaButtons");
  const [announcements] = useDemoSection("announcements");
  const [packages] = useDemoSection("packages");
  const [settings] = useDemoSection("settings");
  const homeButtons = (ctaButtons || []).filter((row: { placement?: string; visible?: boolean }) => row.placement === "homepage" && row.visible);
  const featuredCourses = (packages || []).filter((row: { isFeatured?: boolean }) => row.isFeatured).slice(0, 4);

  if (authGate === "checking") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50 text-slate-600">
        <p className="text-sm font-semibold">جاري التحميل…</p>
      </div>
    );
  }

  const heroTitle = homepageContent?.heroTitle;
  const heroSubtitle = homepageContent?.heroSubtitle;

  return (
    <div className="bg-gradient-to-b from-[#eef2f9] via-[#f4f6fb] to-[#f4f6fb] text-slate-900">
      {/* —— Hero —— */}
      <section
        id="hero"
        aria-labelledby="hero-title"
        className="landing-hero-cinematic relative min-h-[min(88svh,56rem)] overflow-hidden border-b border-slate-900/25 bg-slate-950 bg-hero-mesh"
      >
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_120%,rgba(15,23,42,0.92),transparent)]" aria-hidden />
        <div className="pointer-events-none absolute -start-32 top-0 z-0 h-[28rem] w-[28rem] rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -end-24 top-40 z-0 h-[22rem] w-[22rem] rounded-full bg-indigo-500/15 blur-3xl" aria-hidden />
        <div
          className="pointer-events-none absolute start-1/4 top-1/3 z-0 h-[min(42rem,70vw)] w-[min(42rem,70vw)] -translate-x-1/2 rounded-full bg-brand-400/10 blur-[100px] animate-ambient-drift"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -end-1/4 bottom-0 z-0 h-[36rem] w-[36rem] rounded-full bg-indigo-400/12 blur-[90px] animate-ambient-drift"
          style={{ animationDelay: "-7s" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 top-[18%] z-0 h-px w-[min(72vw,56rem)] -translate-x-1/2 rotate-[-11deg] bg-gradient-to-l from-transparent via-white/25 to-transparent blur-sm"
          aria-hidden
        />

        {/* Brand corner: physical top-right in RTL = inline-start */}
        <div className={`${container} pointer-events-none absolute start-0 top-4 z-20 sm:top-6`}>
          <div className="pointer-events-auto flex justify-start">
            <Link
              href="/"
              aria-label={BRAND_NAME}
              className="rounded-xl border border-white/20 bg-white/95 px-3 py-2 shadow-lg shadow-slate-950/25 backdrop-blur-sm transition hover:border-white/35 hover:bg-white"
            >
              <BrandLogoFull variant="hero" />
            </Link>
          </div>
        </div>

        <div className={`${container} relative z-10 flex min-h-[inherit] flex-col justify-center py-16 sm:py-20 lg:py-24`}>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
            <div className="order-2 text-center lg:order-1 lg:text-start">
              <div
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-slate-200 shadow-sm backdrop-blur-md sm:text-sm animate-fade-up"
                style={{ animationDelay: "0.05s" }}
              >
                <IconSpark className="size-4 text-brand-300" />
                أكاديمية عربية للأدب وعلومه — بإشراف مباشر من الأستاذ {TEACHER_NAME}
              </div>

              <h1
                id="hero-title"
                className="text-balance text-3xl font-black leading-[1.15] tracking-tight text-white sm:text-4xl md:text-5xl xl:text-[3.25rem] animate-fade-up"
                style={{ animationDelay: "0.12s" }}
              >
                {heroTitle || (
                  <>
                    رحلة أدبية{" "}
                    <span className="bg-gradient-to-l from-sky-200 via-brand-200 to-indigo-200 bg-clip-text text-transparent">عميقة وأنيقة</span>
                    <br className="hidden sm:block" />
                    تبدأ من هنا
                  </>
                )}
              </h1>

              <p
                className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg lg:mx-0 animate-fade-up"
                style={{ animationDelay: "0.2s" }}
              >
                {heroSubtitle ||
                  "yanfa3 Education تقدّم لك درسًا أدبيًا مركزًا: نحوًا وبلاغةً وشعرًا ونقدًا، بأسلوب أكاديمي هادئ يبني فهمًا تدريجيًا — مع الأستاذ يوسف مادن كمرجعك الأول في المسار."}
              </p>

              <div
                className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:justify-start sm:gap-3 animate-fade-up"
                style={{ animationDelay: "0.28s" }}
              >
                <Link href="/courses" className={btnHeroPrimary}>
                  ابدأ التعلم
                </Link>
                <Link href="/courses" className={btnHeroGhost}>
                  تصفح الدورات
                </Link>
                <Link href="/register" className={btnHeroBrand}>
                  إنشاء حساب
                </Link>
              </div>

              {homeButtons.length ? (
                <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
                  {homeButtons.slice(0, 2).map((btn: { id: string; label: string; route: string }) => (
                    <Link
                      key={btn.id}
                      href={btn.route}
                      className="rounded-xl border border-white/18 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-slate-200 shadow-tactile-ghost backdrop-blur-sm transition duration-300 hover:bg-white/[0.11]"
                    >
                      {btn.label}
                    </Link>
                  ))}
                </div>
              ) : null}

              <div
                className="mt-10 flex flex-wrap items-center justify-center gap-3 border-t border-white/10 pt-8 text-sm text-slate-400 lg:justify-start animate-fade-up"
                style={{ animationDelay: "0.36s" }}
              >
                {["منهج أدبي واضح", "لغة عربية رصينة", "تجربة تعلّم أنيقة"].map((label) => (
                  <span key={label} className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-3 py-1.5 ring-1 ring-white/10">
                    <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                      <IconCheck className="size-3" />
                    </span>
                    <span className="font-semibold text-slate-200">{label}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2 animate-fade-up lg:ps-4" style={{ animationDelay: "0.15s" }}>
              <TeacherPortrait variant="hero" priority />
            </div>
          </div>
        </div>
      </section>

      {(announcements || [])
        .filter((row: { placement?: string }) => row.placement === "homepage" || row.placement === "global")
        .map((row: { id: string; title: string }) => (
          <div key={row.id} className={`${container} pt-4`}>
            <p className="rounded-2xl border border-amber-200/80 bg-amber-50/95 px-4 py-3 text-sm font-medium text-amber-950 shadow-sm">{row.title}</p>
          </div>
        ))}

      {/* —— لماذا yanfa3 Education —— */}
      <section className="border-b border-slate-200/80 bg-white py-16 sm:py-20" aria-labelledby="why-yanfa">
        <div className={container}>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold text-brand-700">لماذا yanfa3 Education؟</p>
            <h2 id="why-yanfa" className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              أدبٌ بروح أكاديمية، وبلاغةٌ بلا ضجيج
            </h2>
            <p className="mt-4 text-pretty text-slate-600 sm:text-lg">
              نصمّم التعلّم ليكون هادئًا ومتدرجًا: قراءة، تحليل، ثم إتقان — بعيدًا عن الفوضى المعلوماتية وبقرب من نصّك العربي.
            </p>
          </div>
          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                t: "عمق أدبي منظم",
                d: "مسارات واضحة في النحو والبلاغة والشعر والنقد، تربط بين المفهوم والتطبيق على النص.",
              },
              {
                t: "تحليل نصّي يُعلّمك التفكير",
                d: "تمارين موجهة ترسّخ أدوات القراءة: السياق، البنية، الدلالة، والصورة البيانية.",
              },
              {
                t: "تجربة عربية راقية",
                d: "واجهة RTL مريحة، ولغة واجهة أدبية، وتفاصيل بصرية تمنحك إحساس الأكاديمية الحديثة.",
              },
            ].map((item) => (
              <li
                key={item.t}
                className={`group flex flex-col p-7 ${cardLuxury}`}
              >
                <span className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-brand-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] ring-1 ring-white/10">
                  <IconSpark className="size-5" />
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">{item.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{item.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* —— ماذا ستتعلم —— */}
      <section className="border-b border-slate-200/80 bg-gradient-to-b from-[#f4f6fb] to-white py-16 sm:py-20" aria-labelledby="what-learn">
        <div className={container}>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <p className="text-sm font-bold text-brand-700">ماذا ستتعلّم؟</p>
              <h2 id="what-learn" className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
                مهارات أدبية تتراكم مع كل درس
              </h2>
              <p className="mt-4 text-pretty text-slate-600 sm:text-lg">
                ليست مجرد معلومات: بل أدوات قراءة وكتابة نقدية تخدمك في المنهج، في الامتحان، وفي ذائقتك الأدبية.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
              {[
                "قراءة نصّ أدبي بوعي سياقي وبلاغي",
                "بناء تعليق منظم على الشعر والنثر",
                "تمييز المحسّنات البيانية ووظيفتها الدلالية",
                "ربط الأدب بمراحله التاريخية دون اختزال",
                "صياغة لغة عربية فصيحة في التحليل",
                "تدرّب تدريجيًا على صيغ الامتحان الأدبي",
              ].map((line) => (
                <li
                  key={line}
                  className={`flex items-start gap-3 px-4 py-3.5 text-sm font-semibold text-slate-800 sm:text-base ${cardLuxuryFlat}`}
                >
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                    <IconCheck className="size-3.5" />
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* —— الأستاذ يوسف مادن —— */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-slate-950 py-16 text-white sm:py-20" aria-labelledby="teacher-yusuf">
        <div className="pointer-events-none absolute -start-24 top-1/4 h-80 w-80 rounded-full bg-brand-500/12 blur-[100px] animate-ambient-drift" aria-hidden />
        <div
          className="pointer-events-none absolute -end-20 bottom-0 h-72 w-72 rounded-full bg-indigo-500/14 blur-[90px] animate-ambient-drift"
          style={{ animationDelay: "-9s" }}
          aria-hidden
        />
        <div className={container}>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-sm font-bold text-brand-300">لماذا التعلّم مع الأستاذ {TEACHER_NAME}؟</p>
              <h2 id="teacher-yusuf" className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                صوتٌ أدبيٌ هادئ، ومسارٌ يحترم ذكاءك
              </h2>
              <p className="mt-6 max-w-prose text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
                يقدّم الأستاذ {TEACHER_NAME} الأدب العربي بأسلوب يجمع بين الدقة المنهجية والدفء البشري: يشرح بوضوح،
                يقودك خطوة بخطوة في تحليل النص، ويعيد للغة العربية مكانتها كفنٍّ معرفيٍّ لا كحفظٍ جاف.
              </p>
              <p className="mt-4 max-w-prose text-pretty text-sm leading-relaxed text-slate-400 sm:text-base">
                في yanfa3 Education، يظهر {TEACHER_NAME} كوجه تعليمي واحد للصفحة الرئيسية — لأننا نؤمن بأن الاتساق والثقة تبدآن من
                مرجعٍ واضحٍ، لا من تشتيتٍ بين عشرات الأصوات.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/courses" className={btnLightSolid}>
                  تصفح الدورات
                </Link>
                <Link href="/register" className={btnLightGhost}>
                  إنشاء حساب
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                <TeacherPortrait variant="section" />
                <p className="mt-6 text-center text-sm font-semibold text-slate-400 lg:text-start">
                  اسم الأستاذ: <span className="text-white">{TEACHER_NAME}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* —— الدورات المتاحة —— */}
      <section className="border-b border-slate-200/80 bg-white py-16 sm:py-20" aria-labelledby="courses-block">
        <div className={container}>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold text-brand-700">الدورات المتاحة</p>
              <h2 id="courses-block" className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
                مسارات تلتقي مع اهتمامك الأدبي
              </h2>
              <p className="mt-3 max-w-2xl text-slate-600 sm:text-lg">دورات مختارة بعناية — يمكنك الاطلاع والتسجيل عندما تكون جاهزًا.</p>
            </div>
            <Link href="/courses" className={btnMutedOutline}>
              عرض كل الدورات
            </Link>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(featuredCourses.length ? featuredCourses : []).map((c: { id: string; title: string; description?: string; slug?: string }) => {
              const slug = String(c.slug || c.id || "").trim();
              const href = slug ? `/packages/${encodeURIComponent(slug)}` : "/courses";
              return (
                <Link key={c.id} href={href} className={`group flex flex-col p-6 ${cardLuxury}`}>
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-700">مع {TEACHER_NAME}</p>
                  <h3 className="mt-2 line-clamp-2 text-lg font-extrabold text-slate-900 group-hover:text-brand-800">{c.title}</h3>
                  <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">{c.description || "دورة أدبية منظمة داخل المنصة."}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-brand-700">
                    تفاصيل الدورة
                    <span aria-hidden className="text-base leading-none">
                      ›
                    </span>
                  </span>
                </Link>
              );
            })}
            {!featuredCourses.length ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-8 sm:col-span-2 lg:col-span-4">
                <p className="text-center text-sm font-medium text-slate-600">
                  تُعرض هنا الدورات المميّزة من لوحة الإدارة عند توفرها. يمكنك الآن استكشاف الكتالوج الكامل.
                </p>
                <div className="mt-4 flex justify-center">
                  <Link href="/courses" className={pillCtaClass}>
                    تصفح الدورات
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* —— رحلة مختصرة —— */}
      <section className="border-b border-slate-200/80 bg-[#f4f6fb] py-16 sm:py-20" aria-labelledby="journey">
        <div className={container}>
          <h2 id="journey" className="text-center text-3xl font-black text-slate-900 sm:text-4xl">
            ثلاث خطوات… ثم أنت في قلب النص
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600 sm:text-lg">بسيطة كي لا تشغل بالك بالإجراءات، عميقة حين تصل إلى الدرس.</p>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: "١", t: "أنشئ حسابك", d: "خطوة قصيرة تفتح لك مسارك داخل المنصة." },
              { n: "٢", t: "اختر دورتك", d: "التزم بما يناسب مستواك واهتمامك الأدبي." },
              { n: "٣", t: "تعلّم بانتظام", d: "تابع الدروس، طبّق التحليل، وابنِ ثقتك خطوة بخطوة." },
            ].map((step) => (
              <li key={step.n} className={`relative flex flex-col p-7 text-center ${cardLuxury}`}>
                <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white shadow-md">
                  {step.n}
                </span>
                <h3 className="mt-5 text-lg font-extrabold text-slate-900">{step.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* —— آراء مختصرة —— */}
      <section className="border-b border-slate-200/80 bg-white py-16 sm:py-20" aria-labelledby="voices">
        <div className={container}>
          <h2 id="voices" className="text-center text-3xl font-black text-slate-900 sm:text-4xl">
            صوت الدارسين
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">انطباعات موجزة — بلغة هادئة تشبه تجربة المنصة.</p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                q: "الشرح كان متماسكًا: أستطيع الآن تتبّع حجّة النص دون أن أضيع بين التفاصيل.",
                who: "دارس في مسار البلاغة",
              },
              {
                q: "أحببت هدوء الأسلوب ووضوح التدرج؛ صرت أقرأ القصيدة قبل أن أفرض عليها معنى جاهزًا.",
                who: "دارس في مسار الشعر",
              },
              {
                q: "المنصة تشعرك أنك داخل درس أدبي حقيقي، لا مجرد فيديوهات متفرقة.",
                who: "دارس في مسار النقد",
              },
            ].map((v) => (
              <figure
                key={v.who}
                className="flex h-full flex-col rounded-3xl border border-slate-200/70 bg-gradient-to-b from-slate-50/95 to-white/90 p-6 shadow-card-luxury transition duration-500 hover:-translate-y-0.5 hover:border-brand-200/55 hover:shadow-card-luxury-hover"
              >
                <blockquote className="flex-1 text-sm leading-relaxed text-slate-800 sm:text-base">«{v.q}»</blockquote>
                <figcaption className="mt-4 text-xs font-bold text-slate-500">{v.who}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* —— خطط الاشتراك —— */}
      <section id="pricing" className="border-b border-slate-200/80 bg-gradient-to-b from-white to-[#f4f6fb] py-16 sm:py-20" aria-labelledby="pricing-title">
        <div className={container}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="pricing-title" className="text-3xl font-black text-slate-900 sm:text-4xl">
              خطط الاشتراك
            </h2>
            <p className="mt-3 text-slate-600 sm:text-lg">اختر إيقاعًا يناسب التزامك — ثم عُد إلى الدروس مع الأستاذ {TEACHER_NAME}.</p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {[
              { name: "أساسي", price: "199", desc: "إيقاع مريح لبناء الأساس اللغوي.", feat: ["حصتان مباشرتان أسبوعيًا", "ملخصات نحوية وبلاغية", "مجموعة نقاش أدبي"], hi: false },
              { name: "متقدم", price: "349", desc: "الأكثر طلبًا: عمق أكبر في التحليل والنقد.", feat: ["٤ حصص أسبوعيًا", "تصحيح تحليلات نصية", "متابعة أسبوعية"], hi: true },
              { name: "احترافي", price: "499", desc: "برنامج مكثف لصقل الذائقة الأدبية.", feat: ["ورش قراءة متقدمة", "جلسات تقوية فردية", "أولوية في الأسئلة"], hi: false },
            ].map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col p-7 sm:p-8 ${
                  p.hi
                    ? "rounded-3xl border border-brand-300/90 bg-gradient-to-b from-white to-brand-50/30 shadow-card-luxury ring-2 ring-brand-500/20 transition duration-500 hover:shadow-card-luxury-hover"
                    : cardLuxury
                }`}
              >
                {p.hi ? (
                  <span className="absolute -top-3 left-1/2 z-10 flex w-max -translate-x-1/2 rounded-full bg-gradient-to-l from-brand-600 to-indigo-600 px-4 py-1 text-xs font-extrabold text-white shadow-md">
                    الأكثر شعبية
                  </span>
                ) : null}
                <h3 className="text-lg font-extrabold text-slate-900">{p.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{p.desc}</p>
                <p className="mt-6">
                  <span className="text-4xl font-black text-slate-900">{p.price}</span>
                  <span className="ms-1 text-sm font-semibold text-slate-500">دج / شهر</span>
                </p>
                <ul className="mt-6 flex flex-1 flex-col gap-2.5 text-sm text-slate-700">
                  {p.feat.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <IconCheck className="size-3" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={p.hi ? btnPricingFeatured : btnPricingOutline}>
                  اختر {p.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* —— CTA —— */}
      <section className="bg-white py-16 sm:py-20" aria-labelledby="cta-title">
        <div className={container}>
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-gradient-to-l from-slate-950 via-brand-900 to-indigo-950 px-6 py-14 text-center shadow-[0_32px_80px_-24px_rgba(15,23,42,0.35),0_0_0_1px_rgba(255,255,255,0.06)_inset] sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -start-20 top-0 h-64 w-64 rounded-full bg-brand-500/25 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -end-16 bottom-0 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl" aria-hidden />
            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 id="cta-title" className="text-3xl font-black text-white sm:text-4xl">
                {homepageContent?.ctaTitle || "جاهز لخطوة أدبية أوضح؟"}
              </h2>
              <p className="mt-4 text-pretty text-slate-200 sm:text-lg">
                {homepageContent?.ctaSubtitle ||
                  `انضمّ إلى yanfa3 Education وخذ نفسًا عميقًا في الأدب العربي — مع الأستاذ ${TEACHER_NAME} كمرجعك الأول في المسار.`}
              </p>
              <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link href="/register" className={btnHeroPrimaryWide}>
                  إنشاء حساب
                </Link>
                <Link href="/courses" className={btnHeroGhostWide}>
                  تصفح الدورات
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* —— Footer —— */}
      <footer id="contact" className="border-t border-slate-200 bg-slate-100/90">
        <div className={`${container} py-12 sm:py-14`}>
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-8">
            <div className="max-w-md">
              <Link
                href="/"
                aria-label={BRAND_NAME}
                className="inline-flex items-center gap-3 text-lg font-extrabold text-slate-900 no-underline hover:opacity-90"
              >
                <BrandLogoFull variant="toolbar" />
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                {homepageContent?.supportText ||
                  `أكاديمية yanfa3 Education للأدب وعلومه — بإشراف الأستاذ ${TEACHER_NAME}. نركّز على الوضوح، والعمق، واللغة الأدبية الراقية.`}
              </p>
              <p className="mt-4 text-sm text-slate-600">
                تواصل:{" "}
                <a href="mailto:contact@maerifah.app" className="font-semibold text-brand-700 no-underline hover:underline">
                  contact@maerifah.app
                </a>
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold" aria-label="روابط التذييل">
              {[
                { href: "/#hero", label: "الرئيسية" },
                { href: "/courses", label: "الدورات" },
                { href: "/#pricing", label: "الأسعار" },
                { href: "/login", label: "تسجيل الدخول" },
                { href: "/register", label: "إنشاء حساب" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-slate-600 no-underline transition-colors hover:text-brand-700">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-8 text-center text-xs text-slate-500 sm:flex-row sm:text-start">
            <p className="text-slate-500">
              <span dir="ltr" className="tabular-nums text-slate-600">
                © {new Date().getFullYear()} {BRAND_NAME}
              </span>{" "}
              — جميع الحقوق محفوظة.
            </p>
            <p className="text-slate-400">{settings?.footerText || homepageContent?.footerText || "صُممت لتكريس الدرس الأدبي العربي."}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
