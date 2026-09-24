"use client";

import { useCallback, useState } from "react";
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

const MAX_CREDIT = 1_000_000;

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

/** Client-side preview validation only — server re-validates. */
function previewAmount(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return { ok: false, message: "أدخل المبلغ المراد إضافته." };
  if (!/^\d+$/.test(s)) return { ok: false, message: "المبلغ يجب أن يكون رقمًا صحيحًا موجبًا بدون كسور." };
  const amount = Number(s);
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return { ok: false, message: "المبلغ يجب أن يكون أكبر من صفر." };
  }
  if (amount > MAX_CREDIT) {
    return { ok: false, message: `الحد الأقصى للعملية ${MAX_CREDIT.toLocaleString("ar-DZ")} دج.` };
  }
  return { ok: true, amount };
}

export default function AdminStudentWalletPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState("");

  const [selected, setSelected] = useState(null);
  const [amountInput, setAmountInput] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const search = useCallback(async (q) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: "1", pageSize: "20" });
      if (q.trim()) params.set("q", q.trim().slice(0, 120));
      const res = await fetch(`/api/admin/student-wallet?${params}`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setUsers([]);
        setError(data?.message || "تعذّر البحث عن الطلاب.");
        return;
      }
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch {
      setUsers([]);
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  }, []);

  function onSearch(e) {
    e.preventDefault();
    setBanner("");
    setSelected(null);
    setConfirmOpen(false);
    setAmountInput("");
    void search(query);
  }

  function openConfirm() {
    setError("");
    const parsed = previewAmount(amountInput);
    if (!parsed.ok) {
      setError(parsed.message);
      return;
    }
    if (!selected) {
      setError("اختر طالبًا أولًا.");
      return;
    }
    setConfirmOpen(true);
  }

  async function confirmCredit() {
    if (!selected || submitting) return;
    const parsed = previewAmount(amountInput);
    if (!parsed.ok) {
      setError(parsed.message);
      setConfirmOpen(false);
      return;
    }

    setSubmitting(true);
    setError("");
    setBanner("");
    try {
      const res = await fetch(
        `/api/admin/student-wallet/${encodeURIComponent(selected.id)}/credit`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: parsed.amount }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.message || "تعذّرت إضافة الرصيد.");
        return;
      }

      setBanner(
        data.message ||
          `تمت إضافة ${formatDzd(data.transaction?.amount)} — الرصيد الآن ${formatDzd(data.user?.walletBalance)}.`
      );
      setSelected((prev) =>
        prev && data.user
          ? {
              ...prev,
              walletBalance: data.user.walletBalance,
              status: data.user.status,
              subscriptionType: data.user.subscriptionType,
            }
          : prev
      );
      setUsers((rows) =>
        rows.map((u) =>
          u.id === data.user?.id ? { ...u, walletBalance: data.user.walletBalance } : u
        )
      );
      setAmountInput("");
      setConfirmOpen(false);
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setSubmitting(false);
    }
  }

  const preview = previewAmount(amountInput);
  const previewAfter =
    selected && preview.ok ? Number(selected.walletBalance || 0) + preview.amount : null;

  return (
    <AdminShell
      title="إضافة رصيد للطالب"
      subtitle="إضافة رصيد يدوي لمحفظة الطالب من لوحة الإدارة — ADMIN فقط. لا يغيّر الحالة أو نوع الاشتراك."
    >
      <AdminSectionCard title="البحث عن طالب" subtitle="بحث server-side بالبريد أو الاسم الكامل.">
        <form onSubmit={onSearch}>
          <AdminToolbar>
            <AdminInput
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="البريد الإلكتروني أو الاسم الكامل..."
              maxLength={120}
            />
            <AdminActionButton type="submit" tone="primary" disabled={loading}>
              {loading ? "جاري البحث…" : "بحث"}
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

        {!loading && !users.length ? (
          <AdminEmptyState
            title="لا توجد نتائج"
            description="ابحث ببريد الطالب أو اسمه الكامل لعرض الحسابات."
          />
        ) : null}

        {users.length ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-right text-xs font-semibold text-slate-500">
                  <th className="px-4 py-3">الاسم</th>
                  <th className="px-3 py-3">البريد</th>
                  <th className="px-3 py-3">المستوى</th>
                  <th className="px-3 py-3">الاشتراك</th>
                  <th className="px-3 py-3">الحالة</th>
                  <th className="px-3 py-3">الرصيد</th>
                  <th className="px-4 py-3">اختيار</th>
                </tr>
              </thead>
              <tbody>
                {users.map((student) => (
                  <tr key={student.id} className="border-b border-slate-100 text-slate-700">
                    <td className="px-4 py-3 font-semibold text-slate-900">{student.fullName}</td>
                    <td className="px-3 py-3 text-xs md:text-sm" dir="ltr">
                      {student.email}
                    </td>
                    <td className="px-3 py-3 text-xs">{student.levelLabel || "—"}</td>
                    <td className="px-3 py-3 text-xs">
                      {subscriptionLabel(student.subscriptionType)}
                    </td>
                    <td className="px-3 py-3">
                      <AdminBadge tone={statusTone(student.status)}>
                        {statusLabel(student.status)}
                      </AdminBadge>
                    </td>
                    <td className="px-3 py-3 font-semibold">{formatDzd(student.walletBalance)}</td>
                    <td className="px-4 py-3">
                      <AdminActionButton
                        type="button"
                        tone={selected?.id === student.id ? "primary" : "default"}
                        onClick={() => {
                          setSelected(student);
                          setConfirmOpen(false);
                          setBanner("");
                          setError("");
                        }}
                      >
                        {selected?.id === student.id ? "محدد" : "اختيار"}
                      </AdminActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </AdminSectionCard>

      {selected ? (
        <AdminSectionCard
          title="إضافة الرصيد"
          subtitle="المعاينة في الواجهة غير نهائية — السيرفر يحسب الرصيد الفعلي."
        >
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <InfoRow label="الاسم" value={selected.fullName} />
            <InfoRow label="البريد" value={selected.email} dir="ltr" />
            <InfoRow label="المستوى" value={selected.levelLabel || "—"} />
            <InfoRow
              label="نوع الاشتراك"
              value={subscriptionLabel(selected.subscriptionType)}
            />
            <InfoRow label="الحالة" value={statusLabel(selected.status)} />
            <InfoRow label="الرصيد الحالي" value={formatDzd(selected.walletBalance)} />
          </div>

          <label className="block max-w-md text-sm text-slate-700">
            <span className="font-semibold">المبلغ المراد إضافته بالدينار الجزائري</span>
            <AdminInput
              className="mt-1"
              inputMode="numeric"
              pattern="[0-9]*"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="مثال: 4000"
              dir="ltr"
            />
            <span className="mt-1 block text-xs text-slate-500">
              رقم صحيح موجب فقط — الحد الأقصى {MAX_CREDIT.toLocaleString("ar-DZ")} دج للعملية.
            </span>
          </label>

          {preview.ok && previewAfter !== null ? (
            <p className="mt-3 text-sm text-slate-600">
              معاينة الرصيد بعد الإضافة:{" "}
              <span className="font-bold text-slate-900">{formatDzd(previewAfter)}</span>
            </p>
          ) : null}

          <div className="mt-4">
            <AdminActionButton type="button" tone="primary" onClick={openConfirm}>
              إضافة الرصيد
            </AdminActionButton>
          </div>
        </AdminSectionCard>
      ) : null}

      {confirmOpen && selected && preview.ok ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
          >
            <h3 className="text-base font-extrabold text-slate-900">تأكيد إضافة الرصيد</h3>
            <ul className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <li>
                <span className="font-semibold">الطالب:</span> {selected.fullName}
              </li>
              <li>
                <span className="font-semibold">البريد:</span>{" "}
                <span dir="ltr">{selected.email}</span>
              </li>
              <li>
                <span className="font-semibold">الرصيد الحالي:</span>{" "}
                {formatDzd(selected.walletBalance)}
              </li>
              <li>
                <span className="font-semibold">المبلغ المضاف:</span> {formatDzd(preview.amount)}
              </li>
              <li>
                <span className="font-semibold">الرصيد بعد الإضافة (معاينة):</span>{" "}
                {formatDzd(previewAfter)}
              </li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              القيمة النهائية تُحسب على الخادم وتُسجَّل في WalletTransaction.
            </p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <AdminActionButton
                type="button"
                disabled={submitting}
                onClick={() => setConfirmOpen(false)}
              >
                إلغاء
              </AdminActionButton>
              <AdminActionButton
                type="button"
                tone="primary"
                disabled={submitting}
                onClick={confirmCredit}
              >
                {submitting ? "جاري الإضافة…" : "تأكيد إضافة الرصيد"}
              </AdminActionButton>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}

function InfoRow({ label, value, dir }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
      <p className="text-[11px] font-semibold text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-slate-900" dir={dir}>
        {value}
      </p>
    </div>
  );
}
