import { NextResponse } from "next/server";
import { requireStudentApiSession } from "@/lib/auth/api-guards";
import { prisma } from "@/lib/prisma";
import { serializeCertificate } from "@/lib/certificates";

export async function GET(_: Request, { params }: { params: { certificateCode: string } }) {
  const guard = await requireStudentApiSession();
  if (!guard.ok) return guard.response;
  const studentId = guard.session.sub;

  try {
    const code = decodeURIComponent(String(params.certificateCode || "")).trim();
    if (!code) return NextResponse.json({ ok: false, message: "الشهادة غير موجودة." }, { status: 404 });

    const certificate = await prisma.certificate.findUnique({
      where: { certificateCode: code },
      include: {
        student: { select: { id: true, fullName: true, email: true } },
        course: { select: { title: true, slug: true, teacherId: true } },
      },
    });
    if (!certificate || certificate.studentId !== studentId) {
      return NextResponse.json({ ok: false, message: "غير مصرح لك بهذه الشهادة." }, { status: 403 });
    }

    return NextResponse.json({
      ok: true,
      certificate: serializeCertificate(certificate),
    });
  } catch (e) {
    console.error("[certificates/:code][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الشهادة." }, { status: 500 });
  }
}
