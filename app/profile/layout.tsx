import type { Metadata } from "next";
import StudentAppShell from "@/components/student/StudentAppShell";
import { resolveStudentSubscription } from "@/lib/subscription-server";
import { isFreeSubscription } from "@/lib/subscription";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** FREE students keep profile access without paid dashboard chrome. */
export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const ctx = await resolveStudentSubscription();
  if (ctx && isFreeSubscription(ctx.subscriptionType)) {
    return <>{children}</>;
  }
  return <StudentAppShell>{children}</StudentAppShell>;
}
