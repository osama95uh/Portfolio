/**
 * Visitor enrichment helpers used by the tracking system.
 * - Server-side IP geolocation (country/city/GEO coordinates/ISP) via
 *   ip-api.com (free, no key needed; ~45 req/min). Results are cached in
 *   memory so each unique IP is only looked up once per server process.
 * - Lightweight user-agent parsing (browser / OS / device / bot detection).
 */

export type GeoInfo = {
  country?: string;
  country_code?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  proxyhost?: boolean;
  hosting?: boolean;
};

export type ParsedUa = {
  browser: string;
  os: string;
  device: string;
  isBot: boolean;
};

const geoCache = new Map<string, { info: GeoInfo; ts: number }>();
const GEO_CACHE_MAX = 2000;
const GEO_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h
const GEO_LOOKUP_TIMEOUT_MS = 2500;

const isPrivate = (ip: string): boolean =>
  /^(10\.|127\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1$|localhost$|fc00:|fe80:)/i.test(
    ip,
  );

export async function lookupGeo(ip: string | null | undefined): Promise<GeoInfo> {
  if (!ip || isPrivate(ip)) return {};

  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.ts < GEO_CACHE_TTL_MS) return cached.info;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEO_LOOKUP_TIMEOUT_MS);

  try {
    const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,countryCode,regionName,city,lat,lon,timezone,isp,org,proxy,hosting`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return {};
    const json = (await res.json()) as Record<string, unknown>;

    const info: GeoInfo = {};
    if (json.status === "success") {
      if (typeof json.country === "string") info.country = json.country;
      if (typeof json.countryCode === "string")
        info.country_code = json.countryCode;
      if (typeof json.regionName === "string") info.region = json.regionName;
      if (typeof json.city === "string") info.city = json.city;
      if (typeof json.lat === "number") info.latitude = json.lat;
      if (typeof json.lon === "number") info.longitude = json.lon;
      if (typeof json.timezone === "string") info.timezone = json.timezone;
      if (typeof json.isp === "string") info.isp = json.isp;
      if (typeof json.org === "string") info.org = json.org;
      if (typeof json.proxy === "boolean") info.proxyhost = json.proxy;
      if (typeof json.hosting === "boolean") info.hosting = json.hosting;
    }

    if (geoCache.size >= GEO_CACHE_MAX) {
      const oldest = geoCache.keys().next().value;
      if (oldest) geoCache.delete(oldest);
    }
    geoCache.set(ip, { info, ts: Date.now() });
    return info;
  } catch {
    // Silent: tracking must never break or slow down the site.
    return {};
  } finally {
    clearTimeout(timer);
  }
}

const BOT_PATTERN =
  /bot|crawl|spider|slurp|semrush|ahrefs|mj12|dotbot|petalbot|headless|python-requests|curl|wget|lighthouse|preview|monitor|uptime|facebookexternalhit|whatsapp|telegrambot|discordbot/i;

export function parseUserAgent(ua: string | null | undefined): ParsedUa {
  const blank: ParsedUa = { browser: "Unknown", os: "Unknown", device: "Unknown", isBot: false };
  if (!ua) return blank;
  const s = ua.toLowerCase();

  const isBot = BOT_PATTERN.test(s);
  if (isBot) {
    return { browser: "Bot/Crawler", os: "Unknown", device: "Bot", isBot: true };
  }

  let browser = "Other";
  if (s.includes("edg/") || s.includes("edge")) browser = "Edge";
  else if (s.includes("opr/") || s.includes("opera")) browser = "Opera";
  else if (s.includes("chrome") && !s.includes("chromium")) browser = "Chrome";
  else if (s.includes("firefox")) browser = "Firefox";
  else if (s.includes("safari") && (s.includes("version/") || !s.includes("chrome")))
    browser = "Safari";
  else if (s.includes("chromium")) browser = "Chromium";

  let os = "Other";
  if (s.includes("windows")) os = "Windows";
  else if (s.includes("android")) os = "Android";
  else if (s.includes("iphone") || s.includes("ipad") || s.includes("ipod")) os = "iOS";
  else if (s.includes("mac os") || s.includes("macintosh")) os = "macOS";
  else if (s.includes("linux") && !s.includes("android")) os = "Linux";

  let device = "Desktop";
  if (s.includes("ipad") || (s.includes("tablet") && !s.includes("android"))) device = "Tablet";
  else if (s.includes("mobile") || s.includes("android") || s.includes("iphone")) device = "Mobile";

  return { browser, os, device, isBot: false };
}
