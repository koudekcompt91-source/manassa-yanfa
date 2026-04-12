import { NextResponse } from "next/server";
import { clearAllSessionCookies } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearAllSessionCookies(response);
  return response;
}
