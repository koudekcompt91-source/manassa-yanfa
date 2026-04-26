import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function inActiveWindow(now: Date, startsAt: Date | null, endsAt: Date | null) {
  if (startsAt && startsAt.getTime() > now.getTime()) return false;
  if (endsAt && endsAt.getTime() < now.getTime()) return false;
  return true;
}

export async function GET() {
  try {
    const now = new Date();
    const [allBanners, allNews, allAnnouncements] = await Promise.all([
      prisma.homepageBanner.findMany({
        where: { isPublished: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
      prisma.newsItem.findMany({
        where: { isPublished: true },
        orderBy: [{ order: "asc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
        take: 8,
      }),
      prisma.announcement.findMany({
        where: { isPublished: true },
        orderBy: [{ createdAt: "desc" }],
        take: 8,
      }),
    ]);

    const banners = allBanners
      .filter((row) => inActiveWindow(now, row.startsAt, row.endsAt))
      .map((row) => ({
        id: row.id,
        title: row.title,
        subtitle: row.subtitle || "",
        imageUrl: row.imageUrl || "",
        buttonText: row.buttonText || "",
        buttonUrl: row.buttonUrl || "",
        order: row.order,
      }));

    const news = allNews
      .filter((row) => !row.publishedAt || row.publishedAt.getTime() <= now.getTime())
      .map((row) => ({
        id: row.id,
        title: row.title,
        summary: row.summary,
        icon: row.icon || "",
        link: row.link || "",
        publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
      }));

    const announcements = allAnnouncements
      .filter((row) => inActiveWindow(now, row.startsAt, row.endsAt))
      .map((row) => ({
        id: row.id,
        title: row.title,
        message: row.message,
        type: row.type,
        link: row.link || "",
      }));

    let featuredCourses = await prisma.course.findMany({
      where: {
        status: "PUBLISHED",
        isFeatured: true,
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 6,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        accessType: true,
        price: true,
      },
    });

    if (!featuredCourses.length) {
      featuredCourses = await prisma.course.findMany({
        where: { status: "PUBLISHED" },
        orderBy: [{ createdAt: "desc" }],
        take: 6,
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          thumbnailUrl: true,
          accessType: true,
          price: true,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      content: {
        banners,
        news,
        announcements,
        featuredCourses: featuredCourses.map((row) => ({
          id: row.id,
          slug: row.slug,
          title: row.title,
          description: row.description || "",
          coverImage: row.thumbnailUrl || "",
          accessType: row.accessType,
          priceMad: row.price,
          isFree: row.accessType === "FREE" || Number(row.price || 0) <= 0,
        })),
      },
    });
  } catch (error) {
    console.error("[homepage/content][GET] error:", error);
    return NextResponse.json({ ok: false, message: "تعذّر تحميل محتوى الواجهة." }, { status: 500 });
  }
}
