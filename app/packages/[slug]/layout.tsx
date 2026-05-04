import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CourseStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, HOME_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-config";

function ogImageUrl(thumbnailUrl: string | null): string | undefined {
  if (!thumbnailUrl?.trim()) return `${SITE_URL}/brand/yanfa-icon-mark.png`;
  const t = thumbnailUrl.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  return `${SITE_URL}${t.startsWith("/") ? t : `/${t}`}`;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = decodeURIComponent(String(params.slug || "")).trim();
  if (!slug) {
    return {
      title: "دورة",
      robots: { index: false, follow: false },
    };
  }

  try {
    const course = await prisma.course.findFirst({
      where: { slug, status: CourseStatus.PUBLISHED },
      select: { title: true, description: true, thumbnailUrl: true },
    });

    if (!course) {
      return {
        title: "الدورة غير متاحة",
        description: "هذه الدورة غير منشورة أو غير متوفرة.",
        robots: { index: false, follow: false },
        alternates: { canonical: `/packages/${encodeURIComponent(slug)}` },
      };
    }

    const rawDesc = (course.description || "").trim().replace(/\s+/g, " ");
    const description =
      rawDesc.length > 155 ? `${rawDesc.slice(0, 152)}…` : rawDesc || "دورة على منصة ينفع لتعلم الأدب العربي وعلومه.";

    const canonicalPath = `/packages/${encodeURIComponent(slug)}`;
    const ogImage = ogImageUrl(course.thumbnailUrl);

    return {
      title: course.title,
      description,
      alternates: { canonical: canonicalPath },
      openGraph: {
        title: `${course.title} | ${SITE_NAME}`,
        description,
        url: absoluteUrl(canonicalPath),
        siteName: SITE_NAME,
        locale: "ar_DZ",
        type: "website",
        images: ogImage ? [{ url: ogImage, alt: course.title }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: `${course.title} | ${SITE_NAME}`,
        description,
        images: ogImage ? [ogImage] : undefined,
      },
    };
  } catch (e) {
    console.error("[packages/[slug]] generateMetadata:", e);
    return {
      title: "دورة",
      description: HOME_DESCRIPTION,
      robots: { index: false, follow: false },
    };
  }
}

export default function PackageSlugLayout({ children }: { children: ReactNode }) {
  return children;
}
