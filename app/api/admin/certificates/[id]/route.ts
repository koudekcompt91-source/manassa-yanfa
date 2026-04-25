import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import { prisma } from "@/lib/prisma";
import { serializeCertificate } from "@/lib/certificates";

function nextCode() {
  return `YNF-${new Date().getFullYear()}-${randomBytes(6).toString("hex").toUpperCase()}`;
}

async function uniqueCode() {
  for (let i = 0; i < 8; i += 1) {
    const code = nextCode();
    const exists = await prisma.certificate.findUnique({ where: { certificateCode: code }, select: { id: true } });
    if (!exists) return code;
  }
  return `YNF-${Date.now()}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const id = String(params.id || "").trim();
    if (!id) return NextResponse.json({ ok: false, message: "الشهادة غير موجودة." }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "").trim().toUpperCase();
    if (action !== "REVOKE" && action !== "REISSUE") {
      return NextResponse.json({ ok: false, message: "إجراء غير صالح." }, { status: 400 });
    }

    const existing = await prisma.certificate.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return NextResponse.json({ ok: false, message: "الشهادة غير موجودة." }, { status: 404 });

    let updated;
    if (action === "REVOKE") {
      updated = await prisma.certificate.update({
        where: { id },
        data: { status: "REVOKED", revokedAt: new Date() },
        include: {
          student: { select: { fullName: true, email: true } },
          course: { select: { title: true, slug: true, teacherId: true } },
        },
      });
    } else {
      const code = await uniqueCode();
      updated = await prisma.certificate.update({
        where: { id },
        data: {
          status: "ACTIVE",
          revokedAt: null,
          issuedAt: new Date(),
          certificateCode: code,
        },
        include: {
          student: { select: { fullName: true, email: true } },
          course: { select: { title: true, slug: true, teacherId: true } },
        },
      });
    }

    return NextResponse.json({ ok: true, certificate: serializeCertificate(updated) });
  } catch (e) {
    console.error("[admin/certificates/:id][PATCH] error:", e);
    return NextResponse.json({ ok: false, message: "تعذّر تحديث الشهادة." }, { status: 500 });
  }
}
