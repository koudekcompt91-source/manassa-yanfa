import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "دخول الأستاذ",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function TeacherLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
