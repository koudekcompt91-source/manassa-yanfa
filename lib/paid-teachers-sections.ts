import {
  BookOpen,
  BookOpenCheck,
  ClipboardCheck,
  FileText,
  Library,
  MonitorPlay,
  PenLine,
  Radio,
} from "lucide-react";

/**
 * PAID "أساتذتي" hub sections — exact order, ready for future paid-content admin.
 * Paths live under /dashboard/teachers (PAID shell only).
 */
export const TEACHERS_SECTIONS = [
  {
    id: "diagnostic",
    href: "/dashboard/teachers/diagnostic",
    title: "تقويمات تشخيصية",
    description: "اختبارات وتقويمات تشخيصية لتحديد مستواك ونقاط القوة والضعف.",
    Icon: ClipboardCheck,
    tone: "from-sky-500 to-brand-600",
    badges: ["VIP"],
  },
  {
    id: "live",
    href: "/dashboard/teachers/live",
    title: "بثوث مباشرة",
    description: "حصص البث المباشر مع الأساتذة عبر الجلسات المجدولة داخل المنصة.",
    Icon: Radio,
    tone: "from-rose-500 to-orange-500",
    badges: ["LIVE"],
  },
  {
    id: "lessons",
    href: "/dashboard/teachers/lessons",
    title: "دروسي",
    description: "دروسك المسجّلة المرتبطة بأساتذتك ومسارك الدراسي المدفوع.",
    Icon: BookOpen,
    tone: "from-brand-600 to-indigo-600",
    badges: [],
  },
  {
    id: "summaries",
    href: "/dashboard/teachers/summaries",
    title: "ملخصاتي",
    description: "ملخصات ومواد مراجعة مركزة بصيغة PDF من محتوى الأساتذة.",
    Icon: FileText,
    tone: "from-emerald-500 to-teal-600",
    badges: ["PDF"],
  },
  {
    id: "homework",
    href: "/dashboard/teachers/homework",
    title: "واجباتي المنزلية",
    description: "الواجبات المنزلية المطلوبة من الأساتذة لمتابعة تقدمك اليومي.",
    Icon: PenLine,
    tone: "from-amber-500 to-orange-600",
    badges: [],
  },
  {
    id: "assignments",
    href: "/dashboard/teachers/assignments",
    title: "فروضي",
    description: "الفروض المحروسة والتقييمات الفصلية ضمن المحتوى المدفوع.",
    Icon: ClipboardCheck,
    tone: "from-violet-600 to-indigo-700",
    badges: ["PDF"],
  },
  {
    id: "exams",
    href: "/dashboard/teachers/exams",
    title: "اختباراتي",
    description: "نماذج الاختبارات الفصلية وسلالم التصحيح الخاصة بأساتذتك.",
    Icon: BookOpenCheck,
    tone: "from-indigo-600 to-violet-700",
    badges: ["PDF"],
  },
  {
    id: "electronic-exam",
    href: "/dashboard/teachers/electronic-exam",
    title: "اختبار إلكتروني",
    description: "اختبارات إلكترونية تفاعلية مع تصحيح ومتابعة فورية داخل المنصة.",
    Icon: MonitorPlay,
    tone: "from-cyan-500 to-brand-600",
    badges: ["VIP"],
  },
  {
    id: "library",
    href: "/dashboard/teachers/library",
    title: "مكتبتي",
    description: "مكتبة مواردك التعليمية والملفات المرتبطة بمسارك المدفوع.",
    Icon: Library,
    tone: "from-slate-600 to-slate-800",
    badges: [],
  },
] as const;

export type TeachersSectionId = (typeof TEACHERS_SECTIONS)[number]["id"];

export function getTeachersSection(id: string) {
  return TEACHERS_SECTIONS.find((s) => s.id === id) || null;
}
