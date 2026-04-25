import { NextResponse } from "next/server";
import { requireStudentApiSession } from "@/lib/auth/api-guards";
import { prisma } from "@/lib/prisma";
import { serializeCertificate } from "@/lib/certificates";

export async function GET() {
  const guard = await requireStudentApiSession();
  if (!guard.ok) return guard.response;

  try {
    const rows = await prisma.certificate.findMany({
      where: { studentId: guard.session.sub },
      include: {
        student: { select: { fullName: true, email: true } },
        course: { select: { title: true, slug: true, teacherId: true } },
      },
      orderBy: [{ issuedAt: "desc" }],
    });

    return NextResponse.json({
      ok: true,
      certificates: rows.map((row) => serializeCertificate(row)),
    });
  } catch (e) {
    console.error("[certificates][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الشهادات." }, { status: 500 });
  }
}
