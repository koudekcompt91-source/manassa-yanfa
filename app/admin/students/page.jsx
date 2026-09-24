"use client";

import { useCallback, useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import {
  AdminActionButton,
  AdminBadge,
  AdminEmptyState,
  AdminInput,
  AdminSectionCard,
  AdminToolbar,
} from "@/components/admin/AdminUI";
import { formatDzd } from "@/lib/format-money";

const HARD_DELETE_PHRASE = "حذف نهائي";

function statusLabel(status) {
  if (status === "ACTIVE") return "نشط";
  if (status === "PENDING") return "بانتظار التفعيل";
  if (status === "DISABLED") return "معطّل";
  return status || "—";
}

function statusTone(status) {
  if (status === "ACTIVE") return "success";
  if (status === "PENDING") return "warning";
  return "slate";
}

function subscriptionLabel(type) {
  if (type === "PAID") return "مدفوع";
  if (type === "FREE") return "مجاني";
  return type || "—";
}

export default function AdminStudentsPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState("");

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [busyId, setBusyId] = useState("");
  const [disableTarget, setDisableTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmPhrase, setConfirmPhrase] = useState("");

  const load = useCallback(
    async (opts = {}) => {
      const nextPage = opts.page ?? page;
      const nextQ = opts.q !== undefined ? opts.q : appliedQuery;
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          page: String(nextPage),
          pageSize: String(pageSize),
        });
        if (nextQ.trim()) params.set("q", nextQ.trim().slice(0, 120));

        const res = await fetch(`/api/admin/students?${params}`, {
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok) {
          setUsers([]);
          setTotal(0);
          setTotalPages(1);
          setError(data?.message || "تعذّر تحميل قائمة الطلاب.");
          return;
        }
        setUsers(Array.isArray(data.users) ? data.users : []);
        setTotal(Number(data.total) || 0);
        setTotalPages(Number(data.totalPages) || 1);
        setPage(Number(data.page) || nextPage);
        setAppliedQuery(String(data.q || nextQ || ""));
      } catch {
        setUsers([]);
        setError("تعذّر الاتصال بالخادم.");
      } finally {
        setLoading(false);
      }
    },
    [appliedQuery, page, pageSize]
  );

  useEffect(() => {
    load({ page: 1, q: "" });
    // initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSearch(e) {
    e.preventDefault();
    setBanner("");
    setPage(1);
    await load({ page: 1, q: query });
  }

  async function openDetail(id) {
    setDetailLoading(true);
    setError("");
    setDetail(null);
    try {
      const res = await fetch(`/api/admin/students/${encodeURIComponent(id)}`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.message || "تعذّر تحميل التفاصيل.");
        return;
      }
      setDetail(data.user);
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function resetPassword(id) {
    if (!id || busyId) return;
    setBusyId(id);
    setError("");
    setBanner("");
    try {
      const res = await fetch(`/api/admin/students/${encodeURIComponent(id)}/reset-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.message || "تعذّر إرسال رابط إعادة التعيين.");
        return;
      }
      setBanner(data.message || "تم إرسال رابط إعادة التعيين.");
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setBusyId("");
    }
  }

  async function confirmDisable() {
    if (!disableTarget || busyId) return;
    const targetId = disableTarget.id;
    setBusyId(targetId);
    setError("");
    setBanner("");
    try {
      const res = await fetch(`/api/admin/students/${encodeURIComponent(targetId)}/disable`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.message || "تعذّر تعطيل الحساب.");
        return;
      }
      setBanner(data.message || "تم تعطيل الحساب.");
      setDisableTarget(null);
      if (detail?.id === targetId) {
        setDetail((prev) => (prev ? { ...prev, status: "DISABLED" } : prev));
      }
      await load({ page, q: appliedQuery });
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setBusyId("");
    }
  }

  async function enableAccount(id) {
    if (!id || busyId) return;
    setBusyId(id);
    setError("");
    setBanner("");
    try {
      const res = await fetch(`/api/admin/students/${encodeURIComponent(id)}/enable`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.message || "تعذّرت إعادة التفعيل.");
        return;
      }
      setBanner(data.message || "تم إعادة تفعيل الحساب.");
      if (detail?.id === id) {
        setDetail((prev) => (prev ? { ...prev, status: "ACTIVE" } : prev));
      }
      await load({ page, q: appliedQuery });
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setBusyId("");
    }
  }

  async function confirmHardDelete() {
    if (!deleteTarget || busyId) return;
    const targetId = deleteTarget.id;
    setBusyId(targetId);
    setError("");
    setBanner("");
    try {
      const res = await fetch(`/api/admin/students/${encodeURIComponent(targetId)}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmEmail,
          confirmPhrase,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.message || "تعذّر الحذف النهائي.");
        return;
      }
      setBanner(data.message || "تم حذف الحساب نهائيًا.");
      setDeleteTarget(null);
      setConfirmEmail("");
      setConfirmPhrase("");
      if (detail?.id === targetId) setDetail(null);
      await load({ page: 1, q: appliedQuery });
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <AdminShell
      title="إدارة حسابات الطلاب"
      subtitle="عرض وتفاصيل وإعادة تعيين كلمة المرور وتعطيل أو حذف حسابات الطلاب — للإدارة فقط."
    >
      <AdminSectionCard
        title="قائمة الطلاب"
        subtitle="بحث server-side بالاسم أو البريد — مع ترقيم الصفحات."
      >
        <form onSubmit={onSearch}>
          <AdminToolbar>
            <AdminInput
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث بالاسم أو البريد الإلكتروني..."
              maxLength={120}
            />
            <AdminActionButton type="submit" tone="primary">
              بحث
            </AdminActionButton>
            <AdminActionButton
              type="button"
              onClick={() => {
                setQuery("");
                setBanner("");
                setPage(1);
                load({ page: 1, q: "" });
              }}
            >
              عرض الكل
            </AdminActionButton>
          </AdminToolbar>
        </form>

        {banner ? (
          <p className="mb-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            {banner}
          </p>
        ) : null}
        {error ? (
          <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <p className="mb-4 text-xs text-slate-500">
          إجمالي النتائج: {total} — الصفحة {page} من {totalPages}
        </p>

        {loading ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            جاري تحميل بيانات الطلاب...
          </p>
        ) : null}
        {!loading && !users.length ? (
          <AdminEmptyState
            title="لا يوجد طلاب"
            description="جرّب بحثًا آخر أو سجّل طلابًا جددًا من واجهة التسجيل."
          />
        ) : null}

        {!loading && users.length ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-right text-xs font-semibold tracking-wide text-slate-500">
                  <th className="px-4 py-3">الاسم الكامل</th>
                  <th className="px-3 py-3">البريد</th>
                  <th className="px-3 py-3">المستوى</th>
                  <th className="px-3 py-3">الهاتف</th>
                  <th className="px-3 py-3">الاشتراك</th>
                  <th className="px-3 py-3">الحالة</th>
                  <th className="px-3 py-3">التسجيل</th>
                  <th className="px-4 py-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-slate-100 text-slate-700 transition hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900">{student.fullName}</td>
                    <td className="px-3 py-3 text-xs md:text-sm" dir="ltr">
                      {student.email}
                    </td>
                    <td className="px-3 py-3 text-xs">{student.levelLabel || "—"}</td>
                    <td className="px-3 py-3">{student.phone || "—"}</td>
                    <td className="px-3 py-3 text-xs">{subscriptionLabel(student.subscriptionType)}</td>
                    <td className="px-3 py-3">
                      <AdminBadge tone={statusTone(student.status)}>
                        {statusLabel(student.status)}
                      </AdminBadge>
                    </td>
                    <td className="px-3 py-3 text-xs">
                      {student.createdAt
                        ? new Date(student.createdAt).toLocaleDateString("ar-DZ")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <AdminActionButton type="button" onClick={() => openDetail(student.id)}>
                          التفاصيل
                        </AdminActionButton>
                        <AdminActionButton
                          type="button"
                          disabled={busyId === student.id}
                          onClick={() => resetPassword(student.id)}
                        >
                          إعادة تعيين كلمة المرور
                        </AdminActionButton>
                        {student.status === "DISABLED" ? (
                          <AdminActionButton
                            type="button"
                            tone="primary"
                            disabled={busyId === student.id}
                            onClick={() => enableAccount(student.id)}
                          >
                            إعادة تفعيل
                          </AdminActionButton>
                        ) : (
                          <AdminActionButton
                            type="button"
                            tone="danger"
                            disabled={busyId === student.id}
                            onClick={() => setDisableTarget(student)}
                          >
                            تعطيل الحساب
                          </AdminActionButton>
                        )}
                        <AdminActionButton
                          type="button"
                          tone="danger"
                          className="border-red-400 bg-red-50 font-bold"
                          disabled={busyId === student.id}
                          onClick={() => {
                            setDeleteTarget(student);
                            setConfirmEmail("");
                            setConfirmPhrase("");
                          }}
                        >
                          حذف نهائي
                        </AdminActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!loading && totalPages > 1 ? (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <AdminActionButton
              type="button"
              disabled={page <= 1}
              onClick={() => {
                const p = Math.max(1, page - 1);
                setPage(p);
                load({ page: p, q: appliedQuery });
              }}
            >
              السابق
            </AdminActionButton>
            <span className="text-xs font-semibold text-slate-600">
              {page} / {totalPages}
            </span>
            <AdminActionButton
              type="button"
              disabled={page >= totalPages}
              onClick={() => {
                const p = Math.min(totalPages, page + 1);
                setPage(p);
                load({ page: p, q: appliedQuery });
              }}
            >
              التالي
            </AdminActionButton>
          </div>
        ) : null}
      </AdminSectionCard>

      {(detail || detailLoading) && (
        <AdminSectionCard
          title="تفاصيل الطالب"
          subtitle="معلومات غير حساسة فقط — لا تُعرض كلمة المرور أو أي أسرار."
          action={
            <AdminActionButton type="button" onClick={() => setDetail(null)}>
              إغلاق
            </AdminActionButton>
          }
        >
          {detailLoading ? <p className="text-sm text-slate-500">جاري التحميل…</p> : null}
          {detail ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailRow label="الاسم الكامل" value={detail.fullName} />
              <DetailRow label="البريد الإلكتروني" value={detail.email} dir="ltr" />
              <DetailRow label="المستوى" value={detail.levelLabel || "—"} />
              <DetailRow label="رمز المستوى" value={detail.level || "—"} />
              <DetailRow label="المستوى (عربي)" value={detail.academicLevel || "—"} />
              <DetailRow label="الهاتف" value={detail.phone || "—"} />
              <DetailRow
                label="نوع الاشتراك"
                value={subscriptionLabel(detail.subscriptionType)}
              />
              <DetailRow label="الحالة" value={statusLabel(detail.status)} />
              <DetailRow label="رصيد المحفظة" value={formatDzd(detail.walletBalance)} />
              <DetailRow
                label="تاريخ التسجيل"
                value={
                  detail.createdAt
                    ? new Date(detail.createdAt).toLocaleString("ar-DZ")
                    : "—"
                }
              />
              {detail.relatedCounts ? (
                <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                  <p className="mb-2 font-bold text-slate-800">بيانات مرتبطة (للعلم قبل الحذف):</p>
                  <ul className="grid gap-1 sm:grid-cols-2">
                    <li>تسجيلات الدورات: {detail.relatedCounts.enrollments}</li>
                    <li>تقدم الدروس: {detail.relatedCounts.lessonProgresses}</li>
                    <li>تسليمات الاختبارات: {detail.relatedCounts.assessmentSubmissions}</li>
                    <li>شهادات: {detail.relatedCounts.certificates}</li>
                    <li>طلبات شحن: {detail.relatedCounts.rechargeRequests}</li>
                    <li>معاملات محفظة: {detail.relatedCounts.walletTransactions}</li>
                    <li>محادثات: {detail.relatedCounts.chatConversations}</li>
                    <li>رسائل مرسلة: {detail.relatedCounts.sentChatMessages}</li>
                    <li>طلبات متجر: {detail.relatedCounts.storeOrders}</li>
                    <li>إشعارات: {detail.relatedCounts.notifications}</li>
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </AdminSectionCard>
      )}

      {disableTarget ? (
        <ModalShell
          title="تعطيل حساب الطالب"
          onClose={() => setDisableTarget(null)}
        >
          <p className="text-sm text-slate-700">
            هل أنت متأكد من تعطيل حساب هذا الطالب؟ لن يتمكّن من تسجيل الدخول، وتبقى بياناته محفوظة.
          </p>
          <StudentSummary student={disableTarget} />
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <AdminActionButton type="button" onClick={() => setDisableTarget(null)}>
              إلغاء
            </AdminActionButton>
            <AdminActionButton
              type="button"
              tone="danger"
              disabled={busyId === disableTarget.id}
              onClick={confirmDisable}
            >
              {busyId === disableTarget.id ? "جاري التعطيل…" : "تعطيل الحساب"}
            </AdminActionButton>
          </div>
        </ModalShell>
      ) : null}

      {deleteTarget ? (
        <ModalShell title="حذف نهائي لحساب الطالب" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm font-bold text-red-700">
            هل أنت متأكد من حذف حساب هذا الطالب؟
          </p>
          <StudentSummary student={deleteTarget} />
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-800">
            هذا الإجراء لا يمكن التراجع عنه. سيتم حذف سجل الطالب وكل بياناته المرتبطة (محفظة، تقدم،
            تسليمات، محادثات، …). طلبات المتجر تبقى بدون ربط بالطالب.
          </p>
          <div className="mt-4 space-y-3">
            <label className="block text-sm text-slate-700">
              <span className="font-semibold">اكتب البريد الإلكتروني للتأكيد</span>
              <AdminInput
                className="mt-1"
                dir="ltr"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder={deleteTarget.email}
                autoComplete="off"
              />
            </label>
            <label className="block text-sm text-slate-700">
              <span className="font-semibold">
                اكتب العبارة بالضبط: {HARD_DELETE_PHRASE}
              </span>
              <AdminInput
                className="mt-1"
                value={confirmPhrase}
                onChange={(e) => setConfirmPhrase(e.target.value)}
                placeholder={HARD_DELETE_PHRASE}
                autoComplete="off"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <AdminActionButton type="button" onClick={() => setDeleteTarget(null)}>
              إلغاء
            </AdminActionButton>
            <AdminActionButton
              type="button"
              tone="danger"
              className="border-red-500 bg-red-600 text-white hover:bg-red-700"
              disabled={
                busyId === deleteTarget.id ||
                confirmEmail.trim().toLowerCase() !== String(deleteTarget.email).toLowerCase() ||
                confirmPhrase.trim() !== HARD_DELETE_PHRASE
              }
              onClick={confirmHardDelete}
            >
              {busyId === deleteTarget.id ? "جاري الحذف…" : "حذف الحساب"}
            </AdminActionButton>
          </div>
        </ModalShell>
      ) : null}
    </AdminShell>
  );
}

function DetailRow({ label, value, dir }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
      <p className="text-[11px] font-semibold text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-slate-900" dir={dir}>
        {value}
      </p>
    </div>
  );
}

function StudentSummary({ student }) {
  return (
    <ul className="mt-3 space-y-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
      <li>
        <span className="font-semibold">الاسم:</span> {student.fullName}
      </li>
      <li>
        <span className="font-semibold">البريد:</span>{" "}
        <span dir="ltr">{student.email}</span>
      </li>
      <li>
        <span className="font-semibold">المستوى:</span>{" "}
        {student.levelLabel || student.academicLevel || student.level || "—"}
      </li>
    </ul>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
          <AdminActionButton type="button" onClick={onClose}>
            إغلاق
          </AdminActionButton>
        </div>
        {children}
      </div>
    </div>
  );
}
