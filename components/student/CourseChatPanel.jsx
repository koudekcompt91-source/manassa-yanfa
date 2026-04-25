"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

function fmt(iso) {
  try {
    return new Date(iso).toLocaleString("ar-DZ");
  } catch {
    return "";
  }
}

export default function CourseChatPanel({
  courseSlug,
  courseTitle,
  teacherName,
  authedStudent,
  canAccessChat,
  myUserId,
}) {
  const [state, setState] = useState({
    loading: true,
    error: "",
    conversation: null,
    messages: [],
  });
  const [sending, setSending] = useState(false);
  const [body, setBody] = useState("");

  const load = useCallback(async () => {
    if (!courseSlug || !authedStudent || !canAccessChat) return;
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const res = await fetch(`/api/courses/${encodeURIComponent(courseSlug)}/chat`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setState({ loading: false, error: data?.message || "تعذّر تحميل المحادثة.", conversation: null, messages: [] });
        return;
      }
      setState({
        loading: false,
        error: "",
        conversation: data.conversation,
        messages: Array.isArray(data.messages) ? data.messages : [],
      });
    } catch {
      setState({ loading: false, error: "تعذّر تحميل المحادثة.", conversation: null, messages: [] });
    }
  }, [authedStudent, canAccessChat, courseSlug]);

  useEffect(() => {
    if (!authedStudent || !canAccessChat) return;
    load();
    const t = window.setInterval(load, 5000);
    return () => window.clearInterval(t);
  }, [authedStudent, canAccessChat, load]);

  const send = useCallback(async () => {
    if (!body.trim() || sending || !courseSlug) return;
    setSending(true);
    try {
      const res = await fetch(`/api/courses/${encodeURIComponent(courseSlug)}/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setState((s) => ({ ...s, error: data?.message || "تعذّر إرسال الرسالة." }));
        return;
      }
      setBody("");
      setState((s) => ({
        ...s,
        error: "",
        messages: [...(s.messages || []), data.message],
        conversation: s.conversation
          ? { ...s.conversation, lastMessageAt: data.message?.createdAt || s.conversation.lastMessageAt }
          : s.conversation,
      }));
    } finally {
      setSending(false);
    }
  }, [body, courseSlug, sending]);

  const closed = state.conversation?.status === "CLOSED";
  const orderedMessages = useMemo(() => (state.messages || []).slice(), [state.messages]);

  if (!authedStudent) {
    return (
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
        يلزم تسجيل الدخول كطالب لبدء المحادثة.
        <div className="mt-2">
          <Link href="/login" className="font-bold text-brand-700 underline">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  if (!canAccessChat) {
    return (
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-semibold text-amber-900">
        هذه المحادثة متاحة فقط للمشتركين في الدورة.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
        <p className="text-sm font-extrabold text-slate-900">المحادثة مع الأستاذ</p>
        <p className="mt-1 text-xs text-slate-600">
          الدورة: {courseTitle} - الأستاذ: {teacherName}
        </p>
      </div>

      {state.loading ? <p className="text-sm text-slate-500">جاري تحميل المحادثة...</p> : null}
      {state.error ? <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p> : null}

      <div className="max-h-[24rem] space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/40 p-3">
        {!state.loading && !orderedMessages.length ? (
          <p className="text-center text-sm text-slate-500">اكتب سؤالك للأستاذ وسيتم الرد عليك هنا</p>
        ) : null}
        {orderedMessages.map((msg) => {
          const mine = String(msg.senderId) === String(myUserId || "");
          return (
            <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <article
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                  mine
                    ? "bg-gradient-to-l from-brand-600 to-indigo-600 text-white"
                    : "border border-slate-200 bg-white text-slate-800"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                <p className={`mt-1 text-[10px] ${mine ? "text-brand-100" : "text-slate-400"}`}>{fmt(msg.createdAt)}</p>
              </article>
            </div>
          );
        })}
      </div>

      {closed ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
          تم إغلاق المحادثة من طرف الإدارة.
        </p>
      ) : null}

      <div className="mt-3 flex gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="اكتب رسالتك هنا..."
          maxLength={1000}
          rows={3}
          disabled={closed || sending}
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={closed || sending || !body.trim()}
          className="h-fit rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {sending ? "..." : "إرسال"}
        </button>
      </div>
    </div>
  );
}
