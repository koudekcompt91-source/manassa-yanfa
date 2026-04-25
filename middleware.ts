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

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; frame-ancestors 'self'; img-src 'self' data: blob: https:; media-src 'self' blob: https:; connect-src 'self' https: wss:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://zoom.us https://*.zoom.us;"
  );
  return response;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect admin APIs with explicit 401/403.
  if (path.startsWith("/api/admin/") && path !== "/api/admin/login") {
    const adminRole = await roleFromCookie(request, ADMIN_SESSION_COOKIE, "ADMIN");
    if (adminRole === "ADMIN") return applySecurityHeaders(NextResponse.next());

    const studentRole = await roleFromCookie(request, STUDENT_SESSION_COOKIE, "STUDENT");
    if (studentRole === "STUDENT") {
      return applySecurityHeaders(
        NextResponse.json({ ok: false, message: "غير مصرح لك بهذه العملية." }, { status: 403 })
      );
    }
    return applySecurityHeaders(
      NextResponse.json({ ok: false, message: "يجب تسجيل الدخول أولًا." }, { status: 401 })
    );
  }

  if (path.startsWith("/admin/login")) {
    const adminRole = await roleFromCookie(request, ADMIN_SESSION_COOKIE, "ADMIN");
    if (adminRole === "ADMIN") {
      return applySecurityHeaders(NextResponse.redirect(new URL("/admin/dashboard", request.url)));
    }
    return applySecurityHeaders(NextResponse.next());
  }

  if (path.startsWith("/admin")) {
    const adminRole = await roleFromCookie(request, ADMIN_SESSION_COOKIE, "ADMIN");
    if (adminRole !== "ADMIN") {
      return applySecurityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
    }
    return applySecurityHeaders(NextResponse.next());
  }

  if (path === "/login") {
    const studentRole = await roleFromCookie(request, STUDENT_SESSION_COOKIE, "STUDENT");
    if (studentRole === "STUDENT") {
      return applySecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
    }
    return applySecurityHeaders(NextResponse.next());
  }

  if (path.startsWith("/dashboard") || path === "/profile" || path.startsWith("/profile/")) {
    const studentRole = await roleFromCookie(request, STUDENT_SESSION_COOKIE, "STUDENT");
    if (studentRole !== "STUDENT") {
      return applySecurityHeaders(NextResponse.redirect(new URL("/login", request.url)));
    }
    return applySecurityHeaders(NextResponse.next());
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.jpg).*)"],
};
