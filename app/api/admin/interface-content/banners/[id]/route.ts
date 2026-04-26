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

function validatePatchPayload(body: any) {
  const data: any = {};

  if (body?.title !== undefined) {
    const title = normalizeText(body?.title, 180);
    if (!title) return { ok: false as const, message: "العنوان مطلوب." };
    data.title = title;
  }
  if (body?.subtitle !== undefined) data.subtitle = normalizeOptionalText(body?.subtitle, 500);
  if (body?.buttonText !== undefined) data.buttonText = normalizeOptionalText(body?.buttonText, 80);
  if (body?.isPublished !== undefined) data.isPublished = Boolean(body?.isPublished);
  if (body?.order !== undefined) data.order = normalizeOrder(body?.order);
  if (body?.startsAt !== undefined) data.startsAt = parseDateOrNull(body?.startsAt);
  if (body?.endsAt !== undefined) data.endsAt = parseDateOrNull(body?.endsAt);

  if (body?.imageUrl !== undefined) {
    const imageValidation = validateOptionalUrl(body?.imageUrl, { requireHttps: true });
    if (imageValidation.error) return { ok: false as const, message: `رابط الصورة غير صالح: ${imageValidation.error}` };
    data.imageUrl = imageValidation.value;
  }
  if (body?.buttonUrl !== undefined) {
    const buttonValidation = validateOptionalUrl(body?.buttonUrl, { allowRelativePath: true });
    if (buttonValidation.error) return { ok: false as const, message: `رابط الزر غير صالح: ${buttonValidation.error}` };
    data.buttonUrl = buttonValidation.value;
  }

  const startsAt = data.startsAt ?? (body?.startsAt === undefined ? undefined : null);
  const endsAt = data.endsAt ?? (body?.endsAt === undefined ? undefined : null);
  if (startsAt !== undefined && endsAt !== undefined && startsAt && endsAt && startsAt.getTime() > endsAt.getTime()) {
    return { ok: false as const, message: "تاريخ البداية يجب أن يكون قبل تاريخ النهاية." };
  }

  return { ok: true as const, data };
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const valid = validatePatchPayload(await req.json().catch(() => ({})));
    if (!valid.ok) {
      return NextResponse.json({ ok: false, message: valid.message }, { status: 400 });
    }
    await prisma.homepageBanner.update({
      where: { id: params.id },
      data: valid.data,
    });
    return NextResponse.json({ ok: true, message: "تم تعديل البانر." });
  } catch (error) {
    console.error("[admin/interface-content/banners/:id][PATCH] error:", error);
    return NextResponse.json({ ok: false, message: "تعذّر تعديل البانر." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    await prisma.homepageBanner.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true, message: "تم حذف البانر." });
  } catch (error) {
    console.error("[admin/interface-content/banners/:id][DELETE] error:", error);
    return NextResponse.json({ ok: false, message: "تعذّر حذف البانر." }, { status: 500 });
  }
}
