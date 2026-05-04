import type { Metadata } from "next";
import StudentAppShell from "@/components/student/StudentAppShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <StudentAppShell>{children}</StudentAppShell>;
}
