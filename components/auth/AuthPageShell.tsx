"use client";

import Link from "next/link";
import type { ReactNode } from "react";
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
  mode?: "default" | "split";
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

  if (mode === "split") {
    return (
      <div
        id="auth-atmosphere"
        className="landing-hero-cinematic relative flex min-h-screen w-full flex-col overflow-hidden bg-slate-950 bg-hero-mesh bg-[length:120%_120%] motion-safe:animate-hero-mesh-flow motion-reduce:animate-none"
      >
        <HeroAmbientLayers motionOk={motionOk} nudge={nudge} scrollShift={scrollShift} />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-1 items-stretch px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="grid w-full overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/95 shadow-[0_30px_80px_-32px_rgba(2,6,23,0.65)] lg:grid-cols-2">
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#0b1b3d] to-[#153a84] p-6 text-white sm:p-8 lg:p-10">
              <div className="pointer-events-none absolute -start-14 -top-10 h-48 w-48 rounded-full bg-brand-400/30 blur-3xl" aria-hidden />
              <div className="pointer-events-none absolute -bottom-12 -end-10 h-52 w-52 rounded-full bg-indigo-300/20 blur-3xl" aria-hidden />
              <div className="relative z-10">
                <Link href="/" aria-label={BRAND_NAME} className="inline-flex rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-[1px] transition-colors hover:bg-white/15">
                  <BrandLogoMark variant="authFocal" showWordmark priority />
                </Link>
                <p className="mt-6 text-sm font-semibold text-sky-100">Yanfa / yanfa3 Education / منصة ينفع</p>
                <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">{brandHeadline}</h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200 sm:text-base">{brandSubtitle}</p>
                <div className="mt-8 grid gap-2 sm:grid-cols-2">
                  {brandFeatures.map((feature) => (
                    <div key={feature} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-slate-100">
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="flex items-center bg-gradient-to-b from-slate-50 to-white p-5 sm:p-8 lg:p-10">
              <div className="mx-auto w-full max-w-md">
                <Link
                  href="/"
                  className={`mb-5 inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 no-underline transition-colors ${easePremium} hover:bg-slate-100 hover:text-slate-700`}
                >
                  ← العودة للرئيسية
                </Link>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_34px_-20px_rgba(15,23,42,0.28)] sm:p-7">
                  <header className="text-start">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
                    {subtitle ? <p className="mt-2 text-sm leading-7 text-slate-600">{subtitle}</p> : null}
                  </header>
                  <div className="mt-6">{children}</div>
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
