import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

const SESSION_TTL_SECONDS = 12 * 60 * 60;

export function adminCookieName(): string {
  return process.env.NODE_ENV === "production" ? "__Host-akhtam_admin" : "akhtam_admin";
}

function safeEqual(left: string, right: string): boolean {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

function getAdminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD?.trim();
  return password && password.length >= 16 ? password : null;
}

function sign(payload: string, password: string): string {
  return createHmac("sha256", `akhtam-admin-session:${password}`).update(payload).digest("base64url");
}

export function verifyAdminPassword(candidate: unknown): boolean {
  const password = getAdminPassword();
  return typeof candidate === "string" && !!password && safeEqual(candidate, password);
}

export function createAdminSession(): string | null {
  const password = getAdminPassword();
  if (!password) return null;

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = Buffer.from(JSON.stringify({ expiresAt, nonce: randomBytes(16).toString("base64url") })).toString("base64url");
  return `${payload}.${sign(payload, password)}`;
}

export function isAdminAuthenticated(request: NextRequest): boolean {
  const password = getAdminPassword();
  const token = request.cookies.get(adminCookieName())?.value;
  if (!password || !token) return false;

  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra || !safeEqual(signature, sign(payload, password))) return false;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { expiresAt?: unknown };
    return typeof decoded.expiresAt === "number" && decoded.expiresAt > Date.now() / 1000;
  } catch {
    return false;
  }
}

export function adminCookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge,
  };
}
