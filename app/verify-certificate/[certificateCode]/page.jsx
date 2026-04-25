"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

function fmtDate(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("ar-DZ");
  } catch {
    return "-";
  }
}

export default function VerifyCertificatePage() {
  const params = useParams();
  const code = decodeURIComponent(String(params?.certificateCode || ""));
  const [state, setState] = useState({ loading: true, data: null, error: "" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/certificates/verify/${encodeURIComponent(code)}`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || data?.ok === false) {
          setState({ loading: false, data: null, error: data?.message || "تعذّر التحقق من الشهادة." });
          return;
        }
        setState({ loading: false, data, error: "" });
      } catch {
        if (!cancelled) setState({ loading: false, data: null, error: "تعذّر التحقق من الشهادة." });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (state.loading) return <div className="container-page py-10 text-sm text-slate-600">جاري التحقق من الشهادة...</div>;
  if (state.error) return <div className="container-page py-10 text-sm text-red-700">{state.error}</div>;

  const data = state.data || {};
  const valid = Boolean(data.valid);

  return (
    <section className="container-page py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900">التحقق من الشهادة</h1>
        <p className={`mt-3 text-lg font-bold ${valid ? "text-emerald-700" : "text-rose-700"}`}>
          {valid ? "شهادة صالحة" : "شهادة غير صالحة"}
        </p>

        {data.certificateCode ? (
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p><span className="font-bold">رقم الشهادة:</span> {data.certificateCode}</p>
            <p><span className="font-bold">الطالب:</span> {data.studentName}</p>
            <p><span className="font-bold">الدورة:</span> {data.courseTitle}</p>
            <p><span className="font-bold">تاريخ الإصدار:</span> {fmtDate(data.issuedAt)}</p>
            <p><span className="font-bold">المنصة:</span> منصة ينفع / Yanfa Education</p>
            {!valid && data.status === "REVOKED" ? <p className="font-semibold text-rose-700">تم إلغاء هذه الشهادة</p> : null}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-600">لم يتم العثور على شهادة بهذا الرمز.</p>
        )}

        <div className="mt-6">
          <Link href="/" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 no-underline">
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </section>
  );
}
