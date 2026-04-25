"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import BrandLogoMark from "@/components/brand/BrandLogoMark";

function fmtDate(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("ar-DZ");
  } catch {
    return "-";
  }
}

export default function StudentCertificatePage() {
  const params = useParams();
  const code = decodeURIComponent(String(params?.certificateCode || ""));
  const [state, setState] = useState({ loading: true, certificate: null, error: "" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/certificates/${encodeURIComponent(code)}`, {
          cache: "no-store",
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !data?.ok) {
          setState({ loading: false, certificate: null, error: data?.message || "تعذّر تحميل الشهادة." });
          return;
        }
        setState({ loading: false, certificate: data.certificate || null, error: "" });
      } catch {
        if (!cancelled) setState({ loading: false, certificate: null, error: "تعذّر تحميل الشهادة." });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  const certificate = state.certificate;
  const verificationPath = useMemo(
    () => (certificate?.certificateCode ? `/verify-certificate/${encodeURIComponent(certificate.certificateCode)}` : "#"),
    [certificate?.certificateCode]
  );

  if (state.loading) return <div className="mx-auto max-w-5xl p-6 text-sm text-slate-600">جاري تحميل الشهادة...</div>;
  if (state.error || !certificate) return <div className="mx-auto max-w-5xl p-6 text-sm text-red-700">{state.error || "الشهادة غير متاحة."}</div>;

  return (
    <section className="mx-auto max-w-5xl space-y-4 px-4 py-6 print:space-y-0 print:px-0 print:py-0">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Link href="/dashboard" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 no-underline">
          العودة للوحة الطالب
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white"
        >
          تحميل الشهادة
        </button>
      </div>

      <article dir="rtl" className="overflow-hidden rounded-3xl border-[8px] border-brand-100 bg-white shadow-xl print:rounded-none print:border-0 print:shadow-none">
        <div className="border-b border-brand-100 bg-gradient-to-l from-brand-50 to-white px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <BrandLogoMark variant="footer" showWordmark className="justify-center" />
            <p className="text-xs font-bold text-slate-600">Yanfa Education | منصة ينفع</p>
          </div>
        </div>

        <div className="space-y-6 px-8 py-8 text-center">
          <h1 className="text-4xl font-black tracking-wide text-slate-900">شهادة إتمام</h1>
          <p className="text-base text-slate-700">تشهد منصة ينفع بأن الطالب</p>
          <p className="text-3xl font-extrabold text-brand-700">{certificate.studentName}</p>
          <p className="text-base text-slate-700">قد أتم بنجاح دورة</p>
          <p className="text-2xl font-black text-slate-900">{certificate.courseTitle}</p>
          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-700 sm:grid-cols-2">
            <p>
              <span className="font-bold">تاريخ الإصدار:</span> {fmtDate(certificate.issuedAt)}
            </p>
            <p>
              <span className="font-bold">رقم الشهادة:</span> {certificate.certificateCode}
            </p>
            <p>
              <span className="font-bold">اسم الأستاذ:</span> {certificate.teacherName || "يوسف مادن"}
            </p>
            <p>
              <span className="font-bold">التحقق من الشهادة:</span>{" "}
              <a href={verificationPath} target="_blank" rel="noreferrer" className="text-brand-700 underline">
                {verificationPath}
              </a>
            </p>
          </div>

          <div className="flex items-end justify-between border-t border-slate-200 pt-6 text-sm text-slate-600">
            <div className="text-start">
              <p className="font-bold">توقيع</p>
              <p className="mt-2">إدارة منصة ينفع</p>
            </div>
            <div className="text-end">
              <p className="font-bold">الحالة</p>
              <p className={`mt-2 ${certificate.status === "ACTIVE" ? "text-emerald-700" : "text-rose-700"}`}>
                {certificate.status === "ACTIVE" ? "شهادة صالحة" : "تم إلغاء هذه الشهادة"}
              </p>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
