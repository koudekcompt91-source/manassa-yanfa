import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { validateStoreItemInput } from "@/lib/store-validation";
import { StoreItemStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function normalizeItem(item: {
  id: string;
  title: string;
  description: string;
  price: number;
  isFree: boolean;
  imageUrl: string | null;
  teacherId: string | null;
  status: StoreItemStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  teacher?: { fullName: string } | null;
  _count?: { orders: number };
}) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    price: item.price,
    isFree: item.isFree,
    imageUrl: item.imageUrl,
    teacherId: item.teacherId,
    teacherName: item.teacher?.fullName || "",
    status: item.status,
    isPublished: item.status === "PUBLISHED",
    order: item.order,
    ordersCount: item._count?.orders ?? 0,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });
  }

  try {
    const items = await prisma.storeItem.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { teacher: { select: { fullName: true } }, _count: { select: { orders: true } } },
    });
    return NextResponse.json({ ok: true, items: items.map(normalizeItem) });
  } catch (e) {
    console.error("[admin/store/items][GET] error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل عناصر المتجر." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 403 });
  }

  try {
    const valid = validateStoreItemInput(await req.json());
    if (!valid.ok) {
      return NextResponse.json({ ok: false, message: valid.message }, { status: 400 });
    }

    // Ensure the assigned owner is an actual teacher account.
    if (valid.value.teacherId) {
      const teacher = await prisma.user.findFirst({
        where: { id: valid.value.teacherId, role: "TEACHER" },
        select: { id: true },
      });
      if (!teacher) {
        return NextResponse.json({ ok: false, message: "الأستاذ المحدد غير موجود." }, { status: 400 });
      }
    }

    const orderMax = await prisma.storeItem.aggregate({ _max: { order: true } });
    const order = (orderMax._max.order ?? 0) + 1;

    const item = await prisma.storeItem.create({
      data: { ...valid.value, order },
      include: { teacher: { select: { fullName: true } }, _count: { select: { orders: true } } },
    });

    return NextResponse.json({ ok: true, message: "تم إنشاء العنصر بنجاح.", item: normalizeItem(item) });
  } catch (e) {
    console.error("[admin/store/items][POST] error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, message: "تعذّر إنشاء العنصر." }, { status: 500 });
  }
}
