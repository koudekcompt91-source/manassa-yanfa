import { SignJWT, jwtVerify } from "jose";
import { SESSION_MAX_AGE_SEC } from "./constants";

function getSecretKey() {
  const s = process.env.AUTH_SECRET || "";
  if (s.length >= 32) return new TextEncoder().encode(s);
  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode("development-default-secret-32chars!!");
  }
  throw new Error("AUTH_SECRET must be at least 32 characters in production");
}

export type SessionPayload = {
  sub: string;
  role: "STUDENT" | "ADMIN";
  email: string;
};

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SEC}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const sub = String(payload.sub || "");
    const role = payload.role as SessionPayload["role"];
    const email = String(payload.email || "");
    if (!sub || (role !== "STUDENT" && role !== "ADMIN") || !email) return null;
    return { sub, role, email };
  } catch {
    return null;
  }
}
