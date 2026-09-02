import type { Metadata } from "next";
import StudentAppShell from "@/components/student/StudentAppShell";
import { requirePaidStudentPage } from "@/lib/subscription-server";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requirePaidStudentPage();
  return <StudentAppShell>{children}</StudentAppShell>;
}
