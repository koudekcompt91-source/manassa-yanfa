"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  Award,
  MessageCircle,
  PlayCircle,
  Video,
  Wallet,
} from "lucide-react";
import BrandLogoMark from "@/components/brand/BrandLogoMark";
import HeroAmbientLayers from "@/components/home/HeroAmbientLayers";
import { useHeroAmbient } from "@/components/home/useHeroAmbient";
import { BRAND_NAME } from "@/lib/brand";
import { easePremium } from "./authFieldTokens";

export { easePremium, inputFocus, inputFocusLight } from "./authFieldTokens";

type AuthPageShellProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  mode?: "default" | "split" | "light-edu";
  brandHeadline?: string;
  brandSubtitle?: string;
  brandFeatures?: string[];
};

export default function AuthPageShell({
  children,
  title,
  subtitle,
  mode = "default",
  brandHeadline = "مرحبًا بك في منصة ينفع",
  brandSubtitle = "تابع الدروس، الحصص المباشرة، الاختبارات، التقدم، والشهادات من مكان واحد.",
  brandFeatures = ["الدروس المسجلة", "الحصص المباشرة", "الواجبات والاختبارات", "متابعة التقدم", "شهادات الإتمام"],
}: AuthPageShellProps) {
  const { nudge, scrollShift, motionOk } = useHeroAmbient("auth-atmosphere", true);

  if (mode === "light-edu") {
    return (
      <div id="auth-atmosphere" className="relative min-h-screen overflow-hidden bg-[#f8fafc] text-slate-900">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_85%_24%,rgba(14,165,233,0.12),transparent_34%),radial-gradient(circle_at_62%_88%,rgba(139,92,246,0.1),transparent_32%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.32]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.14) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
          aria-hidden
        />

        <header className="relative z-10 border-b border-slate-200/80 bg-white/88 backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
            <Link href="/" aria-label={BRAND_NAME} className="inline-flex rounded-xl px-1 py-1 no-underline hover:bg-slate-50">
              <BrandLogoMark variant="navPrimary" showWordmark priority />
            </Link>
            <nav className="flex items-center gap-1.5 sm:gap-2">
              <Link href="/" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 no-underline transition-colors hover:bg-slate-100 hover:text-slate-900">
                الرئيسية
              </Link>
              <Link href="/courses" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 no-underline transition-colors hover:bg-slate-100 hover:text-slate-900">
                الدورات
              </Link>
              <Link href="/register" className="rounded-lg bg-gradient-to-l from-brand-600 to-indigo-600 px-3 py-2 text-sm font-bold text-white no-underline shadow-sm transition-[transform,filter] hover:-translate-y-px hover:brightness-105">
                إنشاء حساب
              </Link>
            </nav>
          </div>
        </header>

        <main className="relative z-10 mx-auto flex w-full max-w-7xl items-center px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-7 min-h-[calc(100dvh-4.6rem)]">
          <div className="grid w-full gap-5 lg:grid-cols-[1.02fr_0.98fr] lg:gap-6">
            <section className="order-1 rounded-[2rem] border border-slate-200/95 bg-white p-5 shadow-[0_30px_70px_-36px_rgba(15,23,42,0.3)] sm:p-7 lg:p-9">
              <header>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
                {subtitle ? <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">{subtitle}</p> : null}
              </header>
              <div className="mt-7">{children}</div>
            </section>

            <section className="order-2 rounded-[2rem] border border-slate-200/90 bg-gradient-to-b from-white via-sky-50/45 to-indigo-50/55 p-5 shadow-[0_30px_70px_-34px_rgba(59,130,246,0.26)] sm:p-7 lg:p-8">
              <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.28)] sm:p-5">
                <p className="text-sm font-semibold text-brand-700">Yanfa / منصة ينفع</p>
                <h2 className="mt-2 text-2xl font-black leading-tight text-slate-900 sm:text-[2rem]">{brandHeadline}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">{brandSubtitle}</p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.22)]">
                  <p className="text-xs font-semibold text-slate-500">محفظة آمنة</p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm font-black text-slate-900"><Wallet className="h-4 w-4 text-brand-600" />اشحن رصيدك وتابع عملياتك بسهولة</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.22)]">
                  <p className="text-xs font-semibold text-slate-500">تقدم واضح</p>
                  <p className="mt-2 text-sm font-black text-slate-900">تابع إنجازك داخل الدورات خطوة بخطوة</p>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-2.5 w-2/3 rounded-full bg-gradient-to-l from-brand-600 to-indigo-600" />
                  </div>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.22)]">
                  <p className="text-xs font-semibold text-slate-500">حصص مباشرة</p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-slate-900"><Video className="h-4 w-4 text-emerald-600" />انضم إلى حصص Zoom عند توفرها للمشتركين</p>
                  <span className="mt-2 inline-flex rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-bold text-sky-700">ميزة تعليمية</span>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.22)]">
                  <p className="text-xs font-semibold text-slate-500">شهادات إتمام</p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-slate-900"><Award className="h-4 w-4 text-amber-500" />احصل على شهادة بعد إكمال الدورة</p>
                </article>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {brandFeatures.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_8px_16px_-14px_rgba(15,23,42,0.3)] transition-colors hover:border-brand-200 hover:bg-brand-50/60"
                  >
                    <PlayCircle className="h-3.5 w-3.5 text-brand-600" />
                    {feature}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_8px_16px_-14px_rgba(15,23,42,0.3)]">
                  <MessageCircle className="h-3.5 w-3.5 text-brand-600" />
                  محادثة مع الأستاذ
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_8px_16px_-14px_rgba(15,23,42,0.3)]">
                  <PlayCircle className="h-3.5 w-3.5 text-brand-600" />
                  واجبات واختبارات
                </span>
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  if (mode === "split") {
    return (
      <div
        id="auth-atmosphere"
        className="landing-hero-cinematic relative flex min-h-screen w-full flex-col overflow-hidden bg-slate-950 bg-hero-mesh bg-[length:120%_120%] motion-safe:animate-hero-mesh-flow motion-reduce:animate-none"
      >
        <HeroAmbientLayers motionOk={motionOk} nudge={nudge} scrollShift={scrollShift} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(56,189,248,0.22),transparent_34%),radial-gradient(circle_at_82%_82%,rgba(99,102,241,0.24),transparent_36%),radial-gradient(circle_at_50%_100%,rgba(14,165,233,0.14),transparent_45%)]" aria-hidden />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-1 items-center px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
          <div className="relative grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#030714]/95 via-[#07142d]/96 to-[#0d2452]/95 shadow-[0_45px_120px_-44px_rgba(2,6,23,0.92),0_0_0_1px_rgba(148,163,184,0.1)] lg:min-h-[min(87vh,46rem)] lg:grid-cols-[1.04fr_0.96fr]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.2]" aria-hidden />
            <section className="relative flex flex-col justify-between p-6 text-white sm:p-8 lg:p-10 xl:p-11">
              <div className="pointer-events-none absolute -start-20 -top-16 h-56 w-56 rounded-full bg-brand-500/26 blur-3xl" aria-hidden />
              <div className="pointer-events-none absolute -bottom-20 end-10 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl" aria-hidden />
              <div className="relative z-10">
                <Link
                  href="/"
                  aria-label={BRAND_NAME}
                  className="inline-flex rounded-2xl border border-white/22 bg-white/[0.13] px-4 py-3 shadow-[0_10px_32px_-18px_rgba(15,23,42,0.68)] backdrop-blur-[1px] transition-colors hover:bg-white/[0.18]"
                >
                  <BrandLogoMark variant="authFocal" showWordmark priority />
                </Link>
                <p className="mt-7 text-sm font-semibold tracking-wide text-sky-100">Yanfa / yanfa3 Education / منصة ينفع</p>
                <h2 className="mt-3 max-w-xl text-3xl font-black leading-tight sm:text-4xl lg:text-[2.75rem]">{brandHeadline}</h2>
                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-200 sm:text-base">{brandSubtitle}</p>
              </div>
              <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-2">
                {brandFeatures.map((feature) => (
                  <div
                    key={feature}
                    className="group rounded-2xl border border-white/16 bg-gradient-to-b from-white/[0.2] to-white/[0.07] px-4 py-3.5 text-sm font-semibold text-slate-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16)] transition-[transform,border-color,background-color] hover:-translate-y-px hover:border-white/25 hover:from-white/[0.26] hover:to-white/[0.09]"
                  >
                    {feature}
                  </div>
                ))}
              </div>
              <div className="relative z-10 mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/14 bg-slate-950/30 px-4 py-3">
                  <p className="text-[11px] font-semibold text-slate-300">تجربة متكاملة</p>
                  <p className="mt-1 text-lg font-black text-white">من درس إلى شهادة</p>
                </div>
                <div className="rounded-2xl border border-white/14 bg-slate-950/30 px-4 py-3">
                  <p className="text-[11px] font-semibold text-slate-300">واجهة عربية</p>
                  <p className="mt-1 text-lg font-black text-white">مصممة لـ RTL</p>
                </div>
              </div>
            </section>

            <section className="relative flex items-center border-t border-white/10 bg-gradient-to-b from-white/[0.1] to-white/[0.035] p-5 sm:p-7 lg:border-t-0 lg:border-s lg:border-white/10 lg:p-9">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.12),transparent_34%)]" aria-hidden />
              <div className="relative z-10 mx-auto w-full max-w-[29rem]">
                <Link
                  href="/"
                  className={`mb-5 inline-flex items-center rounded-lg border border-white/18 bg-white/[0.12] px-2.5 py-1.5 text-xs font-semibold text-slate-200 no-underline transition-colors ${easePremium} hover:bg-white/[0.18] hover:text-white`}
                >
                  ← العودة للرئيسية
                </Link>
                <div className="rounded-[1.6rem] border border-white/22 bg-white px-5 py-6 shadow-[0_28px_70px_-30px_rgba(15,23,42,0.5)] sm:px-7 sm:py-8">
                  <header className="text-start">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-[2rem]">{title}</h1>
                    {subtitle ? <p className="mt-2.5 text-sm leading-7 text-slate-600">{subtitle}</p> : null}
                  </header>
                  <div className="mt-7">{children}</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="auth-atmosphere"
      className={`landing-hero-cinematic relative flex min-h-screen w-full flex-col overflow-hidden bg-slate-950 bg-hero-mesh bg-[length:120%_120%] motion-safe:animate-hero-mesh-flow motion-reduce:animate-none`}
    >
      <HeroAmbientLayers motionOk={motionOk} nudge={nudge} scrollShift={scrollShift} />

      <div className="relative z-10 flex min-h-screen w-full flex-1 flex-col items-center px-4 py-11 sm:px-6 sm:py-[4.25rem]">
        <div className="flex w-full max-w-[min(100%,26rem)] flex-col items-stretch sm:max-w-md">
          <div className="motion-safe:animate-hero-rise motion-reduce:animate-none flex flex-col items-center gap-2.5 text-center">
            <Link
              href="/"
              aria-label={BRAND_NAME}
              className={`group inline-flex touch-manipulation items-center justify-center rounded-2xl border border-white/[0.08] bg-[#071225]/68 px-5 py-3.5 shadow-[0_10px_36px_-22px_rgba(0,0,0,0.52)] backdrop-blur-sm transition-[transform,border-color,box-shadow,background-color] ${easePremium} motion-safe:hover:-translate-y-px motion-reduce:hover:translate-y-0 hover:border-white/14 hover:bg-[#071225]/76 hover:shadow-[0_14px_42px_-22px_rgba(0,0,0,0.48)] motion-safe:active:translate-y-0 motion-safe:active:scale-[0.992] motion-reduce:active:scale-100 active:duration-[180ms] active:ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/32 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950`}
            >
              <BrandLogoMark variant="authFocal" showWordmark priority />
            </Link>
            <Link
              href="/"
              className={`inline-flex touch-manipulation items-center justify-center rounded-lg px-2 py-1 text-xs font-medium tracking-wide text-slate-400 no-underline transition-[color,transform,background-color,box-shadow] ${easePremium} hover:bg-white/[0.04] hover:text-slate-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06)] motion-safe:hover:-translate-y-px motion-reduce:hover:translate-y-0 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98] motion-reduce:active:scale-100 active:duration-[180ms] active:ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/35 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950`}
            >
              ← العودة للرئيسية
            </Link>
          </div>

          <div
            className="motion-safe:animate-hero-rise motion-reduce:animate-none relative mt-8 overflow-hidden rounded-[1.65rem] border border-white/[0.085] bg-[#071225]/[0.8] px-5 py-7 shadow-[0_22px_56px_-24px_rgba(0,0,0,0.48)] ring-1 ring-inset ring-white/[0.035] backdrop-blur-sm motion-reduce:backdrop-blur-none sm:mt-9 sm:rounded-2xl sm:px-6 sm:py-8 lg:rounded-[1.35rem] lg:px-7 lg:py-9"
            style={{ animationDelay: "0.08s" }}
          >
            <header className="text-center">
              <h1 className="text-balance text-2xl font-black leading-[1.12] tracking-tight text-white [text-shadow:0_1px_18px_rgba(0,0,0,0.5)] sm:text-3xl sm:leading-[1.12]">
                {title}
              </h1>
              {subtitle ? (
                <p className="mx-auto mt-3 max-w-[30ch] text-pretty text-sm font-normal leading-[1.78] text-slate-200/85 sm:mt-3.5 sm:max-w-none sm:text-[0.9375rem] sm:leading-[1.78]">
                  {subtitle}
                </p>
              ) : null}
            </header>
            <div className="relative mt-6 sm:mt-7">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
