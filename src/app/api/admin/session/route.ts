import { NextRequest, NextResponse } from "next/server";
import { adminCookieName, adminCookieOptions, createAdminSession, isAdminAuthenticated, verifyAdminPassword } from "@/lib/security/admin-auth";
import { getClientIp, takeRateLimit } from "@/lib/security/rate-limit";

export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: isAdminAuthenticated(request) });
}

export async function POST(request: NextRequest) {
  const rate = takeRateLimit(`admin-login:${getClientIp(request)}`, 5, 15 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "too_many_attempts" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
    );
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 4096) return NextResponse.json({ error: "request_too_large" }, { status: 413 });

  const body = await request.json().catch(() => null) as { password?: unknown } | null;
  if (!verifyAdminPassword(body?.password)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const session = createAdminSession();
  if (!session) return NextResponse.json({ error: "admin_password_must_be_at_least_16_characters" }, { status: 503 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName(), session, adminCookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName(), "", adminCookieOptions(0));
  return response;
}
