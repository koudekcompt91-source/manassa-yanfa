import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { validateStoreItemInput } from "@/lib/store-validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });
  }

  try {
    const body = await req.json();

    const existing = await prisma.storeItem.findUnique({
      where: { id: params.id },
      select: { id: true, title: true, description: true, price: true, isFree: true, imageUrl: true, wilaya: true, teacherId: true, status: true },
    });
    if (!existing) {
      return NextResponse.json({ ok: false, message: "العنصر غير موجود." }, { status: 404 });
    }

    // Lightweight visibility-only toggle (publish / unpublish) keeps other fields intact.
    if (typeof body?.status === "string" && Object.keys(body).length === 1) {
      const nextStatus = String(body.status).trim().toUpperCase() === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
      if (nextStatus === "PUBLISHED" && !existing.teacherId) {
        return NextResponse.json({ ok: false, message: "يجب اختيار الأستاذ المالك قبل نشر العنصر." }, { status: 400 });
      }
      const updated = await prisma.storeItem.update({ where: { id: params.id }, data: { status: nextStatus } });
      return NextResponse.json({ ok: true, message: "تم تحديث حالة العنصر.", item: { id: updated.id, status: updated.status } });
    }

    // Full update — merge incoming values over existing ones, then validate.
    const merged = {
      title: body?.title ?? existing.title,
      description: body?.description ?? existing.description,
      price: body?.price ?? existing.price,
      isFree: body?.isFree ?? existing.isFree,
      imageUrl: body?.imageUrl ?? existing.imageUrl,
      wilaya: body?.wilaya ?? existing.wilaya,
      teacherId: body?.teacherId ?? existing.teacherId,
      status: body?.status ?? existing.status,
    };
    const valid = validateStoreItemInput(merged);
    if (!valid.ok) {
      return NextResponse.json({ ok: false, message: valid.message }, { status: 400 });
    }

    if (valid.value.teacherId) {
      const teacher = await prisma.user.findFirst({
        where: { id: valid.value.teacherId, role: "TEACHER" },
        select: { id: true },
      });
      if (!teacher) {
        return NextResponse.json({ ok: false, message: "الأستاذ المحدد غير موجود." }, { status: 400 });
      }
    }

    const item = await prisma.storeItem.update({
      where: { id: params.id },
      data: valid.value,
      include: { teacher: { select: { fullName: true } }, _count: { select: { orders: true } } },
    });

    return NextResponse.json({
      ok: true,
      message: "تم تحديث العنصر.",
      item: {
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        isFree: item.isFree,
        imageUrl: item.imageUrl,
        wilaya: item.wilaya,
        teacherId: item.teacherId,
        teacherName: item.teacher?.fullName || "",
        status: item.status,
        isPublished: item.status === "PUBLISHED",
        order: item.order,
        ordersCount: item._count?.orders ?? 0,
      },
    });
  } catch (e) {
    console.error("[admin/store/items/:id][PATCH] error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, message: "تعذّر تحديث العنصر." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });
  }

  try {
    await prisma.storeItem.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true, message: "تم حذف العنصر." });
  } catch (e) {
    console.error("[admin/store/items/:id][DELETE] error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, message: "تعذّر حذف العنصر." }, { status: 500 });
  }
}
