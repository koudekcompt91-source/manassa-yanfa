import type { Metadata } from "next";
import { requireTeacherPage } from "@/lib/auth/teacher-page";

export const metadata: Metadata = {
  title: "لوحة الأستاذ",
  robots: { index: false, follow: false },
};

export default async function TeacherDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireTeacherPage();
  return children;
}
