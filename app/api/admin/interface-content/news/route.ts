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

function normalizeNews(row: {
  id: string;
  title: string;
  summary: string;
  icon: string | null;
  link: string | null;
  isPublished: boolean;
  order: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    icon: row.icon || "",
    link: row.link || "",
    isPublished: row.isPublished,
    order: row.order,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function validatePayload(body: any) {
  const title = normalizeText(body?.title, 180);
  const summary = normalizeText(body?.summary ?? body?.content, 700);
  const icon = normalizeOptionalText(body?.icon, 80);
  const isPublished = Boolean(body?.isPublished);
  const order = normalizeOrder(body?.order);
  const publishedAt = parseDateOrNull(body?.publishedAt);

  if (!title) return { ok: false as const, message: "عنوان الخبر مطلوب." };
  if (!summary) return { ok: false as const, message: "ملخص الخبر مطلوب." };

  const linkValidation = validateOptionalUrl(body?.link, { allowRelativePath: true });
  if (linkValidation.error) return { ok: false as const, message: `رابط الخبر غير صالح: ${linkValidation.error}` };

  return {
    ok: true as const,
    data: {
      title,
      summary,
      icon,
      link: linkValidation.value,
      isPublished,
      order,
      publishedAt,
    },
  };
}

export async function GET() {
  const guard = await requireAdminApiSession();
  if (!guard.ok) return guard.response;

  try {
    const rows = await prisma.newsItem.findMany({
      orderBy: [{ order: "asc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ ok: true, news: rows.map(normalizeNews) });
  } catch (error) {
    console.error("[admin/interface-content/news][GET] error:", error);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل الأخبار." }, { status: 500 });
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
    const created = await prisma.newsItem.create({ data: valid.data });
    return NextResponse.json({ ok: true, message: "تمت إضافة الخبر.", newsItem: normalizeNews(created) });
  } catch (error) {
    console.error("[admin/interface-content/news][POST] error:", error);
    return NextResponse.json({ ok: false, message: "تعذّر إضافة الخبر." }, { status: 500 });
  }
}
