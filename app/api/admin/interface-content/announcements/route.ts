import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/auth/api-guards";
import {
  normalizeAnnouncementType,
  normalizeOptionalText,
  normalizeText,
  parseDateOrNull,
  validateOptionalUrl,
} from "@/lib/interface-content";

export const dynamic = "force-dynamic";

function normalizeAnnouncement(row: {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "URGENT";
  link: string | null;
  isPublished: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type,
    link: row.link || "",
    isPublished: row.isPublished,
    startsAt: row.startsAt ? row.startsAt.toISOString() : null,
    endsAt: row.endsAt ? row.endsAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function validatePayload(body: any) {
  const title = normalizeText(body?.title, 180);
  const message = normalizeText(body?.message, 1000);
  const type = normalizeAnnouncementType(body?.type);
  const startsAt = parseDateOrNull(body?.startsAt);
  const endsAt = parseDateOrNull(body?.endsAt);
  const isPublished = Boolean(body?.isPublished);

  if (!title) return { ok: false as const, message: "عنوان الإعلان مطلوب." };
  if (!message) return { ok: false as const, message: "نص الإعلان مطلوب." };
  if (startsAt && endsAt && startsAt.getTime() > endsAt.getTime()) {
    return { ok: false as const, message: "تاريخ البداية يجب أن يكون قبل تاريخ النهاية." };
  }

  const linkValidation = validateOptionalUrl(body?.link, { allowRelativePath: true });
  if (linkValidation.error) return { ok: false as const, message: `رابط الإعلان غير صالح: ${linkValidation.error}` };

  return {
    ok: true as const,
    data: {
      title,
      message,
      type,
      link: linkValidation.value,
      isPublished,
      startsAt,
      endsAt,
    },
  };
}

export async function GET() {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const rows = await prisma.announcement.findMany({
      orderBy: [{ createdAt: "desc" }],
    });
    return NextResponse.json({ ok: true, announcements: rows.map(normalizeAnnouncement) });
  } catch (error) {
    console.error("[admin/interface-content/announcements][GET] error:", error);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الإعلانات." }, { status: 500 });
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
    const created = await prisma.announcement.create({ data: valid.data });
    return NextResponse.json({ ok: true, message: "تمت إضافة الإعلان.", announcement: normalizeAnnouncement(created) });
  } catch (error) {
    console.error("[admin/interface-content/announcements][POST] error:", error);
    return NextResponse.json({ ok: false, message: "تعذّر إضافة الإعلان." }, { status: 500 });
  }
}
