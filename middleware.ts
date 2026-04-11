import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/auth/constants";

function encodedSecret() {
  const s = process.env.AUTH_SECRET || "";
  if (s.length >= 32) return new TextEncoder().encode(s);
  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode("development-default-secret-32chars!!");
  }
  return new TextEncoder().encode("fallback-invalid-use-AUTH_SECRET-32+");
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  let role: string | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, encodedSecret());
      role = String(payload.role || "");
    } catch {
      role = null;
    }
  }

  if (path === "/login") {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (path.startsWith("/admin/login")) {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (path.startsWith("/admin")) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  if (path.startsWith("/dashboard")) {
    if (role !== "STUDENT") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (path === "/profile" || path.startsWith("/profile/")) {
    if (role !== "STUDENT") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard", "/dashboard/:path*", "/admin/:path*", "/profile", "/profile/:path*"],
};
