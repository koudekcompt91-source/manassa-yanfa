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
    if (!title) return { ok: false as const, message: "عنوان الخبر مطلوب." };
    data.title = title;
  }
  if (body?.summary !== undefined || body?.content !== undefined) {
    const summary = normalizeText(body?.summary ?? body?.content, 700);
    if (!summary) return { ok: false as const, message: "ملخص الخبر مطلوب." };
    data.summary = summary;
  }
  if (body?.icon !== undefined) data.icon = normalizeOptionalText(body?.icon, 80);
  if (body?.isPublished !== undefined) data.isPublished = Boolean(body?.isPublished);
  if (body?.order !== undefined) data.order = normalizeOrder(body?.order);
  if (body?.publishedAt !== undefined) data.publishedAt = parseDateOrNull(body?.publishedAt);
  if (body?.link !== undefined) {
    const linkValidation = validateOptionalUrl(body?.link, { allowRelativePath: true });
    if (linkValidation.error) return { ok: false as const, message: `رابط الخبر غير صالح: ${linkValidation.error}` };
    data.link = linkValidation.value;
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
    await prisma.newsItem.update({
      where: { id: params.id },
      data: valid.data,
    });
    return NextResponse.json({ ok: true, message: "تم تعديل الخبر." });
  } catch (error) {
    console.error("[admin/interface-content/news/:id][PATCH] error:", error);
    return NextResponse.json({ ok: false, message: "تعذّر تعديل الخبر." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    await prisma.newsItem.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true, message: "تم حذف الخبر." });
  } catch (error) {
    console.error("[admin/interface-content/news/:id][DELETE] error:", error);
    return NextResponse.json({ ok: false, message: "تعذّر حذف الخبر." }, { status: 500 });
  }
}
