import { easePremium, inputFocus } from "./authFieldTokens";

export const premiumAuthFieldClass =
  `mt-1.5 w-full touch-manipulation rounded-xl border border-white/[0.09] bg-slate-950/35 px-4 py-3 text-start text-base text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] transition-[border-color,background-color,box-shadow,transform,color] ${easePremium} placeholder:text-slate-500/85 placeholder:transition-opacity placeholder:duration-200 placeholder:ease-out hover:border-white/[0.12] hover:bg-slate-950/42 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.042)] motion-safe:active:scale-[0.998] motion-reduce:active:scale-100 active:duration-[180ms] active:ease-out focus-visible:placeholder:opacity-[0.72] ${inputFocus}`;

export const premiumAuthLabelClass =
  `block text-sm font-medium tracking-wide text-slate-300/95 transition-colors ${easePremium} group-hover:text-slate-200/90 group-focus-within:text-slate-100`;

/** Matches homepage `btnHeroBrand` — full-width auth CTA + tactile press */
export const premiumAuthSubmitClass =
  `inline-flex min-h-[3rem] w-full touch-manipulation select-none items-center justify-center rounded-2xl border border-white/22 bg-gradient-to-l from-brand-600 to-indigo-700 px-7 py-3.5 text-base font-bold text-white shadow-[0_1px_0_0_rgba(255,255,255,0.22)_inset,0_14px_36px_-8px_rgba(24,117,245,0.5)] ring-1 ring-white/28 transition-[transform,filter,box-shadow,ring-color,border-color] ${easePremium} motion-safe:hover:-translate-y-px motion-reduce:hover:translate-y-0 hover:ring-white/38 hover:shadow-[0_18px_48px_-10px_rgba(24,117,245,0.45)] hover:brightness-[1.02] motion-safe:active:translate-y-0 motion-safe:active:scale-[0.989] motion-safe:active:brightness-[0.985] motion-reduce:active:scale-100 motion-reduce:active:brightness-100 active:duration-[180ms] active:ease-out disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:brightness-100 disabled:active:brightness-100 disabled:hover:shadow-[0_1px_0_0_rgba(255,255,255,0.22)_inset,0_14px_36px_-8px_rgba(24,117,245,0.5)] disabled:hover:ring-white/28 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-200/50`;

export const premiumAuthFooterLinkClass =
  `inline-flex touch-manipulation items-baseline rounded-sm px-0.5 font-medium text-brand-300/95 no-underline transition-[color,transform,opacity] ${easePremium} motion-safe:hover:text-brand-200 motion-safe:hover:-translate-y-px motion-reduce:hover:translate-y-0 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98] motion-reduce:active:scale-100 active:duration-[180ms] active:ease-out focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-200/45`;

/** Muted footer line under the primary CTA (login ↔ register) */
export const premiumAuthFormFooterClass = "pt-0.5 text-center text-sm text-slate-500";

/** Inline helper / demo strip — same glass language as fields, calmer than the main card */
export const premiumAuthAuxNoteClass =
  `rounded-xl border border-white/[0.07] bg-slate-950/30 px-3.5 py-2.5 text-[0.8125rem] leading-relaxed text-slate-400/95 transition-[border-color,background-color] ${easePremium}`;

/** Error alert surface — shared by login & register */
export const premiumAuthAlertErrorClass =
  "rounded-xl border border-red-400/18 bg-red-950/42 px-3.5 py-2.5 text-sm leading-relaxed text-red-100/92";

/** Success alert surface — register confirmation */
export const premiumAuthAlertSuccessClass =
  "rounded-xl border border-emerald-400/18 bg-emerald-950/36 px-3.5 py-2.5 text-sm leading-relaxed text-emerald-100/92";

/** Divider + spacing for secondary action inside an error alert (e.g. admin portal link) */
export const premiumAuthAlertSecondaryRowClass = "mt-3 border-t border-red-400/15 pt-3 text-center";
