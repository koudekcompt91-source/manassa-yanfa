"use client";

import { useCallback, useEffect, useState } from "react";

function formatWhen(iso) {
  try {
    return new Date(iso).toLocaleString("ar-DZ");
  } catch {
    return "";
  }
}

function typeLabel(type) {
  if (type === "LIVE_SESSION") return "حصة مباشرة";
  if (type === "NEW_LESSON") return "درس جديد";
  if (type === "COURSE_ANNOUNCEMENT") return "إعلان دورة";
  if (type === "PAYMENT") return "الدفع";
  return "عام";
}

export default function DashboardNotificationsPage() {
  const [state, setState] = useState({ loading: true, notifications: [], unreadCount: 0 });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch("/api/notifications?limit=100", { cache: "no-store", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setState({ loading: false, notifications: [], unreadCount: 0 });
        return;
      }
      setState({
        loading: false,
        notifications: Array.isArray(data.notifications) ? data.notifications : [],
        unreadCount: Number(data.unreadCount || 0) || 0,
      });
    } catch {
      setState({ loading: false, notifications: [], unreadCount: 0 });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markOne = async (id) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH", credentials: "include" });
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((row) => (row.id === id ? { ...row, isRead: true } : row)),
      unreadCount: Math.max(0, prev.unreadCount - 1),
    }));
  };

  const markAll = async () => {
    await fetch("/api/notifications/read-all", { method: "PATCH", credentials: "include" });
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((row) => ({ ...row, isRead: true })),
      unreadCount: 0,
    }));
  };

  return (
    <section className="container-page py-8">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">الإشعارات</h1>
            <p className="mt-1 text-sm text-slate-500">غير مقروء: {state.unreadCount}</p>
          </div>
          <button
            type="button"
            onClick={markAll}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            تعليم الكل كمقروء
          </button>
        </div>

        {state.loading ? <p className="mt-6 text-sm text-slate-500">جاري تحميل الإشعارات...</p> : null}
        {!state.loading && !state.notifications.length ? (
          <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-500">
            لا توجد إشعارات حتى الآن.
          </p>
        ) : null}
        {!state.loading && state.notifications.length ? (
          <div className="mt-6 space-y-3">
            {state.notifications.map((row) => (
              <article key={row.id} className={`rounded-xl border p-4 ${row.isRead ? "border-slate-200 bg-white" : "border-brand-200 bg-brand-50/30"}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-extrabold text-slate-900">{row.title}</h2>
                    <p className="mt-1 text-sm text-slate-700">{row.message}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      {typeLabel(row.type)} - {formatWhen(row.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!row.isRead ? (
                      <button
                        type="button"
                        onClick={() => void markOne(row.id)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        تعليم كمقروء
                      </button>
                    ) : null}
                    {row.link ? (
                      <a
                        href={row.link}
                        className="rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-bold text-white no-underline"
                        onClick={() => {
                          if (!row.isRead) void markOne(row.id);
                        }}
                      >
                        فتح
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
