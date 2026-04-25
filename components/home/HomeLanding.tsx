"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDemoSection } from "@/lib/demo-store";
import { useHeroAmbient } from "@/components/home/useHeroAmbient";
import HeroAmbientLayers from "@/components/home/HeroAmbientLayers";
import BrandLogoMark from "@/components/brand/BrandLogoMark";
import { BRAND_NAME } from "@/lib/brand";

const container = "container-landing";

/** Minimal luxury: soft out-ease, slightly longer settle — GPU-friendly props only */
const easeTactile = "duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

const pillCtaClass =
  `inline-flex touch-manipulation items-center justify-center rounded-2xl bg-gradient-to-l from-brand-600 to-indigo-600 px-6 py-3 text-sm font-extrabold text-white shadow-tactile-brand ring-1 ring-white/20 transition-[transform,filter,box-shadow,ring-color] ${easeTactile} motion-safe:hover:-translate-y-px motion-reduce:hover:translate-y-0 hover:brightness-[1.015] hover:ring-white/28 hover:shadow-[0_12px_36px_-14px_rgba(24,117,245,0.28)] motion-safe:active:translate-y-0 motion-safe:active:scale-[0.989] motion-reduce:active:scale-100 active:duration-[180ms] ease-out`;

const btnHeroPrimary =
  `inline-flex min-h-[3rem] touch-manipulation items-center justify-center rounded-2xl bg-white px-7 py-3.5 text-base font-extrabold text-slate-900 shadow-[0_1px_0_0_rgba(255,255,255,0.9)_inset,0_10px_28px_-8px_rgba(15,23,42,0.22)] ring-1 ring-white/50 transition-[transform,box-shadow,filter,background-color,ring-color] ${easeTactile} motion-safe:hover:-translate-y-px motion-reduce:hover:translate-y-0 hover:bg-white hover:ring-white/58 hover:shadow-[0_14px_40px_-16px_rgba(15,23,42,0.26)] hover:brightness-[1.01] motion-safe:active:translate-y-0 motion-safe:active:scale-[0.989] motion-reduce:active:scale-100 active:duration-[180ms] ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60`;

const btnHeroGhost =
  `inline-flex min-h-[3rem] touch-manipulation items-center justify-center rounded-2xl border-2 border-white/45 bg-slate-950 px-7 py-3.5 text-base font-bold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),0_10px_32px_-8px_rgba(0,0,0,0.55)] transition-[transform,border-color,background-color,box-shadow] ${easeTactile} motion-safe:hover:-translate-y-px motion-reduce:hover:translate-y-0 hover:border-white/55 hover:bg-slate-900 hover:shadow-[0_12px_36px_-8px_rgba(0,0,0,0.6)] motion-safe:active:translate-y-0 motion-safe:active:scale-[0.989] motion-reduce:active:scale-100 active:duration-[180ms] ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60`;

const btnHeroBrand =
  `inline-flex min-h-[3rem] touch-manipulation items-center justify-center rounded-2xl border border-white/22 bg-gradient-to-l from-brand-600 to-indigo-700 px-7 py-3.5 text-base font-bold text-white shadow-[0_1px_0_0_rgba(255,255,255,0.22)_inset,0_14px_36px_-8px_rgba(24,117,245,0.5)] ring-1 ring-white/28 transition-[transform,filter,box-shadow,ring-color] ${easeTactile} motion-safe:hover:-translate-y-px motion-reduce:hover:translate-y-0 hover:ring-white/38 hover:shadow-[0_18px_48px_-10px_rgba(24,117,245,0.45)] hover:brightness-[1.02] motion-safe:active:translate-y-0 motion-safe:active:scale-[0.989] motion-reduce:active:scale-100 active:duration-[180ms] ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-200/50`;

const btnHeroPrimaryWide = btnHeroPrimary.replace("px-7", "px-8");
const btnHeroGhostWide = btnHeroGhost.replace("px-7", "px-8");

/** Light sections */
const btnLightSolid =
  "inline-flex touch-manipulation items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-extrabold text-white shadow-tactile ring-1 ring-white/10 transition duration-[320ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:bg-slate-800 active:scale-[0.992] motion-reduce:active:scale-100";

const btnLightGhost =
  "inline-flex touch-manipulation items-center justify-center rounded-2xl border border-white/22 bg-white/5 px-6 py-3 text-sm font-bold text-white shadow-tactile-ghost backdrop-blur-sm transition duration-[320ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:bg-white/10 active:scale-[0.992] motion-reduce:active:scale-100";

const btnMutedOutline =
  "inline-flex touch-manipulation items-center justify-center rounded-2xl border border-slate-200/95 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-slate-900/[0.04] transition duration-[320ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:border-brand-200/90 hover:bg-gradient-to-b hover:from-brand-50/80 hover:to-white hover:shadow-card-luxury active:scale-[0.992] motion-reduce:active:scale-100";

const cardLuxury =
  "touch-manipulation rounded-3xl border border-slate-200/70 bg-gradient-to-b from-white via-white to-slate-50/80 shadow-card-luxury transition duration-[480ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:border-brand-200/60 hover:shadow-card-luxury-hover active:scale-[0.997] motion-reduce:active:scale-100";

const cardLuxuryFlat =
  "touch-manipulation rounded-2xl border border-slate-200/75 bg-white/95 shadow-[0_1px_0_0_rgba(255,255,255,0.92)_inset,0_8px_28px_-10px_rgba(15,23,42,0.07),0_0_0_1px_rgba(148,163,184,0.09)] transition duration-[380ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:border-brand-200/55 hover:shadow-card-luxury active:scale-[0.997] motion-reduce:active:scale-100";

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
    <div className={`relative mx-auto w-full ${isHero ? "" : "max-w-sm"}`}>
      <div
        className={`pointer-events-none absolute rounded-full bg-gradient-to-br from-brand-500/40 via-indigo-500/28 to-teal-400/18 blur-3xl motion-safe:animate-soft-glow motion-reduce:animate-none motion-reduce:opacity-[0.68] ${
          isHero ? "-inset-10 sm:-inset-16" : "-inset-6"
        }`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute rounded-full bg-gradient-to-tl from-sky-400/15 via-transparent to-transparent blur-3xl motion-safe:animate-ambient-drift motion-reduce:animate-none ${
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
        className={`relative overflow-hidden rounded-[2.15rem] border border-white/14 bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-transparent shadow-portrait-halo backdrop-blur-sm sm:rounded-[2.45rem] ${
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
        <div className="pointer-events-none absolute inset-x-8 top-2 z-20 h-px rounded-full bg-gradient-to-l from-transparent via-white/22 to-transparent blur-sm" aria-hidden />

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
              sizes={isHero ? "(max-width: 640px) 90vw, (max-width: 1024px) 50vw, (max-width: 1536px) 42vw, 38rem" : "(max-width: 768px) 100vw, 320px"}
              className={`relative z-[1] h-auto w-full object-cover transition duration-[900ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                isHero
                  ? "object-[center_18%] scale-[1.001] sm:object-[center_16%] lg:scale-[1.002]"
                  : "object-[center_20%] scale-[1.001]"
              }`}
            />
          </div>

          {/* Bottom merge into hero — weighted low so the face stays clean */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[min(46%,16rem)] bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_95%_55%_at_50%_0%,rgba(255,255,255,0.035),transparent_58%)]"
            aria-hidden
          />
        </div>
      </div>
      {isHero ? (
        <div className="pointer-events-none absolute -bottom-6 inset-x-4 z-[3] mx-auto max-w-md rounded-2xl border border-white/14 bg-slate-950/90 px-4 py-3.5 text-center shadow-[0_20px_40px_-14px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-md sm:-bottom-8 sm:px-5">
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
  const featuredCourses = (packages || []).filter((row: { isPublished?: boolean }) => row.isPublished).slice(0, 6);

  const { nudge, scrollShift, motionOk } = useHeroAmbient("hero", authGate === "guest");
  const sectionIoRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (authGate !== "guest") return;
    const setup = () => {
      if (typeof window === "undefined") return;
      sectionIoRef.current?.disconnect();
      sectionIoRef.current = null;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        document.querySelectorAll("[data-section-reveal]").forEach((n) => n.classList.add("section-reveal-visible"));
        return;
      }
      const nodes = document.querySelectorAll("[data-section-reveal]");
      if (!nodes.length) return;
      sectionIoRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("section-reveal-visible");
              sectionIoRef.current?.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
      );
      nodes.forEach((n) => sectionIoRef.current?.observe(n));
    };
    const tid = window.setTimeout(setup, 0);
    return () => {
      clearTimeout(tid);
      sectionIoRef.current?.disconnect();
      sectionIoRef.current = null;
    };
  }, [authGate]);

  if (authGate === "checking") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50 text-slate-600">
        <p className="text-sm font-semibold">جاري التحميل…</p>
      </div>
    );
  }

  const heroTitle = homepageContent?.heroTitle;
  const heroSubtitle = homepageContent?.heroSubtitle;

  const nx = motionOk ? nudge.x : 0;
  const ny = motionOk ? nudge.y : 0;
  const s = scrollShift;

  return (
    <div className="bg-gradient-to-b from-[#eef2f9] via-[#f4f6fb] to-[#f4f6fb] text-slate-900">
      {/* —— Hero —— */}
      <section
        id="hero"
        aria-labelledby="hero-title"
        className="landing-hero-cinematic relative min-h-[min(92svh,58rem)] overflow-hidden border-b border-slate-900/25 bg-slate-950 bg-hero-mesh bg-[length:140%_140%] motion-safe:animate-hero-mesh-flow motion-reduce:animate-none sm:bg-[length:120%_120%]"
      >
        <HeroAmbientLayers motionOk={motionOk} nudge={nudge} scrollShift={scrollShift} />

        <div className={`${container} relative z-10 flex min-h-[inherit] flex-col justify-center pt-[4.5rem] pb-16 sm:pt-24 sm:pb-20 lg:py-28`}>
          <div className="mx-auto grid w-full max-w-[min(100%,80rem)] items-center gap-10 sm:gap-12 lg:grid-cols-12 lg:items-start lg:gap-x-8 lg:gap-y-0 xl:gap-x-12">
            <div className="relative z-[1] order-2 mx-auto w-full max-w-xl text-center lg:order-1 lg:col-span-5 lg:mx-0 lg:max-w-[26rem] lg:justify-self-end lg:pe-6 lg:pt-5 lg:text-start xl:max-w-[28rem] xl:pe-10 xl:pt-6">
              <div className="relative overflow-hidden rounded-[1.65rem] border border-white/[0.09] bg-[#071225]/[0.82] px-5 py-7 shadow-[0_18px_48px_-18px_rgba(0,0,0,0.5)] backdrop-blur-sm motion-reduce:backdrop-blur-none sm:rounded-2xl sm:px-6 sm:py-8 lg:rounded-[1.35rem] lg:px-7 lg:py-9">
                <div className="relative z-[1]">
              <div
                className={`mb-6 inline-flex touch-manipulation items-center gap-2 rounded-full border border-white/14 bg-slate-950/45 px-4 py-2 text-xs font-semibold text-slate-200 shadow-sm sm:text-sm animate-hero-rise transition-[transform,border-color,background-color,box-shadow] ${easeTactile} motion-safe:hover:-translate-y-px motion-reduce:hover:translate-y-0 hover:border-white/22 hover:bg-slate-950/55 hover:shadow-[0_6px_24px_-10px_rgba(0,0,0,0.35)] motion-safe:active:translate-y-0 motion-safe:active:scale-[0.993] motion-reduce:active:scale-100 active:duration-[180ms] ease-out`}
                style={{ animationDelay: "0ms" }}
              >
                <IconSpark className="size-4 shrink-0 text-brand-200" />
                أكاديمية عربية للأدب وعلومه — بإشراف مباشر من الأستاذ {TEACHER_NAME}
              </div>

              <h1
                id="hero-title"
                className="text-balance text-3xl font-black leading-[1.12] tracking-tight text-white [text-shadow:0_1px_20px_rgba(0,0,0,0.55)] sm:text-[2.125rem] sm:leading-[1.12] md:text-5xl md:leading-[1.1] xl:text-[3.35rem] animate-hero-rise"
                style={{ animationDelay: "0.16s" }}
              >
                {heroTitle || (
                  <>
                    تعلّم الأدب العربي{" "}
                    <span className="font-black text-sky-200/95">بطريقة حديثة ومنظمة</span>
                  </>
                )}
              </h1>

              <p
                className="mx-auto mt-7 max-w-xl text-pretty text-base leading-[1.78] text-slate-200/90 sm:mt-8 sm:max-w-2xl sm:text-lg sm:leading-[1.75] lg:mx-0 lg:max-w-none animate-hero-rise"
                style={{ animationDelay: "0.28s" }}
              >
                {heroSubtitle ||
                  "دورات، دروس مسجلة، حصص مباشرة، اختبارات، متابعة للتقدم وشهادات إتمام."}
              </p>

              <div
                className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:mt-11 sm:flex-row sm:flex-wrap sm:justify-start sm:gap-x-3 sm:gap-y-3 animate-hero-rise"
                style={{ animationDelay: "0.4s" }}
              >
                <Link href="/courses" className={btnHeroPrimary}>
                  ابدأ التعلم الآن
                </Link>
                <Link href="/courses" className={btnHeroGhost}>
                  استكشف الدورات
                </Link>
                <Link href="/register" className={btnHeroBrand}>
                  إنشاء حساب
                </Link>
              </div>

              {homeButtons.length ? (
                <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start animate-hero-rise" style={{ animationDelay: "0.5s" }}>
                  {homeButtons.slice(0, 2).map((btn: { id: string; label: string; route: string }) => (
                    <Link
                      key={btn.id}
                      href={btn.route}
                      className={`touch-manipulation rounded-xl border border-white/22 bg-slate-950/55 px-4 py-2 text-xs font-bold text-slate-100 shadow-[0_6px_20px_-10px_rgba(0,0,0,0.4)] transition-[transform,border-color,background-color,box-shadow] ${easeTactile} motion-safe:hover:-translate-y-px motion-reduce:hover:translate-y-0 hover:border-white/32 hover:bg-slate-950/70 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)] motion-safe:active:translate-y-0 motion-safe:active:scale-[0.991] motion-reduce:active:scale-100 active:duration-[180ms] ease-out`}
                    >
                      {btn.label}
                    </Link>
                  ))}
                </div>
              ) : null}

              <div
                className="mt-10 flex flex-wrap items-center justify-center gap-3 border-t border-white/12 pt-8 text-sm text-slate-400 lg:justify-start animate-hero-rise"
                style={{ animationDelay: "0.6s" }}
              >
                {["منهج أدبي واضح", "لغة عربية رصينة", "تجربة تعلّم أنيقة"].map((label) => (
                  <span
                    key={label}
                    className={`inline-flex touch-manipulation items-center gap-2 rounded-full border border-white/14 bg-slate-950/40 px-3 py-1.5 shadow-sm transition-[transform,border-color,background-color,box-shadow] ${easeTactile} motion-safe:hover:-translate-y-px motion-reduce:hover:translate-y-0 hover:border-white/22 hover:bg-slate-950/55 hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.35)] motion-safe:active:translate-y-0 motion-safe:active:scale-[0.993] motion-reduce:active:scale-100 active:duration-[180ms] ease-out`}
                  >
                    <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                      <IconCheck className="size-3" />
                    </span>
                    <span className="font-semibold text-slate-200">{label}</span>
                  </span>
                ))}
              </div>
                </div>
              </div>
            </div>

            <div
              className="order-1 flex w-full justify-center justify-self-center px-1 animate-hero-rise sm:px-0 lg:order-2 lg:col-span-7 lg:max-w-none lg:justify-self-start lg:ps-4 lg:pt-2 xl:ps-8 xl:pt-3"
              style={{ animationDelay: "0.08s" }}
            >
              <div className="w-full max-w-[min(22rem,88vw)] sm:max-w-md md:max-w-lg lg:w-full lg:max-w-[min(36rem,calc(50vw-1.5rem))] xl:max-w-[min(38rem,44vw)]">
                <div
                  className="relative [transform-style:preserve-3d]"
                  style={{
                    transform: motionOk ? `translate3d(${nx * 1.1}px, ${ny * 0.85 + s * -2.5}px, 0)` : undefined,
                    transition: motionOk ? "transform 1.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : undefined,
                    willChange: motionOk ? "transform" : undefined,
                  }}
                >
                  <div
                    className="relative will-change-transform"
                    style={{
                      transform: motionOk ? `perspective(1400px) rotateX(${ny * -0.07}deg) rotateY(${nx * 0.08}deg)` : undefined,
                      transition: motionOk ? "transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : undefined,
                    }}
                  >
                    <TeacherPortrait variant="hero" priority />
                  </div>
                </div>
              </div>
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
      <section data-section-reveal className="border-b border-slate-200/80 bg-white py-16 sm:py-20" aria-labelledby="why-yanfa">
        <div className={container}>
          <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold text-brand-700">مزايا منصة ينفع</p>
            <h2 id="why-yanfa" className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                تجربة تعلّم موثوقة ومتكاملة
            </h2>
            <p className="mt-4 text-pretty text-slate-600 sm:text-lg">
                الدرس المسجّل، الحصة المباشرة، الاختبار، التقدم، الشهادة، والتواصل المباشر — كلها داخل منصة واحدة.
            </p>
          </div>
          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                t: "دروس مسجلة",
                d: "دروس YouTube منظمة داخل الدورة مع ترتيب واضح ومتابعة مستمرة.",
              },
              {
                t: "حصص مباشرة",
                d: "حصص Zoom مباشرة للمشتركين مع متابعة زمنية وتنبيهات داخل المنصة.",
              },
              {
                t: "اختبارات وواجبات",
                d: "تقييمات دورية تساعدك على قياس الفهم وتثبيت المهارات الأدبية.",
              },
              {
                t: "متابعة التقدم",
                d: "لوحة طالب حديثة تعرض نسبة الإنجاز، آخر نشاط، وخطة الاستمرار.",
              },
              {
                t: "شهادات إتمام",
                d: "بعد إكمال الدورة تحصل على شهادة يمكن عرضها والتحقق منها.",
              },
              {
                t: "تواصل مع الأستاذ",
                d: "محادثة مباشرة داخل كل دورة لطرح الأسئلة والمتابعة الأكاديمية.",
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
      <section data-section-reveal className="border-b border-slate-200/80 bg-gradient-to-b from-[#f4f6fb] to-white py-16 sm:py-20" aria-labelledby="what-learn">
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
      <section data-section-reveal className="relative overflow-hidden border-b border-slate-200/80 bg-slate-950 py-16 text-white sm:py-20" aria-labelledby="teacher-yusuf">
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
      <section data-section-reveal className="border-b border-slate-200/80 bg-white py-16 sm:py-20" aria-labelledby="courses-block">
        <div className={container}>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold text-brand-700">الدورات المتاحة</p>
              <h2 id="courses-block" className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
                دورات جاهزة للبدء الآن
              </h2>
              <p className="mt-3 max-w-2xl text-slate-600 sm:text-lg">دورات منشورة تجمع بين الدروس المسجلة والحصص المباشرة والمتابعة الأكاديمية.</p>
            </div>
            <Link href="/courses" className={btnMutedOutline}>
              عرض كل الدورات
            </Link>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(featuredCourses.length ? featuredCourses : []).map((c: { id: string; title: string; description?: string; slug?: string; price?: number; priceMad?: number }) => {
              const slug = String(c.slug || c.id || "").trim();
              const href = slug ? `/packages/${encodeURIComponent(slug)}` : "/courses";
              const price = Number(c.priceMad ?? c.price ?? 0) || 0;
              const isFree = price <= 0;
              return (
                <Link key={c.id} href={href} className={`group flex flex-col p-6 ${cardLuxury}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-brand-700">مع {TEACHER_NAME}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${isFree ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>
                      {isFree ? "مجانية" : "مدفوعة"}
                    </span>
                  </div>
                  <h3 className="mt-2 line-clamp-2 text-lg font-extrabold text-slate-900 group-hover:text-brand-800">{c.title}</h3>
                  <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">{c.description || "دورة أدبية منظمة داخل المنصة."}</p>
                  <p className="mt-3 text-sm font-black text-brand-700">{isFree ? "مجانية" : `${price} دج`}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-brand-700">
                    عرض الدورة
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
      <section data-section-reveal className="border-b border-slate-200/80 bg-slate-50/70 py-16 sm:py-20" aria-labelledby="live-learning">
        <div className={container}>
          <h2 id="live-learning" className="text-center text-3xl font-black text-slate-900 sm:text-4xl">التعلّم المباشر داخل المنصة</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              "دروس مسجلة داخل المنصة عبر YouTube",
              "حصص Zoom مباشرة للمشتركين",
              "إشعارات فورية للتحديثات المهمة",
              "محادثة مباشرة مع الأستاذ داخل الدورة",
            ].map((line) => (
              <div key={line} className={`p-5 ${cardLuxuryFlat}`}>
                <p className="text-sm font-bold text-slate-800">{line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* —— رحلة مختصرة —— */}
      <section data-section-reveal className="border-b border-slate-200/80 bg-[#f4f6fb] py-16 sm:py-20" aria-labelledby="journey">
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
      <section data-section-reveal className="border-b border-slate-200/80 bg-white py-16 sm:py-20" aria-labelledby="voices">
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
                className="flex h-full touch-manipulation flex-col rounded-3xl border border-slate-200/70 bg-gradient-to-b from-slate-50/95 to-white/90 p-6 shadow-card-luxury transition duration-[480ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:border-brand-200/55 hover:shadow-card-luxury-hover active:scale-[0.997] motion-reduce:active:scale-100"
              >
                <blockquote className="flex-1 text-sm leading-relaxed text-slate-800 sm:text-base">«{v.q}»</blockquote>
                <figcaption className="mt-4 text-xs font-bold text-slate-500">{v.who}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* —— CTA —— */}
      <section data-section-reveal className="bg-white py-16 sm:py-20" aria-labelledby="cta-title">
        <div className={container}>
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-gradient-to-l from-slate-950 via-brand-900 to-indigo-950 px-6 py-14 text-center shadow-[0_32px_80px_-24px_rgba(15,23,42,0.35),0_0_0_1px_rgba(255,255,255,0.06)_inset] sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -start-20 top-0 h-64 w-64 rounded-full bg-brand-500/25 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -end-16 bottom-0 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl" aria-hidden />
            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 id="cta-title" className="text-3xl font-black text-white sm:text-4xl">
                {homepageContent?.ctaTitle || "انضم الآن وابدأ رحلتك في الأدب العربي"}
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
                  استكشاف الدورات
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
                className="inline-flex items-center gap-1 text-lg font-extrabold text-slate-900 no-underline transition-opacity duration-200 hover:opacity-90"
              >
                <BrandLogoMark variant="footer" showWordmark />
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
                { href: "/pricing", label: "الأسعار" },
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
