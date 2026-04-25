"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

function fmtDate(iso) {
  if (!iso) return "بدون تاريخ";
  try {
    return new Date(iso).toLocaleString("ar-DZ");
  } catch {
    return "بدون تاريخ";
  }
}

function statusLabel(status) {
  if (status === "CORRECTED") return "مصحح";
  if (status === "PENDING_CORRECTION") return "في انتظار التصحيح";
  if (status === "SUBMITTED") return "تم الإرسال";
  return "لم يتم الحل";
}

export default function CourseAssessmentsPanel({ courseSlug, authedStudent, canAccess, onProgressChange }) {
  const [state, setState] = useState({ loading: true, rows: [], error: "" });
  const [activeAssessmentId, setActiveAssessmentId] = useState("");
  const [detail, setDetail] = useState({ loading: false, error: "", assessment: null, questions: [], submission: null, canSubmit: true });
  const [draftAnswers, setDraftAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const loadList = useCallback(async () => {
    if (!courseSlug || !authedStudent || !canAccess) return;
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const res = await fetch(`/api/courses/${encodeURIComponent(courseSlug)}/assessments`, { cache: "no-store", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setState({ loading: false, rows: [], error: data?.message || "تعذّر تحميل الواجبات والاختبارات." });
        return;
      }
      const rows = Array.isArray(data.assessments) ? data.assessments : [];
      setState({ loading: false, rows, error: "" });
      if (!activeAssessmentId && rows[0]?.id) setActiveAssessmentId(rows[0].id);
    } catch {
      setState({ loading: false, rows: [], error: "تعذّر تحميل الواجبات والاختبارات." });
    }
  }, [activeAssessmentId, authedStudent, canAccess, courseSlug]);

  const loadDetail = useCallback(async () => {
    if (!courseSlug || !activeAssessmentId || !authedStudent || !canAccess) return;
    setDetail((s) => ({ ...s, loading: true, error: "" }));
    try {
      const res = await fetch(`/api/courses/${encodeURIComponent(courseSlug)}/assessments/${activeAssessmentId}`, { cache: "no-store", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setDetail({ loading: false, error: data?.message || "تعذّر تحميل تفاصيل التقييم.", assessment: null, questions: [], submission: null, canSubmit: false });
        return;
      }
      setDetail({
        loading: false,
        error: "",
        assessment: data.assessment,
        questions: Array.isArray(data.questions) ? data.questions : [],
        submission: data.submission || null,
        canSubmit: Boolean(data.canSubmit),
      });
      if (!data.submission) {
        setDraftAnswers({});
      }
    } catch {
      setDetail({ loading: false, error: "تعذّر تحميل تفاصيل التقييم.", assessment: null, questions: [], submission: null, canSubmit: false });
    }
  }, [activeAssessmentId, authedStudent, canAccess, courseSlug]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const submit = async () => {
    if (!detail.assessment || submitting || !detail.canSubmit) return;
    setSubmitting(true);
    try {
      const answers = Object.entries(draftAnswers).map(([questionId, answer]) => ({ questionId, answer }));
      const res = await fetch(`/api/courses/${encodeURIComponent(courseSlug)}/assessments/${detail.assessment.id}/submit`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setDetail((s) => ({ ...s, error: data?.message || "تعذّر إرسال الإجابات." }));
        return;
      }
      await loadList();
      await loadDetail();
      if (typeof onProgressChange === "function") onProgressChange();
    } finally {
      setSubmitting(false);
    }
  };

  const selected = useMemo(() => state.rows.find((row) => row.id === activeAssessmentId) || null, [activeAssessmentId, state.rows]);

  if (!authedStudent) {
    return (
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
        يلزم تسجيل الدخول كطالب للوصول إلى الواجبات والاختبارات.
        <div className="mt-2">
          <Link href="/login" className="font-bold text-brand-700 underline">تسجيل الدخول</Link>
        </div>
      </div>
    );
  }

  if (!canAccess) {
    return <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">هذه الميزة متاحة فقط للمشتركين في الدورة.</p>;
  }

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <h3 className="px-2 text-sm font-extrabold text-slate-900">الواجبات والاختبارات</h3>
        {state.loading ? <p className="px-2 py-3 text-sm text-slate-500">جاري التحميل...</p> : null}
        {state.error ? <p className="mx-2 mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{state.error}</p> : null}
        {!state.loading && !state.rows.length ? <p className="px-2 py-3 text-sm text-slate-500">لا توجد عناصر منشورة حاليًا.</p> : null}
        <div className="mt-2 space-y-2">
          {state.rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setActiveAssessmentId(row.id)}
              className={`w-full rounded-xl border px-3 py-2 text-start text-sm ${activeAssessmentId === row.id ? "border-brand-500 bg-brand-50/40" : "border-slate-200 bg-slate-50/40 hover:bg-slate-50"}`}
            >
              <p className="font-bold text-slate-900">{row.title}</p>
              <p className="mt-1 text-[11px] text-slate-500">{row.type === "QUIZ" ? "اختبار" : "واجب"} - {fmtDate(row.dueDate)}</p>
              <p className="mt-1 text-[11px] text-slate-500">{statusLabel(row.mySubmission?.status || "")}</p>
              {row.mySubmission ? <p className="mt-1 text-[11px] font-semibold text-brand-700">النتيجة: {row.mySubmission.score}/{row.mySubmission.maxScore}</p> : null}
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {!selected ? <p className="text-sm text-slate-500">اختر اختبارًا أو واجبًا لعرضه.</p> : null}
        {selected && detail.loading ? <p className="text-sm text-slate-500">جاري التحميل...</p> : null}
        {selected && detail.error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{detail.error}</p> : null}
        {selected && !detail.loading && detail.assessment ? (
          <div className="space-y-3">
            <header className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <h4 className="text-lg font-extrabold text-slate-900">{detail.assessment.title}</h4>
              <p className="mt-1 text-sm text-slate-600">{detail.assessment.description || "بدون وصف."}</p>
              <p className="mt-1 text-xs text-slate-500">الموعد: {fmtDate(detail.assessment.dueDate)} - النوع: {detail.assessment.type === "QUIZ" ? "اختبار" : "واجب"}</p>
              {detail.submission ? <p className="mt-1 text-xs font-semibold text-brand-700">الحالة: {statusLabel(detail.submission.status)} - النتيجة: {detail.submission.score}/{detail.submission.maxScore}</p> : <p className="mt-1 text-xs text-slate-500">الحالة: لم يتم الحل</p>}
            </header>

            <div className="space-y-3">
              {detail.questions.map((q, idx) => (
                <article key={q.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="font-bold text-slate-900">{idx + 1}. {q.questionText}</p>
                  <p className="mt-1 text-xs text-slate-500">النقاط: {q.points}</p>
                  {detail.canSubmit ? (
                    <div className="mt-2">
                      {q.type === "MULTIPLE_CHOICE" ? (
                        <div className="space-y-2">
                          {(Array.isArray(q.options) ? q.options : []).map((opt, i) => (
                            <label key={`${q.id}-${i}`} className="flex items-center gap-2 text-sm text-slate-700">
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                checked={Number(draftAnswers[q.id]?.selectedOption) === i}
                                onChange={() => setDraftAnswers((s) => ({ ...s, [q.id]: { selectedOption: i } }))}
                              />
                              <span>{String(opt)}</span>
                            </label>
                          ))}
                        </div>
                      ) : q.type === "TRUE_FALSE" ? (
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setDraftAnswers((s) => ({ ...s, [q.id]: { value: true } }))} className={`rounded-lg px-3 py-1.5 text-sm ${draftAnswers[q.id]?.value === true ? "bg-brand-600 text-white" : "border border-slate-200"}`}>صح</button>
                          <button type="button" onClick={() => setDraftAnswers((s) => ({ ...s, [q.id]: { value: false } }))} className={`rounded-lg px-3 py-1.5 text-sm ${draftAnswers[q.id]?.value === false ? "bg-brand-600 text-white" : "border border-slate-200"}`}>خطأ</button>
                        </div>
                      ) : (
                        <textarea
                          rows={3}
                          value={draftAnswers[q.id]?.text || ""}
                          onChange={(e) => setDraftAnswers((s) => ({ ...s, [q.id]: { text: e.target.value } }))}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                          placeholder="اكتب إجابتك..."
                        />
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <p>تم الإرسال.</p>
                      <p className="mt-1 text-xs">
                        النقاط الممنوحة: {q.id ? (detail.submission?.answers?.find((a) => a.questionId === q.id)?.pointsAwarded ?? 0) : 0}
                      </p>
                      {detail.submission?.answers?.find((a) => a.questionId === q.id)?.correctionNote ? (
                        <p className="mt-1 text-xs text-slate-600">ملاحظة المصحح: {detail.submission.answers.find((a) => a.questionId === q.id)?.correctionNote}</p>
                      ) : null}
                    </div>
                  )}
                </article>
              ))}
            </div>

            {detail.canSubmit ? (
              <button
                type="button"
                onClick={() => void submit()}
                disabled={submitting}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {submitting ? "جاري الإرسال..." : "ابدأ"}
              </button>
            ) : null}
            {detail.submission && !detail.canSubmit ? (
              <p className="text-sm font-semibold text-slate-600">
                {detail.submission.status === "PENDING_CORRECTION" ? "في انتظار التصحيح" : "عرض النتيجة"}
              </p>
            ) : null}
            {detail.submission ? <p className="text-sm font-semibold text-brand-700">النتيجة: {detail.submission.score}/{detail.submission.maxScore}</p> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
