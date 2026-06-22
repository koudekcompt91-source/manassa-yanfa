import type { Metadata } from "next";
import StudentAppShell from "@/components/student/StudentAppShell";

export const metadata: Metadata = {
  title: "المتجر",
  description: "تصفح عناصر المتجر المقدّمة من الأساتذة وأرسل طلب شراء.",
  robots: { index: false, follow: false },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <StudentAppShell>{children}</StudentAppShell>;
}
