"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import {
  Award,
  Bell,
  BookOpen,
  BookText,
  ClipboardCheck,
  CreditCard,
  MessageCircle,
  Users,
  Video,
  Wallet,
  LayoutTemplate,
} from "lucide-react";

export default function AdminOverviewPage() {
  const [state, setState] = useState({
    loading: true,
    error: "",
    stats: null,
    recentActivities: [],
    coursePerformance: [],
    studentProgressOverview: null,
    alerts: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/dashboard/stats", {
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !data?.ok) {
          setState((s) => ({ ...s, loading: false, error: data?.message || "تعذّر تحميل الإحصائيات." }));
          return;
        }
        setState({
          loading: false,
          error: "",
          stats: data.stats || null,
          recentActivities: Array.isArray(data.recentActivities) ? data.recentActivities : [],
          coursePerformance: Array.isArray(data.coursePerformance) ? data.coursePerformance : [],
          studentProgressOverview: data.studentProgressOverview || null,
          alerts: data.alerts || null,
        });
      } catch {
        if (!cancelled) {
          setState((s) => ({ ...s, loading: false, error: "تعذّر تحميل إحصائيات لوحة الإدارة." }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const statCards = useMemo(() => {
    const s = state.stats || {};
    return [
      { label: "إجمالي الطلاب", value: s.totalStudents ?? 0, Icon: Users },
      { label: "إجمالي الدورات", value: s.totalCourses ?? 0, Icon: BookOpen },
      { label: "الدورات المنشورة", value: s.publishedCourses ?? 0, Icon: BookOpen },
      { label: "الدورات المدفوعة", value: s.paidCourses ?? 0, Icon: Wallet },
      { label: "الدورات المجانية", value: s.freeCourses ?? 0, Icon: BookOpen },
      { label: "إجمالي الدروس", value: s.totalLessons ?? 0, Icon: BookText },
      { label: "الحصص المباشرة", value: s.totalLiveSessions ?? 0, Icon: Video },
      { label: "الحصص القادمة", value: s.upcomingLiveSessions ?? 0, Icon: Video },
      { label: "الواجبات والاختبارات", value: s.totalAssessments ?? 0, Icon: ClipboardCheck },
      { label: "إجابات الطلاب", value: s.totalSubmissions ?? 0, Icon: ClipboardCheck },
      { label: "الشهادات", value: s.totalCertificates ?? 0, Icon: Award },
      { label: "الشهادات الصالحة", value: s.activeCertificates ?? 0, Icon: Award },
      { label: "المحادثات", value: s.totalChatConversations ?? 0, Icon: MessageCircle },
      { label: "رسائل غير مقروءة", value: s.unreadStudentMessages ?? 0, Icon: MessageCircle },
      { label: "الإشعارات", value: s.totalNotificationsSent ?? 0, Icon: Bell },
      { label: "طلبات الشحن", value: s.totalRechargeRequests ?? 0, Icon: CreditCard },
      { label: "الإيرادات", value: `${Number(s.totalRevenue ?? 0)} دج`, Icon: Wallet },
    ];
  }, [state.stats]);

  const quickActions = [
    { href: "/admin/packages", label: "إضافة دورة", Icon: BookOpen },
    { href: "/admin/lessons", label: "إضافة درس", Icon: BookText },
    { href: "/admin/packages", label: "إضافة حصة مباشرة", Icon: Video },
    { href: "/admin/notifications", label: "إرسال إشعار", Icon: Bell },
    { href: "/admin/dashboard/messages", label: "محادثات الطلاب", Icon: MessageCircle },
    { href: "/admin/packages", label: "إدارة الاختبارات", Icon: ClipboardCheck },
    { href: "/admin/packages", label: "عرض الشهادات", Icon: Award },
    { href: "/admin/content", label: "إدارة محتوى الواجهة", Icon: LayoutTemplate },
    { href: "/admin/recharge-requests", label: "طلبات الشحن", Icon: CreditCard },
  ];

  return (
    <AdminShell
      title="لوحة الإدارة"
      subtitle="متابعة أداء المنصة وإدارة المحتوى التعليمي من لوحة موحدة."
    >
      <section className="interactive-card rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-slate-400">لوحة التحليلات</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">مراقبة شاملة لأداء المنصة</h2>
        <p className="mt-2 text-base text-slate-500">مؤشرات التشغيل اليومية، تنبيهات النظام، وأداء الدورات في مكان واحد.</p>
        {state.loading ? <p className="mt-4 text-sm text-slate-500">جاري تحميل البيانات...</p> : null}
        {state.error ? <p className="mt-4 text-sm text-red-700">{state.error}</p> : null}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="مؤشرات لوحة الإدارة">
        {statCards.map((card) => (
          <article key={card.label} className="interactive-card rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-400">{card.label}</p>
              <card.Icon className="h-4 w-4 text-brand-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="interactive-card rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">إجراءات سريعة</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {quickActions.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className="touch-button-secondary no-underline"
            >
              <item.Icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="interactive-card rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">آخر النشاطات</h3>
          {!state.recentActivities.length ? (
            <p className="mt-4 text-sm text-slate-500">لا يوجد نشاط حديث حاليًا.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {state.recentActivities.slice(0, 12).map((item, idx) => (
                <li key={`${item.type}-${item.timestamp}-${idx}`} className="interactive-card rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {item.studentName ? `الطالب: ${item.studentName}` : "—"}
                    {item.courseTitle ? ` • الدورة: ${item.courseTitle}` : ""}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">{new Date(item.timestamp).toLocaleString("ar-DZ")}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="interactive-card rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">تنبيهات مهمة</h3>
          <div className="mt-4 space-y-2 text-sm">
            <AlertRow label="محادثات بلا رد إداري" value={state.alerts?.unansweredChatConversations ?? 0} />
            <AlertRow label="حصص مباشرة اليوم" value={state.alerts?.upcomingLiveSessionsToday ?? 0} />
            <AlertRow label="تصحيحات معلقة" value={state.alerts?.pendingAssessmentCorrections ?? 0} />
            <AlertRow label="طلبات شحن معلقة" value={state.alerts?.pendingRechargeRequests ?? 0} />
            <AlertRow label="دورات غير منشورة" value={state.alerts?.draftCourses ?? 0} />
            <AlertRow label="دروس غير منشورة" value={state.alerts?.unpublishedLessons ?? 0} />
          </div>
        </section>
      </div>

      <section className="interactive-card rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">أداء الدورات</h3>
        {!state.coursePerformance.length ? (
          <p className="mt-4 text-sm text-slate-500">لا توجد بيانات كافية لعرض أداء الدورات.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-right text-xs font-semibold text-slate-500">
                  <th className="px-3 py-2">الدورة</th>
                  <th className="px-3 py-2">المشتركون</th>
                  <th className="px-3 py-2">متوسط التقدم</th>
                  <th className="px-3 py-2">الدروس</th>
                  <th className="px-3 py-2">الاختبارات</th>
                  <th className="px-3 py-2">الشهادات</th>
                  <th className="px-3 py-2">الإيراد</th>
                </tr>
              </thead>
              <tbody>
                {state.coursePerformance.map((row) => (
                  <tr key={row.courseId} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-semibold text-slate-900">{row.courseTitle}</td>
                    <td className="px-3 py-2">{row.enrolledStudents}</td>
                    <td className="px-3 py-2">{row.averageProgress}%</td>
                    <td className="px-3 py-2">{row.lessonsCount}</td>
                    <td className="px-3 py-2">{row.assessmentsCount}</td>
                    <td className="px-3 py-2">{row.certificatesIssued}</td>
                    <td className="px-3 py-2">{row.revenue} دج</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="interactive-card rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">متابعة تقدم الطلاب</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <article className="interactive-card rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <p className="text-xs text-slate-500">طلاب لم يبدأوا</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{state.studentProgressOverview?.studentsNotStarted ?? 0}</p>
          </article>
          <article className="interactive-card rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <p className="text-xs text-slate-500">طلاب قيد التقدم</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{state.studentProgressOverview?.studentsInProgress ?? 0}</p>
          </article>
          <article className="interactive-card rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <p className="text-xs text-slate-500">دورات مكتملة</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{state.studentProgressOverview?.studentsCompletedCourses ?? 0}</p>
          </article>
        </div>
        <div className="mt-4">
          <p className="text-sm font-semibold text-slate-700">آخر الدورات المكتملة</p>
          {!state.studentProgressOverview?.latestCompletedCourses?.length ? (
            <p className="mt-2 text-sm text-slate-500">لا توجد دورات مكتملة حديثًا.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {state.studentProgressOverview.latestCompletedCourses.map((row, idx) => (
                <li key={`${row.studentName}-${row.courseTitle}-${idx}`} className="interactive-card rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm">
                  <p className="font-semibold text-slate-900">{row.studentName} - {row.courseTitle}</p>
                  <p className="text-xs text-slate-500">{new Date(row.issuedAt).toLocaleString("ar-DZ")}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </AdminShell>
  );
}

function AlertRow({ label, value }) {
  return (
    <div className="interactive-card flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2">
      <span className="text-slate-700">{label}</span>
      <span className="font-extrabold text-brand-700">{value}</span>
    </div>
  );
}
