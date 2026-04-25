"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type NotificationRow = {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("ar-DZ");
  } catch {
    return "";
  }
}

export default function StudentNotificationBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=8", { cache: "no-store", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) return;
      setRows(Array.isArray(data.notifications) ? data.notifications : []);
      setUnreadCount(Number(data.unreadCount || 0) || 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = window.setInterval(load, 30000);
    return () => window.clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const markOneRead = useCallback(
    async (id: string) => {
      await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      setRows((prev) => prev.map((row) => (row.id === id ? { ...row, isRead: true } : row)));
      setUnreadCount((n) => Math.max(0, n - 1));
    },
    []
  );

  const markAllRead = useCallback(async () => {
    await fetch("/api/notifications/read-all", {
      method: "PATCH",
      credentials: "include",
    });
    setRows((prev) => prev.map((row) => ({ ...row, isRead: true })));
    setUnreadCount(0);
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
        aria-label="الإشعارات"
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute -end-1 -top-1 inline-flex min-w-[1.2rem] items-center justify-center rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute end-0 z-30 mt-2 w-[22rem] max-w-[90vw] rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-extrabold text-slate-900">الإشعارات</p>
            <button type="button" onClick={() => void markAllRead()} className="text-xs font-bold text-brand-700 hover:underline">
              تعليم الكل كمقروء
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? <p className="px-4 py-3 text-xs text-slate-500">جاري التحميل...</p> : null}
            {!loading && !rows.length ? <p className="px-4 py-4 text-sm text-slate-500">لا توجد إشعارات حاليًا.</p> : null}
            {!loading
              ? rows.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={async () => {
                      if (!row.isRead) await markOneRead(row.id);
                      setOpen(false);
                      if (row.link) window.location.href = row.link;
                    }}
                    className={`block w-full border-b border-slate-100 px-4 py-3 text-start hover:bg-slate-50 ${
                      row.isRead ? "bg-white" : "bg-brand-50/40"
                    }`}
                  >
                    <p className="text-sm font-bold text-slate-900">{row.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">{row.message}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{formatWhen(row.createdAt)}</p>
                  </button>
                ))
              : null}
          </div>
          <div className="px-4 py-3">
            <Link href="/dashboard/notifications" onClick={() => setOpen(false)} className="text-sm font-bold text-brand-700 no-underline hover:underline">
              عرض كل الإشعارات
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
