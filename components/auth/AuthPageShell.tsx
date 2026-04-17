"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import BrandLogoMark from "@/components/brand/BrandLogoMark";
import HeroAmbientLayers from "@/components/home/HeroAmbientLayers";
import { useHeroAmbient } from "@/components/home/useHeroAmbient";
import { BRAND_NAME } from "@/lib/brand";

type AuthPageShellProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
};

/** Light surfaces (legacy / other forms) */
export const inputFocusLight =
  "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25";

/** Dark premium auth fields — matches homepage focus language */
export const inputFocus =
  "focus:border-brand-400/90 focus:outline-none focus:ring-2 focus:ring-brand-400/25 focus:ring-offset-0";

/** Primary settle curve — inputs, panels, links (GPU-friendly props only) */
export const easePremium = "duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

export default function AuthPageShell({ children, title, subtitle }: AuthPageShellProps) {
  const { nudge, scrollShift, motionOk } = useHeroAmbient("auth-atmosphere", true);

  return (
    <div
      id="auth-atmosphere"
      className={`landing-hero-cinematic relative flex min-h-screen w-full flex-col overflow-hidden bg-slate-950 bg-hero-mesh bg-[length:120%_120%] motion-safe:animate-hero-mesh-flow motion-reduce:animate-none`}
    >
      <HeroAmbientLayers motionOk={motionOk} nudge={nudge} scrollShift={scrollShift} />

      <div className="relative z-10 flex min-h-screen w-full flex-1 flex-col items-center px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex w-full max-w-[min(100%,26rem)] flex-col items-stretch sm:max-w-md">
          <div className="motion-safe:animate-hero-rise motion-reduce:animate-none flex flex-col items-center gap-3 text-center">
            <Link
              href="/"
              aria-label={BRAND_NAME}
              className={`group inline-flex touch-manipulation items-center justify-center rounded-2xl border border-white/10 bg-[#071225]/70 px-5 py-3.5 shadow-[0_12px_40px_-22px_rgba(0,0,0,0.55)] backdrop-blur-sm transition-[transform,border-color,box-shadow,background-color] ${easePremium} motion-safe:hover:-translate-y-px motion-reduce:hover:translate-y-0 hover:border-white/16 hover:bg-[#071225]/78 hover:shadow-[0_16px_44px_-20px_rgba(0,0,0,0.5)] motion-safe:active:translate-y-0 motion-safe:active:scale-[0.992] motion-reduce:active:scale-100 active:duration-[180ms] active:ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/35 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950`}
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
            className="motion-safe:animate-hero-rise motion-reduce:animate-none relative mt-9 overflow-hidden rounded-[1.65rem] border border-white/[0.09] bg-[#071225]/[0.82] px-5 py-7 shadow-[0_18px_48px_-18px_rgba(0,0,0,0.5)] ring-1 ring-inset ring-white/[0.04] backdrop-blur-sm motion-reduce:backdrop-blur-none sm:mt-10 sm:rounded-2xl sm:px-6 sm:py-8 lg:rounded-[1.35rem] lg:px-7 lg:py-9"
            style={{ animationDelay: "0.08s" }}
          >
            <header className="text-center">
              <h1 className="text-balance text-2xl font-black leading-[1.12] tracking-tight text-white [text-shadow:0_1px_20px_rgba(0,0,0,0.55)] sm:text-3xl sm:leading-[1.12]">
                {title}
              </h1>
              {subtitle ? (
                <p className="mx-auto mt-3 max-w-[26ch] text-pretty text-sm font-normal leading-[1.78] text-slate-200/88 sm:mt-4 sm:max-w-none sm:text-[0.9375rem] sm:leading-[1.78]">
                  {subtitle}
                </p>
              ) : null}
            </header>
            <div className="relative mt-7 sm:mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
