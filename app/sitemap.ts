import type { MetadataRoute } from "next";
import { CourseStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site-config";

/** Course URLs are fetched at request time so builds work without DATABASE_URL. */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/register`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/courses`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/packages`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
  ];

  try {
    const courses = await prisma.course.findMany({
      where: { status: CourseStatus.PUBLISHED },
      select: { slug: true, updatedAt: true },
      orderBy: [{ updatedAt: "desc" }],
    });

    const courseEntries: MetadataRoute.Sitemap = courses.map((c) => ({
      url: `${SITE_URL}/packages/${encodeURIComponent(c.slug)}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticEntries, ...courseEntries];
  } catch (e) {
    console.error("[sitemap] Failed to load courses:", e);
    return staticEntries;
  }
}
