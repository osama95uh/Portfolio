import {
  LoginRateLimiter,
  adminSessionCookieHeader,
  checkAdminPassword,
  isLoginConfigured,
} from "@/src/lib/admin-auth";

/**
 * POST /api/admin/login  { password: string }
 * Correct password -> HttpOnly signed session cookie (7 days).
 */

export const dynamic = "force-dynamic";

const limiter = new LoginRateLimiter();

export async function POST(request: Request) {
  if (!isLoginConfigured()) {
    return Response.json(
      {
        error:
          "ADMIN_PASSWORD is not set on the server. Add it to your environment variables first.",
      },
      { status: 503 },
    );
  }

  // Brute-force guard (per IP, 8 tries / 10 minutes).
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limiter.isBlocked(ip)) {
    return Response.json(
      { error: "Too many failed attempts. Try again later." },
      { status: 429 },
    );
  }

  let password: unknown = null;
  try {
    password = (await request.json())?.password;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!checkAdminPassword(password)) {
    limiter.recordFailure(ip);
    return Response.json({ error: "Wrong password." }, { status: 401 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "Set-Cookie": adminSessionCookieHeader(),
    },
  });
}
