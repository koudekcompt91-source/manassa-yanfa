"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { AdminActionButton, AdminBadge } from "@/components/admin/AdminUI";

function fmt(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("ar-DZ");
  } catch {
    return "-";
  }
}

export default function AdminDashboardMessagesPage() {
  const searchParams = useSearchParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState("");
  const [detail, setDetail] = useState({ loading: false, conversation: null, messages: [] });
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [flash, setFlash] = useState("");

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/chat/conversations", { credentials: "include", cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setRows([]);
        return;
      }
      const list = Array.isArray(data.conversations) ? data.conversations : [];
      setRows(list);
      if (!activeId && list[0]?.id) setActiveId(list[0].id);
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  const loadDetail = useCallback(async (id) => {
    if (!id) return;
    setDetail((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch(`/api/admin/chat/conversations/${id}`, { credentials: "include", cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setDetail({ loading: false, conversation: null, messages: [] });
        return;
      }
      setDetail({
        loading: false,
        conversation: data.conversation,
        messages: Array.isArray(data.messages) ? data.messages : [],
      });
      await loadConversations();
    } catch {
      setDetail({ loading: false, conversation: null, messages: [] });
    }
  }, [loadConversations]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const fromQuery = String(searchParams?.get("conversation") || "").trim();
    if (fromQuery) setActiveId(fromQuery);
  }, [searchParams]);

  useEffect(() => {
    if (!activeId) return;
    loadDetail(activeId);
    const t = window.setInterval(() => {
      loadConversations();
      loadDetail(activeId);
    }, 5000);
    return () => window.clearInterval(t);
  }, [activeId, loadConversations, loadDetail]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const target = `${row?.course?.title || ""} ${row?.student?.fullName || ""} ${row?.student?.email || ""}`.toLowerCase();
      return target.includes(q);
    });
  }, [query, rows]);

  const activeConversation = detail.conversation;
  const closed = activeConversation?.status === "CLOSED";

  const sendReply = async () => {
    if (!activeId || !reply.trim() || sending) return;
    setSending(true);
    setFlash("");
    try {
      const res = await fetch(`/api/admin/chat/conversations/${activeId}/reply`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setFlash(data?.message || "تعذّر إرسال الرد.");
        return;
      }
      setReply("");
      await loadDetail(activeId);
    } finally {
      setSending(false);
    }
  };

  const setStatus = async (status) => {
    if (!activeId) return;
    await fetch(`/api/admin/chat/conversations/${activeId}/status`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await loadDetail(activeId);
    await loadConversations();
  };

  return (
    <AdminShell title="محادثات الطلاب" subtitle="متابعة رسائل الطلاب داخل الدورات والرد عليها من لوحة الإدارة.">
      <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث باسم الطالب أو الدورة"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          />
          <div className="mt-3 max-h-[34rem] space-y-2 overflow-y-auto">
            {loading ? <p className="text-sm text-slate-500">جاري التحميل...</p> : null}
            {!loading && !filtered.length ? <p className="text-sm text-slate-500">لا توجد محادثات.</p> : null}
            {filtered.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setActiveId(row.id)}
                className={`w-full rounded-xl border px-3 py-3 text-start text-sm ${
                  activeId === row.id ? "border-brand-500 bg-brand-50/50" : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                }`}
              >
                <p className="font-bold text-slate-900">{row.student?.fullName || row.student?.email || "طالب"}</p>
                <p className="mt-0.5 text-xs text-slate-500">{row.course?.title || "دورة"}</p>
                <p className="mt-1 line-clamp-1 text-xs text-slate-600">{row.lastMessage?.body || "لا توجد رسائل بعد."}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{fmt(row.lastMessageAt)}</span>
                  <span className="flex items-center gap-1">
                    {row.unreadCount > 0 ? <AdminBadge tone="warning">رسائل غير مقروءة: {row.unreadCount}</AdminBadge> : null}
                    <AdminBadge tone={row.status === "OPEN" ? "success" : "warning"}>{row.status === "OPEN" ? "مفتوحة" : "مغلقة"}</AdminBadge>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {!activeConversation ? (
            <p className="text-sm text-slate-500">فتح المحادثة من القائمة الجانبية لعرض التفاصيل.</p>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {activeConversation.student?.fullName || activeConversation.student?.email}
                  </h2>
                  <p className="text-xs text-slate-500">
                    الدورة: {activeConversation.course?.title} - آخر رسالة: {fmt(activeConversation.lastMessageAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {closed ? (
                    <AdminActionButton tone="primary" onClick={() => void setStatus("OPEN")}>
                      إعادة فتح
                    </AdminActionButton>
                  ) : (
                    <AdminActionButton tone="danger" onClick={() => void setStatus("CLOSED")}>
                      إغلاق المحادثة
                    </AdminActionButton>
                  )}
                </div>
              </div>

              <div className="max-h-[28rem] space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                {detail.loading ? <p className="text-sm text-slate-500">جاري تحميل الرسائل...</p> : null}
                {!detail.loading && !detail.messages.length ? <p className="text-sm text-slate-500">لا توجد رسائل بعد.</p> : null}
                {detail.messages.map((msg) => {
                  const fromStudent = msg.sender?.role === "STUDENT";
                  return (
                    <div key={msg.id} className={`flex ${fromStudent ? "justify-start" : "justify-end"}`}>
                      <article className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${fromStudent ? "border border-slate-200 bg-white text-slate-800" : "bg-gradient-to-l from-brand-600 to-indigo-600 text-white"}`}>
                        <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                        <p className={`mt-1 text-[10px] ${fromStudent ? "text-slate-400" : "text-brand-100"}`}>{fmt(msg.createdAt)}</p>
                      </article>
                    </div>
                  );
                })}
              </div>

              {flash ? <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{flash}</p> : null}

              <div className="mt-3 flex gap-2">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  disabled={closed || sending}
                  placeholder="اكتب الرد هنا..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => void sendReply()}
                  disabled={closed || sending || !reply.trim()}
                  className="h-fit rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {sending ? "..." : "إرسال الرد"}
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
