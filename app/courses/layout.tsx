import StudentAppShell from "@/components/student/StudentAppShell";

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <StudentAppShell>{children}</StudentAppShell>;
}
