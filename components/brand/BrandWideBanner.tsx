"use client";

import Image from "next/image";

const BANNER_SRC = "/brand/yanfa-dashboard-banner-16-5.png";

type BrandWideBannerProps = {
  priority?: boolean;
  className?: string;
};

export default function BrandWideBanner({ priority = false, className = "" }: BrandWideBannerProps) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl aspect-[16/5] ${className}`.trim()}
    >
      <Image
        src={BANNER_SRC}
        alt="يوسف مادن — TECH ENTERPRISE"
        fill
        sizes="(max-width: 1280px) 100vw, 1280px"
        priority={priority}
        className="object-cover object-center"
      />
    </div>
  );
}
