import type { Metadata } from "next";
import FreeStudentShell from "@/components/student/FreeStudentShell";
import { requireFreeStudentPage } from "@/lib/subscription-server";

export const metadata: Metadata = {
  title: "لوحة الحساب المجاني",
  description: "دورات ومستندات مجانية لمستواك الدراسي.",
  robots: { index: false, follow: false },
};

export default async function FreeDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireFreeStudentPage();
  return <FreeStudentShell>{children}</FreeStudentShell>;
}
