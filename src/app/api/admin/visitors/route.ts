import { isAdminAuthenticated } from "@/src/lib/admin-auth";
import { getSupabaseAdmin } from "@/src/lib/supabase";

/**
 * GET /api/admin/visitors
 * Returns aggregate stats + a recent-visitor list from the visitor_logs
 * table, for the admin tracking dashboard.
 */

export const dynamic = "force-dynamic";

const FETCH_LIMIT = 1000;

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return Response.json(
      { error: "Supabase is not configured on the server." },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("visitor_logs")
    .select(
      "id, created_at, visitor_id, path, ip, browser, os, device, is_bot, referer, accept_language, country, country_code, region, city, latitude, longitude, timezone, isp, org, proxy_host, hosting",
    )
    .order("created_at", { ascending: false })
    .limit(FETCH_LIMIT);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  type Row = NonNullable<typeof data>[number];
  const rows = (data ?? []) as Row[];

  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const count = (fn: (r: Row) => boolean) => rows.filter(fn).length;
  const tally = (fn: (r: Row) => string | null) => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const k = fn(r);
      if (k) map.set(k, (map.get(k) ?? 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key, value]) => ({ key, value }));
  };

  const stats = {
    totalVisits: count(() => true),
    humanVisits: count((r) => !r.is_bot),
    totalBots: count((r) => r.is_bot),
    todayVisits: count(
      (r) => new Date(r.created_at).getTime() >= startOfToday.getTime(),
    ),
    weekVisits: count((r) => new Date(r.created_at).getTime() >= weekAgo),
    uniqueIps: new Set(rows.map((r) => r.ip).filter(Boolean)).size,
    uniqueVisitors: new Set(rows.map((r) => r.visitor_id).filter(Boolean)).size,
    topCountries: tally((r) =>
      r.country ? `${r.country}${r.country_code ? ` (${r.country_code})` : ""}` : null,
    ),
    topCities: tally((r) =>
      r.city ? `${r.city}${r.region ? `, ${r.region}` : ""}` : null,
    ),
    topPaths: tally((r) => r.path),
    topBrowsers: tally((r) => r.browser),
    topOs: tally((r) => r.os),
    topDevices: tally((r) => r.device),
    topReferrers: tally((r) => r.referer),
    topIsp: tally((r) => r.isp),
  };

  return Response.json({ stats, rows, limit: FETCH_LIMIT });
}
