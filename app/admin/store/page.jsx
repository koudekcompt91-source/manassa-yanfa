"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import {
  AdminActionButton,
  AdminBadge,
  AdminEmptyState,
  AdminFormField,
  AdminInput,
  AdminSectionCard,
  AdminSelect,
  AdminToolbar,
} from "@/components/admin/AdminUI";
import { formatDzd } from "@/lib/format-money";

const EMPTY_ITEM_FORM = {
  title: "",
  description: "",
  price: 0,
  isFree: false,
  imageUrl: "",
  teacherId: "",
  status: "DRAFT",
};

const ORDER_STATUS_LABELS = {
  PENDING: "قيد الانتظار",
  APPROVED: "مقبول",
  REJECTED: "مرفوض",
  FULFILLED: "تم التسليم",
};

function orderTone(status) {
  if (status === "APPROVED" || status === "FULFILLED") return "success";
  if (status === "REJECTED") return "warning";
  return "brand";
}

export default function AdminStorePage() {
  const [tab, setTab] = useState("ITEMS");
  const [banner, setBanner] = useState({ type: "", text: "" });

  const [items, setItems] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_ITEM_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const loadItems = useCallback(async () => {
    setLoadingItems(true);
    try {
      const res = await fetch("/api/admin/store/items", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      setItems(res.ok && data?.ok && Array.isArray(data.items) ? data.items : []);
    } catch {
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  const loadTeachers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/teachers", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      setTeachers(res.ok && data?.ok && Array.isArray(data.teachers) ? data.teachers : []);
    } catch {
      setTeachers([]);
    }
  }, []);

  const loadOrders = useCallback(async (status = "all") => {
    setOrdersLoading(true);
    try {
      const qs = status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
      const res = await fetch(`/api/admin/store/orders${qs}`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      setOrders(res.ok && data?.ok && Array.isArray(data.orders) ? data.orders : []);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
    loadTeachers();
  }, [loadItems, loadTeachers]);

  useEffect(() => {
    if (tab === "ORDERS") loadOrders(orderStatusFilter);
  }, [tab, orderStatusFilter, loadOrders]);

  const rows = useMemo(() => {
    return (items || []).filter((item) => {
      const target = `${item.title} ${item.description} ${item.teacherName}`.toLowerCase();
      const matchesQuery = target.includes(query.trim().toLowerCase());
      const matchesStatus =
        statusFilter === "الكل" ||
        (statusFilter === "published" ? item.status === "PUBLISHED" : item.status !== "PUBLISHED");
      return matchesQuery && matchesStatus;
    });
  }, [items, query, statusFilter]);

  function openCreate() {
    setForm({ ...EMPTY_ITEM_FORM, teacherId: teachers[0]?.id || "" });
    setEditingId(null);
    setShowForm(true);
    setFormError("");
  }

  function openEdit(item) {
    setForm({
      title: item.title || "",
      description: item.description || "",
      price: Number(item.price || 0),
      isFree: Boolean(item.isFree),
      imageUrl: item.imageUrl || "",
      teacherId: item.teacherId || "",
      status: item.status || "DRAFT",
    });
    setEditingId(item.id);
    setShowForm(true);
    setFormError("");
  }

  function resetForm() {
    setForm(EMPTY_ITEM_FORM);
    setEditingId(null);
    setShowForm(false);
    setFormError("");
  }

  async function saveItem(e) {
    e.preventDefault();
    setFormError("");
    if (!form.title.trim()) {
      setFormError("عنوان العنصر مطلوب.");
      return;
    }
    if (!form.isFree && !(Number(form.price) > 0)) {
      setFormError("أدخل سعرًا صحيحًا أو فعّل خيار \u201cمجاني\u201d.");
      return;
    }
    if (form.status === "PUBLISHED" && !form.teacherId) {
      setFormError("يجب اختيار الأستاذ المالك قبل نشر العنصر.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: form.isFree ? 0 : Math.round(Number(form.price) || 0),
      };
      const isEdit = !!editingId;
      const url = isEdit ? `/api/admin/store/items/${editingId}` : "/api/admin/store/items";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setFormError(data?.message || "تعذّر حفظ العنصر.");
        return;
      }
      setBanner({ type: "success", text: data?.message || "تم حفظ العنصر." });
      resetForm();
      await loadItems();
    } finally {
      setSaving(false);
    }
  }

  async function toggleVisibility(item) {
    const nextStatus = item.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const res = await fetch(`/api/admin/store/items/${item.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setBanner({ type: "error", text: data?.message || "تعذّر تحديث حالة العنصر." });
      return;
    }
    await loadItems();
  }

  async function deleteItem(id) {
    const res = await fetch(`/api/admin/store/items/${id}`, { method: "DELETE", credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setBanner({ type: "error", text: data?.message || "تعذّر حذف العنصر." });
      return;
    }
    setBanner({ type: "success", text: "تم حذف العنصر." });
    await loadItems();
  }

  async function updateOrderStatus(orderId, status) {
    const res = await fetch(`/api/admin/store/orders/${orderId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setBanner({ type: "error", text: data?.message || "تعذّر تحديث الطلب." });
      return;
    }
    await loadOrders(orderStatusFilter);
  }

  return (
    <AdminShell title="المتجر" subtitle="إدارة عناصر المتجر وطلبات الشراء المقدّمة من الطلاب.">
      <AdminSectionCard title="المتجر" subtitle="أنشئ عناصر المتجر وعيّن الأستاذ المالك وتحكّم في ظهورها.">
        {banner.text ? (
          <div
            className={`mb-4 rounded-xl border px-3 py-2 text-sm ${
              banner.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {banner.text}
          </div>
        ) : null}

        <div className="mb-5 flex flex-wrap gap-2">
          <AdminActionButton onClick={() => setTab("ITEMS")} tone={tab === "ITEMS" ? "primary" : undefined}>
            العناصر
          </AdminActionButton>
          <AdminActionButton onClick={() => setTab("ORDERS")} tone={tab === "ORDERS" ? "primary" : undefined}>
            طلبات الشراء
          </AdminActionButton>
        </div>

        {tab === "ITEMS" ? (
          <>
            <AdminToolbar>
              <AdminInput type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن عنصر..." />
              <AdminSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="الكل">كل الحالات</option>
                <option value="published">منشور</option>
                <option value="draft">مسودة</option>
              </AdminSelect>
              {!showForm ? (
                <AdminActionButton onClick={openCreate} tone="primary" className="rounded-xl px-4 py-2 text-sm font-bold">
                  إضافة عنصر جديد
                </AdminActionButton>
              ) : (
                <span className="self-center text-xs font-semibold text-brand-700">{editingId ? "تعديل العنصر" : "إضافة عنصر جديد"}</span>
              )}
            </AdminToolbar>

            {showForm ? (
              <form className="mb-6 grid gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 md:grid-cols-2" onSubmit={saveItem}>
                <AdminFormField label="عنوان العنصر">
                  <AdminInput value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} placeholder="عنوان العنصر" required />
                </AdminFormField>
                <AdminFormField label="الوصف">
                  <AdminInput value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} placeholder="وصف العنصر" />
                </AdminFormField>
                <AdminFormField label="الأستاذ المالك">
                  <AdminSelect value={form.teacherId} onChange={(e) => setForm((s) => ({ ...s, teacherId: e.target.value }))}>
                    <option value="">بدون أستاذ</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName}
                      </option>
                    ))}
                  </AdminSelect>
                </AdminFormField>
                <AdminFormField label="رابط الصورة (اختياري)">
                  <AdminInput value={form.imageUrl} onChange={(e) => setForm((s) => ({ ...s, imageUrl: e.target.value }))} placeholder="https://..." />
                </AdminFormField>
                <AdminFormField label="النوع">
                  <AdminSelect
                    value={form.isFree ? "free" : "paid"}
                    onChange={(e) => setForm((s) => ({ ...s, isFree: e.target.value === "free", price: e.target.value === "free" ? 0 : s.price || 1 }))}
                  >
                    <option value="paid">مدفوع</option>
                    <option value="free">مجاني</option>
                  </AdminSelect>
                </AdminFormField>
                {form.isFree ? (
                  <AdminFormField label="السعر">
                    <AdminInput value="0" disabled readOnly />
                  </AdminFormField>
                ) : (
                  <AdminFormField label="السعر">
                    <AdminInput type="number" min="1" value={form.price} onChange={(e) => setForm((s) => ({ ...s, price: Number(e.target.value) || 0 }))} required />
                  </AdminFormField>
                )}
                <AdminFormField label="حالة العنصر">
                  <AdminSelect value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}>
                    <option value="DRAFT">مسودة</option>
                    <option value="PUBLISHED">منشور</option>
                  </AdminSelect>
                </AdminFormField>
                {formError ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 md:col-span-2">{formError}</p> : null}
                <div className="flex flex-wrap gap-2 md:col-span-2">
                  <AdminActionButton type="submit" tone="primary" className="rounded-xl px-4 py-2 text-sm font-bold" disabled={saving}>
                    {saving ? "جاري الحفظ..." : "حفظ العنصر"}
                  </AdminActionButton>
                  <AdminActionButton type="button" onClick={resetForm} className="rounded-xl px-4 py-2 text-sm font-bold">
                    إلغاء
                  </AdminActionButton>
                </div>
              </form>
            ) : null}

            {loadingItems ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">جاري تحميل العناصر...</p>
            ) : !rows.length ? (
              <AdminEmptyState title="لا توجد عناصر" description="ابدأ بإضافة عنصر جديد إلى المتجر." />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-right text-xs font-semibold tracking-wide text-slate-500">
                      <th className="px-4 py-3">العنصر</th>
                      <th className="px-3 py-3">الأستاذ</th>
                      <th className="px-3 py-3">السعر</th>
                      <th className="px-3 py-3">الطلبات</th>
                      <th className="px-3 py-3">الحالة</th>
                      <th className="px-4 py-3">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 align-top text-slate-700 transition hover:bg-slate-50/50">
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-900">{item.title}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{(item.description || "").slice(0, 96) || "بدون وصف."}</p>
                        </td>
                        <td className="px-3 py-4">{item.teacherName || "—"}</td>
                        <td className="px-3 py-4">
                          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.isFree || item.price <= 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                            {item.isFree || item.price <= 0 ? "مجاني" : formatDzd(Number(item.price || 0))}
                          </span>
                        </td>
                        <td className="px-3 py-4 font-semibold">{item.ordersCount ?? 0}</td>
                        <td className="px-3 py-4">
                          <AdminBadge tone={item.status === "PUBLISHED" ? "success" : "warning"}>
                            {item.status === "PUBLISHED" ? "منشور" : "مسودة"}
                          </AdminBadge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <AdminActionButton onClick={() => openEdit(item)}>تعديل</AdminActionButton>
                            <AdminActionButton onClick={() => toggleVisibility(item)}>
                              {item.status === "PUBLISHED" ? "إخفاء" : "نشر"}
                            </AdminActionButton>
                            <AdminActionButton onClick={() => deleteItem(item.id)} tone="danger">حذف</AdminActionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            <AdminToolbar>
              <span className="self-center text-sm font-semibold text-slate-700">طلبات الشراء</span>
              <AdminSelect value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)}>
                <option value="all">كل الحالات</option>
                <option value="PENDING">قيد الانتظار</option>
                <option value="APPROVED">مقبول</option>
                <option value="REJECTED">مرفوض</option>
                <option value="FULFILLED">تم التسليم</option>
              </AdminSelect>
            </AdminToolbar>

            {ordersLoading ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">جاري تحميل الطلبات...</p>
            ) : !orders.length ? (
              <AdminEmptyState title="لا توجد طلبات" description="ستظهر هنا طلبات الشراء المقدّمة من الطلاب." />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-right text-xs font-semibold tracking-wide text-slate-500">
                      <th className="px-4 py-3">العنصر</th>
                      <th className="px-3 py-3">مقدّم الطلب</th>
                      <th className="px-3 py-3">الهاتف</th>
                      <th className="px-3 py-3">التاريخ</th>
                      <th className="px-3 py-3">الحالة</th>
                      <th className="px-4 py-3">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b border-slate-100 align-top text-slate-700">
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-900">{o.itemTitle}</p>
                          {o.teacherName ? <p className="mt-1 text-xs text-slate-500">الأستاذ: {o.teacherName}</p> : null}
                        </td>
                        <td className="px-3 py-4">
                          <p className="font-semibold text-slate-900">{o.fullName} {o.lastName}</p>
                          {o.studentEmail ? <p className="mt-1 text-xs text-slate-500" dir="ltr">{o.studentEmail}</p> : null}
                        </td>
                        <td className="px-3 py-4" dir="ltr">{o.phone}</td>
                        <td className="px-3 py-4 text-xs">{new Date(o.createdAt).toLocaleString("ar-DZ")}</td>
                        <td className="px-3 py-4">
                          <AdminBadge tone={orderTone(o.status)}>{ORDER_STATUS_LABELS[o.status] || o.status}</AdminBadge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <AdminActionButton onClick={() => updateOrderStatus(o.id, "APPROVED")} tone="primary">قبول</AdminActionButton>
                            <AdminActionButton onClick={() => updateOrderStatus(o.id, "FULFILLED")}>تم التسليم</AdminActionButton>
                            <AdminActionButton onClick={() => updateOrderStatus(o.id, "REJECTED")} tone="danger">رفض</AdminActionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </AdminSectionCard>
    </AdminShell>
  );
}
