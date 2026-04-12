import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  STUDENT_SESSION_COOKIE,
  ADMIN_SESSION_COOKIE,
  SESSION_MAX_AGE_SEC,
} from "./constants";
import { signSessionToken, verifySessionToken, type SessionPayload } from "./jwt";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

function cookieNameForRole(role: "STUDENT" | "ADMIN") {
  return role === "ADMIN" ? ADMIN_SESSION_COOKIE : STUDENT_SESSION_COOKIE;
}

/** Set the correct session cookie based on the payload role. */
export async function setSessionCookie(
  response: NextResponse,
  payload: SessionPayload,
): Promise<void> {
  const token = await signSessionToken(payload);
  response.cookies.set(cookieNameForRole(payload.role), token, {
    ...COOKIE_OPTS,
    maxAge: SESSION_MAX_AGE_SEC,
  });
}

/** Clear the opposite role's cookie so sessions never collide. */
export function clearOtherSessionCookie(
  response: NextResponse,
  keepRole: "STUDENT" | "ADMIN",
): void {
  const other = keepRole === "ADMIN" ? STUDENT_SESSION_COOKIE : ADMIN_SESSION_COOKIE;
  response.cookies.set(other, "", { ...COOKIE_OPTS, maxAge: 0 });
}

/** Clear both session cookies. */
export function clearAllSessionCookies(response: NextResponse): void {
  response.cookies.set(STUDENT_SESSION_COOKIE, "", { ...COOKIE_OPTS, maxAge: 0 });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { ...COOKIE_OPTS, maxAge: 0 });
}

/** Read student session from request cookies. */
export async function getStudentSessionFromCookies(): Promise<SessionPayload | null> {
  try {
    const token = cookies().get(STUDENT_SESSION_COOKIE)?.value;
    if (!token) return null;
    const session = await verifySessionToken(token);
    if (session && session.role !== "STUDENT") return null;
    return session;
  } catch {
    return null;
  }
}

/** Read admin session from request cookies. */
export async function getAdminSessionFromCookies(): Promise<SessionPayload | null> {
  try {
    const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
    if (!token) return null;
    const session = await verifySessionToken(token);
    if (session && session.role !== "ADMIN") return null;
    return session;
  } catch {
    return null;
  }
}
