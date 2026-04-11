import StudentAppShell from "@/components/student/StudentAppShell";

export default function PackagesLayout({ children }: { children: React.ReactNode }) {
  return <StudentAppShell>{children}</StudentAppShell>;
}
