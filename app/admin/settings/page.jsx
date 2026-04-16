 "use client";

import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminCard, AdminInput } from "@/components/admin/AdminUI";
import { useDemoSection } from "@/lib/demo-store";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useDemoSection("settings");
  const [demoMode, setDemoMode] = useState(Boolean(settings?.demoMode));
  const [maintenanceMode, setMaintenanceMode] = useState(Boolean(settings?.maintenanceMode));
  const [platformName, setPlatformName] = useState(settings?.platformName || "yanfa3 Education");
  const [supportEmail, setSupportEmail] = useState(settings?.supportEmail || "");
  const [footerText, setFooterText] = useState(settings?.footerText || "");
  const [maintenanceBanner, setMaintenanceBanner] = useState(settings?.maintenanceBanner || "");

  function saveSettings() {
    setSettings({
      ...(settings || {}),
      platformName,
      supportEmail,
      footerText,
      demoMode,
      maintenanceMode,
      maintenanceBanner,
    });
  }

  return (
    <AdminShell title="إعدادات المنصة" subtitle="التحكم في إعدادات الهوية، الدعم، والخصائص التشغيلية.">
      <AdminCard title="الإعدادات العامة" subtitle="تحديث بيانات المنصة والدعم ورسائل التشغيل">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-semibold">اسم المنصة</span>
            <AdminInput value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
          </label>
          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-semibold">بريد الدعم</span>
            <AdminInput value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
          </label>
          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-semibold">رابط فيسبوك</span>
            <AdminInput placeholder="https://..." />
          </label>
          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-semibold">رابط يوتيوب</span>
            <AdminInput placeholder="https://..." />
          </label>
          <label className="space-y-1 text-sm text-slate-700 md:col-span-2">
            <span className="font-semibold">نص التذييل</span>
            <AdminInput value={footerText} onChange={(e) => setFooterText(e.target.value)} />
          </label>
          <label className="space-y-1 text-sm text-slate-700 md:col-span-2">
            <span className="font-semibold">نص بانر الصيانة</span>
            <AdminInput value={maintenanceBanner} onChange={(e) => setMaintenanceBanner(e.target.value)} />
          </label>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <span>وضع العرض التجريبي (Demo Mode)</span>
            <button
              onClick={() => setDemoMode((v) => !v)}
              className={`rounded-lg px-3 py-1 text-xs font-bold text-white ${demoMode ? "bg-amber-600" : "bg-slate-500"}`}
            >
              {demoMode ? "مفعّل" : "موقوف"}
            </button>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            <span>وضع الصيانة</span>
            <button
              onClick={() => setMaintenanceMode((v) => !v)}
              className={`rounded-lg px-3 py-1 text-xs font-bold text-white ${maintenanceMode ? "bg-red-600" : "bg-slate-500"}`}
            >
              {maintenanceMode ? "مفعّل" : "موقوف"}
            </button>
          </div>
        </div>
        <div className="mt-4">
          <button onClick={saveSettings} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white">حفظ الإعدادات</button>
        </div>
      </AdminCard>
    </AdminShell>
  );
}
