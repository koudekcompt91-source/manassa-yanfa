import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { certificateCode: string } }) {
  try {
    const code = decodeURIComponent(String(params.certificateCode || "")).trim();
    if (!code) return NextResponse.json({ ok: false, valid: false, message: "الشهادة غير موجودة." }, { status: 404 });

    const certificate = await prisma.certificate.findUnique({
      where: { certificateCode: code },
      include: {
        student: { select: { fullName: true } },
        course: { select: { title: true } },
      },
    });
    if (!certificate) return NextResponse.json({ ok: true, valid: false });

    return NextResponse.json({
      ok: true,
      valid: certificate.status === "ACTIVE",
      status: certificate.status,
      certificateCode: certificate.certificateCode,
      studentName: certificate.student.fullName,
      courseTitle: certificate.course.title,
      issuedAt: certificate.issuedAt.toISOString(),
      platformNameAr: "منصة ينفع",
      platformNameEn: "Yanfa Education",
    });
  } catch (e) {
    console.error("[certificates/verify/:code][GET] error:", e);
    return NextResponse.json({ ok: false, valid: false, message: "تعذّر التحقق من الشهادة." }, { status: 500 });
  }
}
