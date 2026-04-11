import StudentAppShell from "@/components/student/StudentAppShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <StudentAppShell>{children}</StudentAppShell>;
}
