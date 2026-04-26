"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminActionButton, AdminBadge, AdminEmptyState, AdminFormField, AdminInput, AdminSectionCard } from "@/components/admin/AdminUI";

const EMPTY_BANNER = {
  title: "",
  subtitle: "",
  imageUrl: "",
  buttonText: "",
  buttonUrl: "",
  isPublished: true,
  order: 0,
  startsAt: "",
  endsAt: "",
};

const EMPTY_NEWS = {
  title: "",
  summary: "",
  icon: "",
  link: "",
  isPublished: true,
  order: 0,
  publishedAt: "",
};

const EMPTY_ANNOUNCEMENT = {
  title: "",
  message: "",
  type: "INFO",
  link: "",
  isPublished: true,
  startsAt: "",
  endsAt: "",
};

function toDateInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}

function fromDateInput(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function AdminContentPage() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ type: "", text: "" });
  const [banners, setBanners] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [publishedCourses, setPublishedCourses] = useState([]);

  const [bannerForm, setBannerForm] = useState(EMPTY_BANNER);
  const [newsForm, setNewsForm] = useState(EMPTY_NEWS);
  const [announcementForm, setAnnouncementForm] = useState(EMPTY_ANNOUNCEMENT);

  const [editingBannerId, setEditingBannerId] = useState("");
  const [editingNewsId, setEditingNewsId] = useState("");
  const [editingAnnouncementId, setEditingAnnouncementId] = useState("");

  const [savingBanner, setSavingBanner] = useState(false);
  const [savingNews, setSavingNews] = useState(false);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  const featuredCourses = useMemo(() => publishedCourses.filter((row) => row.isFeatured), [publishedCourses]);

  const showError = (text) => setToast({ type: "error", text });
  const showSuccess = (text) => setToast({ type: "success", text });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, nRes, aRes, cRes] = await Promise.all([
        fetch("/api/admin/interface-content/banners", { credentials: "include", cache: "no-store" }),
        fetch("/api/admin/interface-content/news", { credentials: "include", cache: "no-store" }),
        fetch("/api/admin/interface-content/announcements", { credentials: "include", cache: "no-store" }),
        fetch("/api/admin/courses", { credentials: "include", cache: "no-store" }),
      ]);
      const [bData, nData, aData, cData] = await Promise.all([
        bRes.json().catch(() => ({})),
        nRes.json().catch(() => ({})),
        aRes.json().catch(() => ({})),
        cRes.json().catch(() => ({})),
      ]);
      setBanners(Array.isArray(bData?.banners) ? bData.banners : []);
      setNewsItems(Array.isArray(nData?.news) ? nData.news : []);
      setAnnouncements(Array.isArray(aData?.announcements) ? aData.announcements : []);
      const allCourses = Array.isArray(cData?.courses) ? cData.courses : [];
      setPublishedCourses(allCourses.filter((course) => course.isPublished));
    } catch {
      showError("تعذّر تحميل محتوى الواجهة.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetBannerForm = () => {
    setEditingBannerId("");
    setBannerForm(EMPTY_BANNER);
  };
  const resetNewsForm = () => {
    setEditingNewsId("");
    setNewsForm(EMPTY_NEWS);
  };
  const resetAnnouncementForm = () => {
    setEditingAnnouncementId("");
    setAnnouncementForm(EMPTY_ANNOUNCEMENT);
  };

  const saveBanner = async (e) => {
    e.preventDefault();
    setSavingBanner(true);
    try {
      const isEdit = Boolean(editingBannerId);
      const res = await fetch(isEdit ? `/api/admin/interface-content/banners/${editingBannerId}` : "/api/admin/interface-content/banners", {
        method: isEdit ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: bannerForm.title,
          subtitle: bannerForm.subtitle,
          imageUrl: bannerForm.imageUrl,
          buttonText: bannerForm.buttonText,
          buttonUrl: bannerForm.buttonUrl,
          isPublished: bannerForm.isPublished,
          order: Number(bannerForm.order) || 0,
          startsAt: fromDateInput(bannerForm.startsAt),
          endsAt: fromDateInput(bannerForm.endsAt),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        showError(data?.message || "تعذّر حفظ البانر.");
        return;
      }
      showSuccess(data?.message || "تم حفظ البانر.");
      resetBannerForm();
      await load();
    } finally {
      setSavingBanner(false);
    }
  };

  const saveNews = async (e) => {
    e.preventDefault();
    setSavingNews(true);
    try {
      const isEdit = Boolean(editingNewsId);
      const res = await fetch(isEdit ? `/api/admin/interface-content/news/${editingNewsId}` : "/api/admin/interface-content/news", {
        method: isEdit ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newsForm.title,
          summary: newsForm.summary,
          icon: newsForm.icon,
          link: newsForm.link,
          isPublished: newsForm.isPublished,
          order: Number(newsForm.order) || 0,
          publishedAt: fromDateInput(newsForm.publishedAt),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        showError(data?.message || "تعذّر حفظ الخبر.");
        return;
      }
      showSuccess(data?.message || "تم حفظ الخبر.");
      resetNewsForm();
      await load();
    } finally {
      setSavingNews(false);
    }
  };

  const saveAnnouncement = async (e) => {
    e.preventDefault();
    setSavingAnnouncement(true);
    try {
      const isEdit = Boolean(editingAnnouncementId);
      const res = await fetch(
        isEdit ? `/api/admin/interface-content/announcements/${editingAnnouncementId}` : "/api/admin/interface-content/announcements",
        {
          method: isEdit ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: announcementForm.title,
            message: announcementForm.message,
            type: announcementForm.type,
            link: announcementForm.link,
            isPublished: announcementForm.isPublished,
            startsAt: fromDateInput(announcementForm.startsAt),
            endsAt: fromDateInput(announcementForm.endsAt),
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        showError(data?.message || "تعذّر حفظ الإعلان.");
        return;
      }
      showSuccess(data?.message || "تم حفظ الإعلان.");
      resetAnnouncementForm();
      await load();
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const removeItem = async (url, fallbackError) => {
    const res = await fetch(url, { method: "DELETE", credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      showError(data?.message || fallbackError);
      return;
    }
    showSuccess(data?.message || "تم الحذف بنجاح.");
    await load();
  };

  const togglePublish = async (url, isPublished) => {
    const res = await fetch(url, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      showError(data?.message || "تعذّر تحديث الحالة.");
      return;
    }
    showSuccess("تم تحديث الحالة.");
    await load();
  };

  const toggleFeaturedCourse = async (course) => {
    const res = await fetch(`/api/admin/courses/${course.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !course.isFeatured }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      showError(data?.message || "تعذّر تحديث حالة الدورة المميزة.");
      return;
    }
    showSuccess(course.isFeatured ? "تمت إزالة الدورة من المميزة." : "تم تمييز الدورة.");
    await load();
  };

  const updateCourseOrder = async (courseId, value) => {
    const res = await fetch(`/api/admin/courses/${courseId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: Number(value) || 0 }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      showError(data?.message || "تعذّر تحديث ترتيب الدورة.");
      return;
    }
    await load();
  };

  const announcementToneClass = (type) => {
    if (type === "SUCCESS") return "success";
    if (type === "WARNING" || type === "URGENT") return "warning";
    return "brand";
  };

  return (
    <AdminShell title="إدارة محتوى الواجهة" subtitle="إدارة السلايدر الرئيسي، الأخبار، الإعلانات، والدورات المميزة.">
      {toast.text ? (
        <p className={`rounded-xl border px-3 py-2 text-sm ${toast.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {toast.text}
        </p>
      ) : null}

      <AdminSectionCard title="السلايدر الرئيسي" subtitle="إضافة بانر وتعديل ترتيب العرض.">
        <form onSubmit={saveBanner} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2">
          <AdminFormField label="العنوان">
            <AdminInput value={bannerForm.title} onChange={(e) => setBannerForm((s) => ({ ...s, title: e.target.value }))} required />
          </AdminFormField>
          <AdminFormField label="العنوان الفرعي">
            <AdminInput value={bannerForm.subtitle} onChange={(e) => setBannerForm((s) => ({ ...s, subtitle: e.target.value }))} />
          </AdminFormField>
          <AdminFormField label="رابط الصورة (https)">
            <AdminInput value={bannerForm.imageUrl} onChange={(e) => setBannerForm((s) => ({ ...s, imageUrl: e.target.value }))} placeholder="https://..." />
          </AdminFormField>
          <AdminFormField label="نص الزر">
            <AdminInput value={bannerForm.buttonText} onChange={(e) => setBannerForm((s) => ({ ...s, buttonText: e.target.value }))} />
          </AdminFormField>
          <AdminFormField label="رابط الزر">
            <AdminInput value={bannerForm.buttonUrl} onChange={(e) => setBannerForm((s) => ({ ...s, buttonUrl: e.target.value }))} placeholder="/courses أو https://..." />
          </AdminFormField>
          <AdminFormField label="ترتيب العرض">
            <AdminInput type="number" min="0" value={bannerForm.order} onChange={(e) => setBannerForm((s) => ({ ...s, order: e.target.value }))} />
          </AdminFormField>
          <AdminFormField label="يبدأ في (اختياري)">
            <AdminInput type="datetime-local" value={bannerForm.startsAt} onChange={(e) => setBannerForm((s) => ({ ...s, startsAt: e.target.value }))} />
          </AdminFormField>
          <AdminFormField label="ينتهي في (اختياري)">
            <AdminInput type="datetime-local" value={bannerForm.endsAt} onChange={(e) => setBannerForm((s) => ({ ...s, endsAt: e.target.value }))} />
          </AdminFormField>
          <AdminFormField label="الحالة">
            <select value={bannerForm.isPublished ? "1" : "0"} onChange={(e) => setBannerForm((s) => ({ ...s, isPublished: e.target.value === "1" }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="1">منشور</option>
              <option value="0">مخفي</option>
            </select>
          </AdminFormField>
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <AdminActionButton type="submit" tone="primary" disabled={savingBanner}>
              {savingBanner ? "جاري الحفظ..." : editingBannerId ? "تعديل البانر" : "إضافة بانر"}
            </AdminActionButton>
            {editingBannerId ? <AdminActionButton onClick={resetBannerForm}>إلغاء</AdminActionButton> : null}
          </div>
        </form>
        <div className="mt-4 space-y-2">
          {!loading && !banners.length ? <AdminEmptyState title="لا توجد بانرات" description="ابدأ بإضافة أول بانر." /> : null}
          {banners.map((row) => (
            <article key={row.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">{row.title}</p>
                  {row.subtitle ? <p className="mt-1 text-slate-600">{row.subtitle}</p> : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <AdminBadge tone={row.isPublished ? "success" : "warning"}>{row.isPublished ? "منشور" : "مخفي"}</AdminBadge>
                    <AdminBadge tone="brand">ترتيب العرض: {row.order}</AdminBadge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminActionButton onClick={() => {
                    setEditingBannerId(row.id);
                    setBannerForm({
                      title: row.title || "",
                      subtitle: row.subtitle || "",
                      imageUrl: row.imageUrl || "",
                      buttonText: row.buttonText || "",
                      buttonUrl: row.buttonUrl || "",
                      isPublished: row.isPublished !== false,
                      order: Number(row.order || 0),
                      startsAt: toDateInput(row.startsAt),
                      endsAt: toDateInput(row.endsAt),
                    });
                  }}>
                    تعديل البانر
                  </AdminActionButton>
                  <AdminActionButton onClick={() => togglePublish(`/api/admin/interface-content/banners/${row.id}`, row.isPublished)}>
                    {row.isPublished ? "إخفاء" : "نشر"}
                  </AdminActionButton>
                  <AdminActionButton tone="danger" onClick={() => removeItem(`/api/admin/interface-content/banners/${row.id}`, "تعذّر حذف البانر.")}>حذف</AdminActionButton>
                </div>
              </div>
            </article>
          ))}
        </div>
      </AdminSectionCard>

      <AdminSectionCard title="الأخبار" subtitle="إدارة أحدث الأخبار.">
        <form onSubmit={saveNews} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2">
          <AdminFormField label="العنوان">
            <AdminInput value={newsForm.title} onChange={(e) => setNewsForm((s) => ({ ...s, title: e.target.value }))} required />
          </AdminFormField>
          <AdminFormField label="الأيقونة (اختياري)">
            <AdminInput value={newsForm.icon} onChange={(e) => setNewsForm((s) => ({ ...s, icon: e.target.value }))} />
          </AdminFormField>
          <AdminFormField label="الملخص" className="md:col-span-2">
            <AdminInput value={newsForm.summary} onChange={(e) => setNewsForm((s) => ({ ...s, summary: e.target.value }))} required />
          </AdminFormField>
          <AdminFormField label="الرابط (اختياري)">
            <AdminInput value={newsForm.link} onChange={(e) => setNewsForm((s) => ({ ...s, link: e.target.value }))} />
          </AdminFormField>
          <AdminFormField label="ترتيب العرض">
            <AdminInput type="number" min="0" value={newsForm.order} onChange={(e) => setNewsForm((s) => ({ ...s, order: e.target.value }))} />
          </AdminFormField>
          <AdminFormField label="تاريخ النشر (اختياري)">
            <AdminInput type="datetime-local" value={newsForm.publishedAt} onChange={(e) => setNewsForm((s) => ({ ...s, publishedAt: e.target.value }))} />
          </AdminFormField>
          <AdminFormField label="الحالة">
            <select value={newsForm.isPublished ? "1" : "0"} onChange={(e) => setNewsForm((s) => ({ ...s, isPublished: e.target.value === "1" }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="1">منشور</option>
              <option value="0">مخفي</option>
            </select>
          </AdminFormField>
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <AdminActionButton type="submit" tone="primary" disabled={savingNews}>
              {savingNews ? "جاري الحفظ..." : editingNewsId ? "تعديل الخبر" : "إضافة خبر"}
            </AdminActionButton>
            {editingNewsId ? <AdminActionButton onClick={resetNewsForm}>إلغاء</AdminActionButton> : null}
          </div>
        </form>
        <div className="mt-4 space-y-2">
          {!loading && !newsItems.length ? <AdminEmptyState title="لا توجد أخبار" description="أضف أول خبر." /> : null}
          {newsItems.map((row) => (
            <article key={row.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">{row.title}</p>
                  <p className="mt-1 text-slate-600">{row.summary}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <AdminBadge tone={row.isPublished ? "success" : "warning"}>{row.isPublished ? "منشور" : "مخفي"}</AdminBadge>
                    <AdminBadge tone="brand">ترتيب العرض: {row.order}</AdminBadge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminActionButton onClick={() => {
                    setEditingNewsId(row.id);
                    setNewsForm({
                      title: row.title || "",
                      summary: row.summary || "",
                      icon: row.icon || "",
                      link: row.link || "",
                      isPublished: row.isPublished !== false,
                      order: Number(row.order || 0),
                      publishedAt: toDateInput(row.publishedAt),
                    });
                  }}>
                    تعديل
                  </AdminActionButton>
                  <AdminActionButton onClick={() => togglePublish(`/api/admin/interface-content/news/${row.id}`, row.isPublished)}>
                    {row.isPublished ? "إخفاء" : "نشر"}
                  </AdminActionButton>
                  <AdminActionButton tone="danger" onClick={() => removeItem(`/api/admin/interface-content/news/${row.id}`, "تعذّر حذف الخبر.")}>حذف</AdminActionButton>
                </div>
              </div>
            </article>
          ))}
        </div>
      </AdminSectionCard>

      <AdminSectionCard title="الإعلانات" subtitle="إضافة إعلان عام أو مؤقت.">
        <form onSubmit={saveAnnouncement} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2">
          <AdminFormField label="العنوان">
            <AdminInput value={announcementForm.title} onChange={(e) => setAnnouncementForm((s) => ({ ...s, title: e.target.value }))} required />
          </AdminFormField>
          <AdminFormField label="النوع">
            <select value={announcementForm.type} onChange={(e) => setAnnouncementForm((s) => ({ ...s, type: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="INFO">INFO</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="WARNING">WARNING</option>
              <option value="URGENT">URGENT</option>
            </select>
          </AdminFormField>
          <AdminFormField label="الرسالة" className="md:col-span-2">
            <AdminInput value={announcementForm.message} onChange={(e) => setAnnouncementForm((s) => ({ ...s, message: e.target.value }))} required />
          </AdminFormField>
          <AdminFormField label="الرابط (اختياري)">
            <AdminInput value={announcementForm.link} onChange={(e) => setAnnouncementForm((s) => ({ ...s, link: e.target.value }))} />
          </AdminFormField>
          <AdminFormField label="الحالة">
            <select value={announcementForm.isPublished ? "1" : "0"} onChange={(e) => setAnnouncementForm((s) => ({ ...s, isPublished: e.target.value === "1" }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="1">منشور</option>
              <option value="0">مخفي</option>
            </select>
          </AdminFormField>
          <AdminFormField label="يبدأ في (اختياري)">
            <AdminInput type="datetime-local" value={announcementForm.startsAt} onChange={(e) => setAnnouncementForm((s) => ({ ...s, startsAt: e.target.value }))} />
          </AdminFormField>
          <AdminFormField label="ينتهي في (اختياري)">
            <AdminInput type="datetime-local" value={announcementForm.endsAt} onChange={(e) => setAnnouncementForm((s) => ({ ...s, endsAt: e.target.value }))} />
          </AdminFormField>
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <AdminActionButton type="submit" tone="primary" disabled={savingAnnouncement}>
              {savingAnnouncement ? "جاري الحفظ..." : editingAnnouncementId ? "تعديل الإعلان" : "إضافة إعلان"}
            </AdminActionButton>
            {editingAnnouncementId ? <AdminActionButton onClick={resetAnnouncementForm}>إلغاء</AdminActionButton> : null}
          </div>
        </form>
        <div className="mt-4 space-y-2">
          {!loading && !announcements.length ? <AdminEmptyState title="لا توجد إعلانات" description="أضف أول إعلان." /> : null}
          {announcements.map((row) => (
            <article key={row.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">{row.title}</p>
                  <p className="mt-1 text-slate-600">{row.message}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <AdminBadge tone={row.isPublished ? "success" : "warning"}>{row.isPublished ? "منشور" : "مخفي"}</AdminBadge>
                    <AdminBadge tone={announcementToneClass(row.type)}>{row.type}</AdminBadge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminActionButton onClick={() => {
                    setEditingAnnouncementId(row.id);
                    setAnnouncementForm({
                      title: row.title || "",
                      message: row.message || "",
                      type: row.type || "INFO",
                      link: row.link || "",
                      isPublished: row.isPublished !== false,
                      startsAt: toDateInput(row.startsAt),
                      endsAt: toDateInput(row.endsAt),
                    });
                  }}>
                    تعديل
                  </AdminActionButton>
                  <AdminActionButton onClick={() => togglePublish(`/api/admin/interface-content/announcements/${row.id}`, row.isPublished)}>
                    {row.isPublished ? "إخفاء" : "نشر"}
                  </AdminActionButton>
                  <AdminActionButton tone="danger" onClick={() => removeItem(`/api/admin/interface-content/announcements/${row.id}`, "تعذّر حذف الإعلان.")}>حذف</AdminActionButton>
                </div>
              </div>
            </article>
          ))}
        </div>
      </AdminSectionCard>

      <AdminSectionCard title="الدورات المميزة" subtitle="اختيار الدورات المنشورة المميزة للواجهة.">
        {!loading && !publishedCourses.length ? <AdminEmptyState title="لا توجد دورات منشورة" description="انشر دورة أولًا ثم قم بتمييزها." /> : null}
        <div className="space-y-2">
          {publishedCourses.map((course) => (
            <article key={course.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900">{course.title}</p>
                  <p className="mt-1 text-xs text-slate-500">/{course.slug}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <AdminBadge tone={course.isFeatured ? "success" : "warning"}>{course.isFeatured ? "مميزة" : "غير مميزة"}</AdminBadge>
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <span>ترتيب العرض</span>
                      <input type="number" min="0" defaultValue={Number(course.order || 0)} onBlur={(e) => updateCourseOrder(course.id, e.target.value)} className="w-20 rounded-lg border border-slate-200 px-2 py-1" />
                    </label>
                  </div>
                </div>
                <AdminActionButton onClick={() => toggleFeaturedCourse(course)}>
                  {course.isFeatured ? "إزالة من المميزة" : "تمييز الدورة"}
                </AdminActionButton>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">عدد الدورات المميزة: {featuredCourses.length}</p>
      </AdminSectionCard>
    </AdminShell>
  );
}
