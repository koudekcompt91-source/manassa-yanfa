import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await prisma.learningPath.findMany({
      where: { isPublished: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        icon: true,
        color: true,
        order: true,
      },
    });

    return NextResponse.json({
      ok: true,
      learningPaths: rows.map((row) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description || "",
        icon: row.icon || "",
        color: row.color || "",
        order: row.order,
      })),
    });
  } catch (error) {
    console.error("[learning-paths][GET] error:", error);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل المسارات التعليمية." }, { status: 500 });
  }
}
