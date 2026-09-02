/** Student subscription helpers (UI redirect + access). Safe to import from client. */

export type SubscriptionType = "FREE" | "PAID";

export function normalizeSubscriptionType(value: unknown): SubscriptionType {
  return String(value || "").toUpperCase() === "FREE" ? "FREE" : "PAID";
}

/** Post-login / post-session home for students. */
export function getStudentHomePath(subscriptionType: unknown): "/free-dashboard" | "/dashboard" {
  return normalizeSubscriptionType(subscriptionType) === "FREE" ? "/free-dashboard" : "/dashboard";
}

export function isFreeSubscription(subscriptionType: unknown): boolean {
  return normalizeSubscriptionType(subscriptionType) === "FREE";
}

/**
 * Course visibility by subscription:
 * - PAID students see all courses
 * - FREE students see only courses with minSubscription === FREE (shared / "both")
 */
export function studentSeesCourseBySubscription(
  userSubscription: unknown,
  courseMinSubscription: unknown
): boolean {
  if (normalizeSubscriptionType(userSubscription) === "PAID") return true;
  return normalizeSubscriptionType(courseMinSubscription) === "FREE";
}
