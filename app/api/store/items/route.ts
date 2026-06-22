import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudentApiSession } from "@/lib/auth/api-guards";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Student marketplace: only PUBLISHED items are ever returned here. */
export async function GET() {
  const guard = await requireStudentApiSession();
  if (!guard.ok) return guard.response;

  try {
    const items = await prisma.storeItem.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        isFree: true,
        imageUrl: true,
        wilaya: true,
        createdAt: true,
        teacher: { select: { fullName: true } },
      },
    });

    return NextResponse.json({
      ok: true,
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        isFree: item.isFree || item.price <= 0,
        imageUrl: item.imageUrl,
        wilaya: item.wilaya || "",
        teacherName: item.teacher?.fullName || "",
        createdAt: item.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    console.error("[store/items][GET] error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل عناصر المتجر." }, { status: 500 });
  }
}
