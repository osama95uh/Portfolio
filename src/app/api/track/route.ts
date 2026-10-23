import { lookupGeo, parseUserAgent } from "@/src/lib/geo";
import { getSupabaseAdmin } from "@/src/lib/supabase";

/**
 * Visitor tracking endpoint. Receives one beacon per real page load, fired
 * non-blocking from src/proxy.ts (event.waitUntil), so it never delays the
 * visitor's response.
 *
 * Collects everything reachable without any client-side JavaScript:
 *   IP, geo lookup of the IP (country / region / city / latitude / longitude /
 *   timezone / ISP), user agent (browser / OS / device), bot detection,
 *   referer, accept-language, visited path and an anonymous long-lived
 *   visitor id (sk_vid cookie set by the proxy).
 *
 * If Vercel geo headers are present those are preferred over the IP lookup.
 * Tracking is fully silent: if Supabase is not configured this always
 * answers 204 and the site works exactly as without it.
 */

export const dynamic = "force-dynamic";

type TrackPayload = {
  path?: string;
  method?: string;
  ip?: string | null;
  userAgent?: string | null;
  referer?: string | null;
  language?: string | null;
  visitorId?: string | null;
  /* Pre-computed geo hints from the hosting platform (optional). */
  countryCode?: string | null;
  city?: string | null;
  latitude?: string | null;
  longitude?: string | null;
};

const num = (v: string | null | undefined): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return new Response(null, { status: 204 });

  let payload: TrackPayload;
  try {
    payload = (await request.json()) as TrackPayload;
  } catch {
    return new Response(null, { status: 204 });
  }

  try {
    const ua = parseUserAgent(payload.userAgent);
    const ip = payload.ip || null;

    let geo = await lookupGeo(ip);
    const lat = num(payload.latitude) ?? geo.latitude;
    const lon = num(payload.longitude) ?? geo.longitude;
    if (payload.countryCode) {
      geo = {
        ...geo,
        country_code: payload.countryCode,
        city: payload.city ?? geo.city,
        latitude: lat ?? undefined,
        longitude: lon ?? undefined,
      };
    }

    await supabase.from("visitor_logs").insert({
      visitor_id: payload.visitorId ?? null,
      path: payload.path ?? null,
      method: payload.method ?? "GET",
      ip,
      user_agent: payload.userAgent ?? null,
      browser: ua.browser,
      os: ua.os,
      device: ua.device,
      is_bot: ua.isBot,
      referer: payload.referer ?? null,
      accept_language: payload.language ?? null,
      country: geo.country ?? null,
      country_code: geo.country_code ?? null,
      region: geo.region ?? null,
      city: geo.city ?? null,
      latitude: lat,
      longitude: lon,
      timezone: geo.timezone ?? null,
      isp: geo.isp ?? null,
      org: geo.org ?? null,
      proxy_host: geo.proxyhost ?? null,
      hosting: geo.hosting ?? null,
    });
  } catch {
    // Never leak tracking errors - the visitor-facing site is untouched.
  }

  return new Response(null, { status: 204 });
}
