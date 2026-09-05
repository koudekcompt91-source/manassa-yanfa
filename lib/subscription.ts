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
 * Within a learning system, gate by course.minSubscription:
 * - PAID students see all courses in that system
 * - FREE students see only minSubscription === FREE
 * Prefer Course.system for FREE vs PAID LMS isolation (enforced in APIs).
 */
export function studentSeesCourseBySubscription(
  userSubscription: unknown,
  courseMinSubscription: unknown
): boolean {
  if (normalizeSubscriptionType(userSubscription) === "PAID") return true;
  return normalizeSubscriptionType(courseMinSubscription) === "FREE";
}

/** Course.system / type isolation: FREE users → FREE only; PAID users → all systems. */
export function studentSeesCourseBySystem(userSubscription: unknown, courseSystem: unknown): boolean {
  if (normalizeSubscriptionType(userSubscription) === "PAID") return true;
  return normalizeSubscriptionType(courseSystem) === "FREE";
}
