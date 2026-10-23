import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

/**
 * Visitor tracking proxy (server-side, invisible to the visitor).
 *
 * The public site stays 100% unchanged - this file only observes real page
 * loads and forwards them to /api/track in the background via waitUntil,
 * without delaying the response.
 *
 * Skipped: API routes, Next internals, static files. Prefetched RSC requests
 * are skipped too so we log genuine visits only.
 */

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const response = NextResponse.next();

  const { pathname, origin } = request.nextUrl;
  // The admin panel itself is not part of public visitor analytics.
  if (pathname.startsWith("/admin")) return response;
  const isPrefetch =
    request.headers.has("next-router-prefetch") ||
    request.headers.get("purpose") === "prefetch";

  // Anonymous persistent visitor id (readable in the admin panel).
  let visitorId = request.cookies.get("sk_vid")?.value;
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    response.cookies.set("sk_vid", visitorId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 2,
      httpOnly: false,
      sameSite: "lax",
    });
  }

  if (!isPrefetch) {
    event.waitUntil(
      fetch(new URL("/api/track", origin), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          path: pathname,
          method: request.method,
          ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
          userAgent: request.headers.get("user-agent"),
          referer: request.headers.get("referer"),
          language: request.headers.get("accept-language"),
          visitorId,
          // Hosting platform geo hints (present on Vercel, harmless elsewhere)
          countryCode: request.headers.get("x-vercel-ip-country"),
          city: request.headers.get("x-vercel-ip-city"),
          latitude: request.headers.get("x-vercel-ip-latitude"),
          longitude: request.headers.get("x-vercel-ip-longitude"),
        }),
      }).catch(() => {}),
    );
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except API routes, Next internals and static assets.
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|mjs|woff|woff2|txt|xml)$).*)",
  ],
};
