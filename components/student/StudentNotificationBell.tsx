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

type StudentNotificationBellProps = {
  enableToast?: boolean;
};

export default function StudentNotificationBell({ enableToast = true }: StudentNotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastRow, setToastRow] = useState<NotificationRow | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastProgressRunning, setToastProgressRunning] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const latestKnownMsRef = useRef(0);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const hideTimerRef = useRef<number | null>(null);
  const removeTimerRef = useRef<number | null>(null);

  const closeToast = useCallback(() => {
    setToastVisible(false);
    setToastProgressRunning(false);
    if (removeTimerRef.current) window.clearTimeout(removeTimerRef.current);
    removeTimerRef.current = window.setTimeout(() => {
      setToastRow(null);
    }, 350);
  }, []);

  const showToast = useCallback(
    (row: NotificationRow) => {
      if (!enableToast) return;
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      if (removeTimerRef.current) window.clearTimeout(removeTimerRef.current);
      setToastRow(row);
      setToastVisible(true);
      setToastProgressRunning(false);
      window.requestAnimationFrame(() => setToastProgressRunning(true));
      hideTimerRef.current = window.setTimeout(() => {
        closeToast();
      }, 5000);
    },
    [closeToast, enableToast]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=8", { cache: "no-store", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) return;
      const nextRows: NotificationRow[] = Array.isArray(data.notifications) ? data.notifications : [];
      setRows(nextRows);
      setUnreadCount(Number(data.unreadCount || 0) || 0);

      const nextLatestMs = nextRows.reduce((max, row) => {
        const t = new Date(row.createdAt).getTime();
        return Number.isFinite(t) ? Math.max(max, t) : max;
      }, latestKnownMsRef.current);

      if (!initializedRef.current) {
        initializedRef.current = true;
        latestKnownMsRef.current = nextLatestMs;
        nextRows.forEach((row) => seenIdsRef.current.add(row.id));
        return;
      }

      const incoming = nextRows.filter((row) => {
        const t = new Date(row.createdAt).getTime();
        return Number.isFinite(t) && t > latestKnownMsRef.current && !seenIdsRef.current.has(row.id);
      });

      if (incoming.length) {
        const latestIncoming = incoming.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )[incoming.length - 1];
        showToast(latestIncoming);
      }

      latestKnownMsRef.current = nextLatestMs;
      nextRows.forEach((row) => seenIdsRef.current.add(row.id));
      if (seenIdsRef.current.size > 200) {
        const keep = new Set(nextRows.map((row) => row.id));
        seenIdsRef.current = keep;
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
    const t = window.setInterval(load, 15000);
    return () => {
      window.clearInterval(t);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      if (removeTimerRef.current) window.clearTimeout(removeTimerRef.current);
    };
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
      {toastRow ? (
        <button
          type="button"
          onClick={() => {
            if (toastRow.link) window.location.href = toastRow.link;
            closeToast();
          }}
          className={`fixed left-1/2 top-4 z-[80] w-[min(92vw,30rem)] -translate-x-1/2 overflow-hidden rounded-2xl bg-gradient-to-l from-rose-700 to-red-600 text-white shadow-[0_14px_35px_-16px_rgba(190,24,93,0.65)] transition-all duration-300 ${
            toastVisible ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0 pointer-events-none"
          }`}
          dir="rtl"
        >
          <div className="flex items-start justify-between gap-3 p-4 pe-3">
            <div className="min-w-0 text-start">
              <p className="text-xs font-bold text-rose-100">إشعار جديد</p>
              <p className="mt-1 text-sm font-extrabold text-white">{toastRow.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-rose-100">{toastRow.message}</p>
            </div>
            <button
              type="button"
              aria-label="إغلاق الإشعار"
              onClick={(e) => {
                e.stopPropagation();
                closeToast();
              }}
              className="pressable inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l8 8M14 6l-8 8" />
              </svg>
            </button>
          </div>
          <div className="h-1 w-full bg-white/20">
            <div
              className={`h-full bg-white/80 transition-[width] ease-linear ${toastProgressRunning ? "w-0 duration-[5000ms]" : "w-full duration-0"}`}
            />
          </div>
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 ${unreadCount > 0 ? "bell-unread-pulse" : ""} pressable`}
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
                    className={`pressable block w-full border-b border-slate-100 px-4 py-3 text-start hover:bg-slate-50 ${
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
            <Link href="/dashboard/notifications" onClick={() => setOpen(false)} className="pressable text-sm font-bold text-brand-700 no-underline hover:underline">
              عرض كل الإشعارات
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
