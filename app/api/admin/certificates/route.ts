import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import { prisma } from "@/lib/prisma";
import { serializeCertificate } from "@/lib/certificates";

export async function GET(req: Request) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const url = new URL(req.url);
    const courseId = String(url.searchParams.get("courseId") || "").trim();
    const status = String(url.searchParams.get("status") || "").trim().toUpperCase();
    const where: { courseId?: string; status?: "ACTIVE" | "REVOKED" } = {};
    if (courseId) where.courseId = courseId;
    if (status === "ACTIVE" || status === "REVOKED") where.status = status;

    const rows = await prisma.certificate.findMany({
      where,
      include: {
        student: { select: { fullName: true, email: true } },
        course: { select: { title: true, slug: true, teacherId: true } },
      },
      orderBy: [{ issuedAt: "desc" }],
      take: 500,
    });

    return NextResponse.json({
      ok: true,
      certificates: rows.map((row) => serializeCertificate(row)),
    });
  } catch (e) {
    console.error("[admin/certificates][GET] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الشهادات." }, { status: 500 });
  }
}
