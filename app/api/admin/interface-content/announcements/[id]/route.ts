import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import {
  normalizeAnnouncementType,
  normalizeText,
  parseDateOrNull,
  validateOptionalUrl,
} from "@/lib/interface-content";

function validatePatchPayload(body: any) {
  const data: any = {};

  if (body?.title !== undefined) {
    const title = normalizeText(body?.title, 180);
    if (!title) return { ok: false as const, message: "عنوان الإعلان مطلوب." };
    data.title = title;
  }
  if (body?.message !== undefined) {
    const message = normalizeText(body?.message, 1000);
    if (!message) return { ok: false as const, message: "نص الإعلان مطلوب." };
    data.message = message;
  }
  if (body?.type !== undefined) data.type = normalizeAnnouncementType(body?.type);
  if (body?.isPublished !== undefined) data.isPublished = Boolean(body?.isPublished);
  if (body?.startsAt !== undefined) data.startsAt = parseDateOrNull(body?.startsAt);
  if (body?.endsAt !== undefined) data.endsAt = parseDateOrNull(body?.endsAt);
  if (body?.link !== undefined) {
    const linkValidation = validateOptionalUrl(body?.link, { allowRelativePath: true });
    if (linkValidation.error) return { ok: false as const, message: `رابط الإعلان غير صالح: ${linkValidation.error}` };
    data.link = linkValidation.value;
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
    await prisma.announcement.update({
      where: { id: params.id },
      data: valid.data,
    });
    return NextResponse.json({ ok: true, message: "تم تعديل الإعلان." });
  } catch (error) {
    console.error("[admin/interface-content/announcements/:id][PATCH] error:", error);
    return NextResponse.json({ ok: false, message: "تعذّر تعديل الإعلان." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    await prisma.announcement.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true, message: "تم حذف الإعلان." });
  } catch (error) {
    console.error("[admin/interface-content/announcements/:id][DELETE] error:", error);
    return NextResponse.json({ ok: false, message: "تعذّر حذف الإعلان." }, { status: 500 });
  }
}
