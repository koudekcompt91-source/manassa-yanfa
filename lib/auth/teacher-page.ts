import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTeacherSessionFromCookies } from "@/lib/auth/session";

export async function requireTeacherPage() {
  const session = await getTeacherSessionFromCookies();
  if (!session?.sub) redirect("/teacher/login");

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, fullName: true, role: true, status: true },
  });

  if (!user || user.role !== "TEACHER" || user.status !== "ACTIVE") {
    redirect("/teacher/login");
  }

  return { session, user };
}
