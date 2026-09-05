import type { Metadata } from "next";
import { requireFreeStudentPage } from "@/lib/subscription-server";

export const metadata: Metadata = {
  title: "لوحة الحساب المجاني",
  description: "دورات ومستندات مجانية لمستواك الدراسي.",
  robots: { index: false, follow: false },
};

/** Auth gate only — no nested navbar (root layout already renders Navbar). */
export default async function FreeDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireFreeStudentPage();
  return children;
}
