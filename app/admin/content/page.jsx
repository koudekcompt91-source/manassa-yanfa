 "use client";

import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminCard, AdminInput } from "@/components/admin/AdminUI";
import { useDemoSection } from "@/lib/demo-store";

export default function AdminContentPage() {
  const [content, setContent] = useDemoSection("homepageContent");
  const [announcements, setAnnouncements] = useDemoSection("announcements");
  const [packages, setPackages] = useDemoSection("packages");
  const [heroTitle, setHeroTitle] = useState(content?.heroTitle || "");
  const [heroSubtitle, setHeroSubtitle] = useState(content?.heroSubtitle || "");
  const [ctaTitle, setCtaTitle] = useState(content?.ctaTitle || "");
  const [footerText, setFooterText] = useState(content?.footerText || "");

  function saveContent() {
    setContent({
      ...(content || {}),
      heroTitle,
      heroSubtitle,
      ctaTitle,
      footerText,
    });
  }

  return (
    <AdminShell title="إدارة محتوى الموقع" subtitle="تعديل محتوى الواجهة العامة: الهيرو، الإعلانات، والدورات المميزة.">
      <AdminCard title="Hero" subtitle="تحكم في نصوص الواجهة الرئيسية">
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">عنوان الهيرو</span>
            <AdminInput value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">وصف الهيرو</span>
            <AdminInput value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} />
          </label>
        </div>
      </AdminCard>

      <AdminCard title="CTA" subtitle="العنوان الرئيسي لدعوة الإجراء">
        <div className="grid gap-3">
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-semibold text-slate-700">عنوان CTA الرئيسي</span>
            <AdminInput value={ctaTitle} onChange={(e) => setCtaTitle(e.target.value)} />
          </label>
        </div>
      </AdminCard>

      <AdminCard title="Footer & Support" subtitle="إعدادات نص التذييل والدعم">
        <div className="grid gap-3">
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-semibold text-slate-700">نص التذييل</span>
            <AdminInput value={footerText} onChange={(e) => setFooterText(e.target.value)} />
          </label>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={saveContent} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white">حفظ التعديلات</button>
          <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm">معاينة</button>
        </div>
      </AdminCard>

      <AdminCard title="Featured Courses" subtitle="التحكم بعرض الدورات المميزة">
        <div className="mt-3 space-y-2">
          {(packages || []).filter((item) => item.isFeatured).map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <span>{item.title}</span>
              <div className="flex gap-2">
                <button onClick={() => setPackages((packages || []).map((row) => (row.id === item.id ? { ...row, isFeatured: false } : row)))} className="rounded-lg border border-slate-200 px-2 py-1 text-xs">إخفاء</button>
                <button className="rounded-lg border border-slate-200 px-2 py-1 text-xs">تعديل</button>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard title="Announcements" subtitle="إعلانات الصفحة الرئيسية">
        <div className="mt-3 space-y-2">
          {(announcements || []).map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <span>{item.title}</span>
              <button onClick={() => setAnnouncements((announcements || []).map((row) => (row.id === item.id ? { ...row, title: `${row.title} (محدث)` } : row)))} className="rounded-lg border border-slate-200 px-2 py-1 text-xs">تعديل</button>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard title="Support Block" subtitle="بيانات دعم المستخدم">
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <AdminInput placeholder="عنوان كتلة الدعم" defaultValue="هل تحتاج مساعدة أكاديمية؟" />
          <AdminInput placeholder="البريد" defaultValue="contact@maerifah.app" />
        </div>
      </AdminCard>
    </AdminShell>
  );
}
