import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE_SEC } from "./constants";
import { signSessionToken, verifySessionToken, type SessionPayload } from "./jwt";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

/**
 * Write session cookie directly onto a NextResponse.
 * This bypasses the unreliable cookies()-from-next/headers write path.
 */
export async function setSessionCookie(
  response: NextResponse,
  payload: SessionPayload,
): Promise<void> {
  const token = await signSessionToken(payload);
  response.cookies.set(SESSION_COOKIE, token, {
    ...COOKIE_OPTS,
    maxAge: SESSION_MAX_AGE_SEC,
  });
}

/** Clear session cookie on a NextResponse. */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", { ...COOKIE_OPTS, maxAge: 0 });
}

/** Read session from request cookies (read-only — safe with cookies()). */
export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}
