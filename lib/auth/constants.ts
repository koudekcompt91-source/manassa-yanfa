export const STUDENT_SESSION_COOKIE = "yanfa_student_session";
export const ADMIN_SESSION_COOKIE = "yanfa_admin_session";
/** Routing hint only (not JWT). Lets middleware separate FREE vs PAID without changing session tokens. */
export const STUDENT_SUBSCRIPTION_COOKIE = "yanfa_student_subscription";
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days
