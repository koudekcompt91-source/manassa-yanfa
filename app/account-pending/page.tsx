import Link from "next/link";
import AuthPageShell from "@/components/auth/AuthPageShell";
import { getTeacherTelegramUrl } from "@/lib/teacher-contact";

export const dynamic = "force-dynamic";

export default function AccountPendingPage() {
  const telegramUrl = getTeacherTelegramUrl();

  return (
    <AuthPageShell
      title="حسابك في انتظار التفعيل"
      subtitle="حسابك المدفوع جاهز، وينتظر موافقة الأستاذ."
      mode="light-edu"
      brandHeadline="خطوة واحدة قبل المحتوى المدفوع"
      brandSubtitle="بعد تفعيل حسابك من الأستاذ ستتمكن من تسجيل الدخول والوصول إلى لوحة الحساب الكامل."
      brandFeatures={["حساب مدفوع", "تفعيل يدوي", "تواصل عبر Telegram"]}
    >
      <div className="space-y-5" dir="rtl">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-950">
          <p className="font-extrabold text-base text-amber-950">حسابك في انتظار التفعيل</p>
          <p className="mt-2">تم إنشاء حسابك بنجاح، ولكن حسابك المدفوع يحتاج إلى تفعيل من الأستاذ قبل أن تتمكن من الوصول إلى المحتوى المدفوع.</p>
          <p className="mt-2">لتفعيل حسابك، تواصل مع الأستاذ عبر Telegram.</p>
          <p className="mt-2 text-amber-900/90">بعد أن يقوم الأستاذ بتفعيل حسابك، يمكنك تسجيل الدخول مرة أخرى.</p>
        </div>

        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-l from-sky-500 via-brand-600 to-indigo-700 px-5 text-base font-extrabold text-white no-underline shadow-[0_16px_32px_-12px_rgba(24,117,245,0.5)]"
        >
          تواصل مع الأستاذ
        </a>

        <Link
          href="/login"
          className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-base font-extrabold text-slate-800 no-underline hover:bg-slate-50"
        >
          العودة إلى تسجيل الدخول
        </Link>
      </div>
    </AuthPageShell>
  );
}
