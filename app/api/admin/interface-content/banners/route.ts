import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import {
  normalizeOptionalText,
  normalizeOrder,
  normalizeText,
  parseDateOrNull,
  validateOptionalUrl,
} from "@/lib/interface-content";

export const dynamic = "force-dynamic";

function normalizeBanner(row: {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  isPublished: boolean;
  order: number;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || "",
    imageUrl: row.imageUrl || "",
    buttonText: row.buttonText || "",
    buttonUrl: row.buttonUrl || "",
    isPublished: row.isPublished,
    order: row.order,
    startsAt: row.startsAt ? row.startsAt.toISOString() : null,
    endsAt: row.endsAt ? row.endsAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function validatePayload(body: any) {
  const title = normalizeText(body?.title, 180);
  const subtitle = normalizeOptionalText(body?.subtitle, 500);
  const buttonText = normalizeOptionalText(body?.buttonText, 80);
  const order = normalizeOrder(body?.order);
  const startsAt = parseDateOrNull(body?.startsAt);
  const endsAt = parseDateOrNull(body?.endsAt);
  const isPublished = Boolean(body?.isPublished);

  if (!title) {
    return { ok: false as const, message: "العنوان مطلوب." };
  }
  if (startsAt && endsAt && startsAt.getTime() > endsAt.getTime()) {
    return { ok: false as const, message: "تاريخ البداية يجب أن يكون قبل تاريخ النهاية." };
  }

  const imageValidation = validateOptionalUrl(body?.imageUrl, { requireHttps: true });
  if (imageValidation.error) return { ok: false as const, message: `رابط الصورة غير صالح: ${imageValidation.error}` };

  const buttonValidation = validateOptionalUrl(body?.buttonUrl, { allowRelativePath: true });
  if (buttonValidation.error) return { ok: false as const, message: `رابط الزر غير صالح: ${buttonValidation.error}` };

  return {
    ok: true as const,
    data: {
      title,
      subtitle,
      imageUrl: imageValidation.value,
      buttonText,
      buttonUrl: buttonValidation.value,
      isPublished,
      order,
      startsAt,
      endsAt,
    },
  };
}

export async function GET() {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const rows = await prisma.homepageBanner.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ ok: true, banners: rows.map(normalizeBanner) });
  } catch (error) {
    console.error("[admin/interface-content/banners][GET] error:", error);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل السلايدر الرئيسي." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const valid = validatePayload(await req.json().catch(() => ({})));
    if (!valid.ok) {
      return NextResponse.json({ ok: false, message: valid.message }, { status: 400 });
    }
    const created = await prisma.homepageBanner.create({ data: valid.data });
    return NextResponse.json({ ok: true, message: "تمت إضافة البانر.", banner: normalizeBanner(created) });
  } catch (error) {
    console.error("[admin/interface-content/banners][POST] error:", error);
    return NextResponse.json({ ok: false, message: "تعذّر إضافة البانر." }, { status: 500 });
  }
}
