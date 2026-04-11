import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_MAX_AGE_SEC } from "./constants";
import { signSessionToken, verifySessionToken, type SessionPayload } from "./jwt";

export async function setSessionCookie(payload: SessionPayload) {
  const token = await signSessionToken(payload);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
}

export function clearSessionCookie() {
  cookies().set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
