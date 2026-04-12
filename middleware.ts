import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { STUDENT_SESSION_COOKIE, ADMIN_SESSION_COOKIE } from "@/lib/auth/constants";

function encodedSecret(): Uint8Array | null {
  const s = process.env.AUTH_SECRET || "";
  if (s.length >= 32) return new TextEncoder().encode(s);
  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode("development-default-secret-32chars!!");
  }
  return null;
}

async function roleFromCookie(
  request: NextRequest,
  cookieName: string,
  expectedRole: string,
): Promise<string | null> {
  const token = request.cookies.get(cookieName)?.value;
  if (!token) return null;
  const secret = encodedSecret();
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    const role = String(payload.role || "");
    return role === expectedRole ? role : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith("/admin/login")) {
    const adminRole = await roleFromCookie(request, ADMIN_SESSION_COOKIE, "ADMIN");
    if (adminRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (path.startsWith("/admin")) {
    const adminRole = await roleFromCookie(request, ADMIN_SESSION_COOKIE, "ADMIN");
    if (adminRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  if (path === "/login") {
    const studentRole = await roleFromCookie(request, STUDENT_SESSION_COOKIE, "STUDENT");
    if (studentRole === "STUDENT") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (path.startsWith("/dashboard") || path === "/profile" || path.startsWith("/profile/")) {
    const studentRole = await roleFromCookie(request, STUDENT_SESSION_COOKIE, "STUDENT");
    if (studentRole !== "STUDENT") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard", "/dashboard/:path*", "/admin/:path*", "/profile", "/profile/:path*"],
};
