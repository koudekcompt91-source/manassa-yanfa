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
};

export default function AuthPageShell({ children, title, subtitle }: AuthPageShellProps) {
  const { nudge, scrollShift, motionOk } = useHeroAmbient("auth-atmosphere", true);

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
