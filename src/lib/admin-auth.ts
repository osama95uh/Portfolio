import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Minimal password-based login for the /admin panel.
 *
 * - Password lives in the ADMIN_PASSWORD environment variable.
 * - On successful login a signed, HttpOnly session cookie is issued.
 * - The session is signed with a key derived from the password itself, so
 *   changing ADMIN_PASSWORD instantly invalidates every old session.
 */

export const ADMIN_COOKIE = "sk_admin_session";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

function sessionSecret(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return createHash("sha256")
    .update(`sk-admin-session::${password}`)
    .digest("hex");
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function isLoginConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function createAdminToken(): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const expiry = (Date.now() + SESSION_TTL_SECONDS * 1000).toString(36);
  return `${expiry}.${sign(expiry, secret)}`;
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  const secret = sessionSecret();
  if (!secret || !token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = sign(payload, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const expiryMs = parseInt(payload, 36);
  return Number.isFinite(expiryMs) && expiryMs > Date.now();
}

/** Reads + verifies the session cookie (server components & route handlers). */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifyAdminToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

/** Constant-time password check for the login route. */
export function checkAdminPassword(candidate: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof candidate !== "string" || candidate.length === 0) {
    return false;
  }
  const a = createHash("sha256").update(candidate).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export function adminSessionCookieHeader(): string {
  const token = createAdminToken() as string;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
}

export function adminLogoutCookieHeader(): string {
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

/** Small in-memory brute-force guard for the login route. */
export class LoginRateLimiter {
  private hits = new Map<string, { count: number; windowStart: number }>();

  constructor(
    private maxAttempts = 8,
    private windowMs = 10 * 60 * 1000,
  ) {}

  isBlocked(key: string): boolean {
    const entry = this.hits.get(key);
    if (!entry) return false;
    if (Date.now() - entry.windowStart > this.windowMs) {
      this.hits.delete(key);
      return false;
    }
    return entry.count >= this.maxAttempts;
  }

  recordFailure(key: string): void {
    const entry = this.hits.get(key);
    if (!entry || Date.now() - entry.windowStart > this.windowMs) {
      this.hits.set(key, { count: 1, windowStart: Date.now() });
      return;
    }
    entry.count += 1;
  }
}
