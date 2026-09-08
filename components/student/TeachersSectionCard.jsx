"use client";

import Link from "next/link";

const BADGE_CLASS = {
  PDF: "bg-red-100 text-red-700",
  VIP: "bg-amber-100 text-amber-800",
  LIVE: "bg-rose-100 text-rose-700",
};

/**
 * Full-width horizontal section card for PAID أساتذتي hub.
 * Entire card is one link: icon right · copy · دخول القسم left.
 */
export default function TeachersSectionCard({
  title,
  description,
  href,
  Icon,
  tone = "from-brand-600 to-indigo-600",
  badges = [],
}) {
  return (
    <Link
      href={href}
      className="dashboard-nav-row group block w-full no-underline"
      aria-label={title}
    >
      <span
        className={`dashboard-nav-row-icon bg-gradient-to-br text-white ${tone}`}
        aria-hidden
      >
        {Icon ? <Icon className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={1.75} /> : null}
      </span>

      <span className="dashboard-nav-row-copy">
        <span className="dashboard-nav-row-title">{title}</span>
        <span className="dashboard-nav-row-desc">{description}</span>
        {Array.isArray(badges) && badges.length ? (
          <span className="mt-3 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span
                key={badge}
                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                  BADGE_CLASS[badge] || "bg-sky-100 text-sky-800"
                }`}
              >
                {badge}
              </span>
            ))}
          </span>
        ) : null}
      </span>

      <span className="dashboard-nav-row-cta touch-button-primary" aria-hidden>
        دخول القسم
      </span>
    </Link>
  );
}
