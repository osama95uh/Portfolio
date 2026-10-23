import { adminLogoutCookieHeader } from "@/src/lib/admin-auth";

/** POST /api/admin/logout - clears the admin session cookie. */
export const dynamic = "force-dynamic";

export async function POST() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "Set-Cookie": adminLogoutCookieHeader(),
    },
  });
}
