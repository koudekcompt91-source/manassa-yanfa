import StudentAppShell from "@/components/student/StudentAppShell";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <StudentAppShell>{children}</StudentAppShell>;
}
